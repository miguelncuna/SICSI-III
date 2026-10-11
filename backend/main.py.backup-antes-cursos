from pathlib import Path
import json
import hashlib
import secrets
from datetime import datetime

from fastapi.responses import StreamingResponse
from reportlab.platypus import SimpleDocTemplate
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)


app = FastAPI(
    title="SICSI III API",
    version="1.0.0",
    description="API da plataforma SICSI III",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
FILES = {
    "users": DATA_DIR / "users.json",
    "courses": DATA_DIR / "courses.json",
    "assessments": DATA_DIR / "assessments.json",
    "simulations": DATA_DIR / "simulations.json",
    "certificates": DATA_DIR / "certificates.json",
}


def read_json(name):
    path = FILES[name]

    if not path.exists():
        path.write_text("[]", encoding="utf-8")

    try:
        return json.loads(path.read_text(encoding="utf-8-sig"))
    except Exception:
        return []


def write_json(name, data):
    FILES[name].write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def password_hash(password):
    return hashlib.pbkdf2_hmac(
        "sha256",
        password.encode(),
        b"sicsi-iii",
        120000,
    ).hex()


def make_id(prefix):
    return f"{prefix}_{secrets.token_hex(6)}"


def now():
    return datetime.now().isoformat(timespec="seconds")


class RegisterBody(BaseModel):
    name: str
    email: str
    password: str


class LoginBody(BaseModel):
    email: str
    password: str


class CourseBody(BaseModel):
    title: str
    description: str = ""
    published: bool = True


class LessonBody(BaseModel):
    title: str
    video_url: str


class QuestionBody(BaseModel):
    question: str
    options: list[str]
    correct_answer: int
    explanation: str = ""


class EnrollmentBody(BaseModel):
    user_id: str


class CompletionBody(BaseModel):
    user_id: str
    lesson_id: str


class TestBody(BaseModel):
    user_id: str
    answers: list[str]


class PromoteBody(BaseModel):
    role: str


# ============================================================
# FORÇAR UTF-8 NAS RESPOSTAS HTTP
# ============================================================

@app.middleware("http")
async def force_utf8_response(request, call_next):
    response = await call_next(request)

    content_type = response.headers.get("content-type", "")

    if content_type.startswith("application/json") and "charset=" not in content_type.lower():
        response.headers["content-type"] = "application/json; charset=utf-8"

    elif content_type.startswith("text/") and "charset=" not in content_type.lower():
        response.headers["content-type"] = f"{content_type}; charset=utf-8"

    return response

@app.get("/")
def root():
    return {
        "name": "SICSI III API",
        "status": "online",
        "version": "1.0.0",
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "sicsi-backend",
    }


@app.get("/api/data/status")
def data_status():
    return {
        "status": "ok",
        "files": {
            key: path.exists()
            for key, path in FILES.items()
        },
    }


# ============================================================
# AUTH
# ============================================================

@app.post("/api/auth/register")
def register(body: RegisterBody):
    users = read_json("users")

    email = body.email.strip().lower()

    if any(u["email"].lower() == email for u in users):
        raise HTTPException(
            status_code=400,
            detail="Este email já está registado.",
        )

    user = {
        "id": make_id("usr"),
        "name": body.name.strip(),
        "email": email,
        "password_hash": password_hash(body.password),
        "role": "student",
        "initial_assessment_completed": False,
        "awareness_level": None,
        "assessment_score": None,
        "recommendations": [],
        "enrolled_courses": [],
        "completed_lessons": {},
        "completed_courses": [],
        "simulation_results": {},
        "created_at": now(),
    }

    users.append(user)
    write_json("users", users)

    safe = {
        k: v
        for k, v in user.items()
        if k != "password_hash"
    }

    return {"user": safe}


@app.post("/api/auth/login")
def login(body: LoginBody):
    users = read_json("users")

    email = body.email.strip().lower()

    user = next(
        (
            u for u in users
            if u["email"].lower() == email
        ),
        None,
    )

    if not user or user.get("password_hash") != password_hash(body.password):
        raise HTTPException(
            status_code=401,
            detail="Email ou palavra-passe incorrectos.",
        )

    safe = {
        k: v
        for k, v in user.items()
        if k != "password_hash"
    }

    return {
        "user": safe,
        "token": secrets.token_urlsafe(24),
    }


@app.get("/api/users")
def get_users():
    users = read_json("users")

    return [
        {
            k: v
            for k, v in user.items()
            if k != "password_hash"
        }
        for user in users
    ]


@app.patch("/api/users/{user_id}/role")
def change_role(user_id: str, body: PromoteBody):
    if body.role not in ["student", "admin"]:
        raise HTTPException(
            status_code=400,
            detail="Função inválida.",
        )

    users = read_json("users")

    user = next(
        (u for u in users if u["id"] == user_id),
        None,
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Utilizador não encontrado.",
        )

    user["role"] = body.role

    write_json("users", users)

    return {
        k: v
        for k, v in user.items()
        if k != "password_hash"
    }


# ============================================================
# COURSES
# ============================================================

def course_public(course):
    lessons = course.get("lessons", [])
    questions = course.get("questions", [])

    return {
        **course,
        "lessons_count": len(lessons),
        "questions_count": len(questions),
    }


@app.get("/api/courses")
def get_courses():
    courses = read_json("courses")

    return [
        course_public(c)
        for c in courses
        if c.get("published", True)
    ]


@app.get("/api/admin/courses")
def admin_courses():
    return [
        course_public(c)
        for c in read_json("courses")
    ]


@app.get("/api/courses/{course_id}")
def get_course(course_id: str):
    courses = read_json("courses")

    course = next(
        (c for c in courses if c["id"] == course_id),
        None,
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Curso não encontrado.",
        )

    return course_public(course)


@app.post("/api/admin/courses")
def create_course(body: CourseBody):
    courses = read_json("courses")

    course = {
        "id": make_id("course"),
        "title": body.title.strip(),
        "description": body.description.strip(),
        "published": body.published,
        "lessons": [],
        "questions": [],
        "created_at": now(),
        "updated_at": now(),
    }

    courses.append(course)
    write_json("courses", courses)

    return course_public(course)


@app.put("/api/admin/courses/{course_id}")
def update_course(course_id: str, body: CourseBody):
    courses = read_json("courses")

    course = next(
        (c for c in courses if c["id"] == course_id),
        None,
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Curso não encontrado.",
        )

    course["title"] = body.title.strip()
    course["description"] = body.description.strip()
    course["published"] = body.published
    course["updated_at"] = now()

    write_json("courses", courses)

    return course_public(course)


@app.delete("/api/admin/courses/{course_id}")
def delete_course(course_id: str):
    courses = read_json("courses")

    original = len(courses)

    courses = [
        c for c in courses
        if c["id"] != course_id
    ]

    if len(courses) == original:
        raise HTTPException(
            status_code=404,
            detail="Curso não encontrado.",
        )

    write_json("courses", courses)

    return {"status": "deleted"}


# ============================================================
# LESSONS / VIDEOS
# ============================================================

@app.post("/api/admin/courses/{course_id}/lessons")
def add_lesson(course_id: str, body: LessonBody):
    courses = read_json("courses")

    course = next(
        (c for c in courses if c["id"] == course_id),
        None,
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Curso não encontrado.",
        )

    lesson = {
        "id": make_id("lesson"),
        "title": body.title.strip(),
        "video_url": body.video_url.strip(),
        "order": len(course["lessons"]) + 1,
    }

    course["lessons"].append(lesson)
    course["updated_at"] = now()

    write_json("courses", courses)

    return lesson


@app.put("/api/admin/courses/{course_id}/lessons/{lesson_id}")
def update_lesson(
    course_id: str,
    lesson_id: str,
    body: LessonBody,
):
    courses = read_json("courses")

    course = next(
        (c for c in courses if c["id"] == course_id),
        None,
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Curso não encontrado.",
        )

    lesson = next(
        (
            l for l in course["lessons"]
            if l["id"] == lesson_id
        ),
        None,
    )

    if not lesson:
        raise HTTPException(
            status_code=404,
            detail="Aula não encontrada.",
        )

    lesson["title"] = body.title.strip()
    lesson["video_url"] = body.video_url.strip()

    write_json("courses", courses)

    return lesson


@app.delete("/api/admin/courses/{course_id}/lessons/{lesson_id}")
def delete_lesson(course_id: str, lesson_id: str):
    courses = read_json("courses")

    course = next(
        (c for c in courses if c["id"] == course_id),
        None,
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Curso não encontrado.",
        )

    course["lessons"] = [
        l for l in course["lessons"]
        if l["id"] != lesson_id
    ]

    for index, lesson in enumerate(
        course["lessons"],
        start=1,
    ):
        lesson["order"] = index

    write_json("courses", courses)

    return {"status": "deleted"}


# ============================================================
# QUESTIONS
# ============================================================

@app.post("/api/admin/courses/{course_id}/questions")
def add_question(course_id: str, body: QuestionBody):
    courses = read_json("courses")

    course = next(
        (c for c in courses if c["id"] == course_id),
        None,
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Curso não encontrado.",
        )

    if len(body.options) < 2:
        raise HTTPException(
            status_code=400,
            detail="A pergunta precisa de pelo menos duas opções.",
        )

    if body.correct_answer < 0 or body.correct_answer >= len(body.options):
        raise HTTPException(
            status_code=400,
            detail="Resposta correcta inválida.",
        )

    question = {
        "id": make_id("question"),
        "question": body.question.strip(),
        "options": body.options,
        "correct_answer": body.correct_answer,
        "explanation": body.explanation.strip(),
    }

    course["questions"].append(question)

    write_json("courses", courses)

    return question


@app.put("/api/admin/courses/{course_id}/questions/{question_id}")
def update_question(
    course_id: str,
    question_id: str,
    body: QuestionBody,
):
    courses = read_json("courses")

    course = next(
        (c for c in courses if c["id"] == course_id),
        None,
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Curso não encontrado.",
        )

    question = next(
        (
            q for q in course["questions"]
            if q["id"] == question_id
        ),
        None,
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Pergunta não encontrada.",
        )

    question.update({
        "question": body.question.strip(),
        "options": body.options,
        "correct_answer": body.correct_answer,
        "explanation": body.explanation.strip(),
    })

    write_json("courses", courses)

    return question


@app.delete("/api/admin/courses/{course_id}/questions/{question_id}")
def delete_question(course_id: str, question_id: str):
    courses = read_json("courses")

    course = next(
        (c for c in courses if c["id"] == course_id),
        None,
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Curso não encontrado.",
        )

    course["questions"] = [
        q for q in course["questions"]
        if q["id"] != question_id
    ]

    write_json("courses", courses)

    return {"status": "deleted"}


# ============================================================
# STUDENT LEARNING
# ============================================================

@app.post("/api/courses/{course_id}/enroll")
def enroll(course_id: str, body: EnrollmentBody):
    users = read_json("users")
    courses = read_json("courses")

    user = next(
        (u for u in users if u["id"] == body.user_id),
        None,
    )

    course = next(
        (c for c in courses if c["id"] == course_id),
        None,
    )

    if not user or not course:
        raise HTTPException(
            status_code=404,
            detail="Utilizador ou curso não encontrado.",
        )

    if course_id not in user["enrolled_courses"]:
        user["enrolled_courses"].append(course_id)

    write_json("users", users)

    return {
        "user": {
            k: v
            for k, v in user.items()
            if k != "password_hash"
        }
    }


@app.post("/api/courses/{course_id}/lessons/{lesson_id}/complete")
def complete_lesson(
    course_id: str,
    lesson_id: str,
    body: CompletionBody,
):
    users = read_json("users")
    courses = read_json("courses")

    user = next(
        (u for u in users if u["id"] == body.user_id),
        None,
    )

    course = next(
        (c for c in courses if c["id"] == course_id),
        None,
    )

    if not user or not course:
        raise HTTPException(
            status_code=404,
            detail="Dados não encontrados.",
        )

    completed = user["completed_lessons"].setdefault(
        course_id,
        [],
    )

    if lesson_id not in completed:
        completed.append(lesson_id)

    if (
        len(completed) == len(course["lessons"])
        and course_id not in user["completed_courses"]
    ):
        user["completed_courses"].append(course_id)

    write_json("users", users)

    return {
        "completed_lessons": completed,
        "course_completed":
            course_id in user["completed_courses"],
    }


@app.post("/api/courses/{course_id}/test")
def submit_test(course_id: str, body: TestBody):
    users = read_json("users")
    courses = read_json("courses")
    certificates = read_json("certificates")

    user = next(
        (u for u in users if u["id"] == body.user_id),
        None,
    )

    course = next(
        (c for c in courses if c["id"] == course_id),
        None,
    )

    if not user or not course:
        raise HTTPException(
            status_code=404,
            detail="Dados não encontrados.",
        )

    questions = course.get("questions", [])

    if len(questions) != 10:
        raise HTTPException(
            status_code=400,
            detail="O curso precisa ter exactamente 10 perguntas no teste final.",
        )

    score = 0
    feedback = []
    submitted_answers = []

    for index, question in enumerate(questions):
        answer = (
            body.answers[index]
            if index < len(body.answers)
            else ""
        )

        answer = str(answer)
        correct_answer = str(question["correct_answer"])
        correct = answer == correct_answer

        if correct:
            score += 1

        submitted_answers.append(answer)

        feedback.append({
            "question": question["question"],
            "correct": correct,
            "explanation": question["explanation"],
        })

    percentage = round((score / len(questions)) * 100)
    passed = percentage >= 70

    user.setdefault("test_results", {})
    user["test_results"].setdefault(
        course_id,
        {
            "attempts": [],
            "last_result": None,
        },
    )

    result = {
        "score": score,
        "total_questions": len(questions),
        "percentage": percentage,
        "passed": passed,
        "answers": submitted_answers,
        "feedback": feedback,
        "submitted_at": now(),
    }

    user["test_results"][course_id]["attempts"].append(result)
    user["test_results"][course_id]["last_result"] = result

    certificate = None

    if passed:
        if course_id not in user.setdefault("completed_courses", []):
            user["completed_courses"].append(course_id)

        existing = next(
            (
                c for c in certificates
                if c["user_id"] == user["id"]
                and c["course_id"] == course_id
            ),
            None,
        )

        if not existing:
            certificate = {
                "id": make_id("cert"),
                "user_id": user["id"],
                "course_id": course_id,
                "student_name": user["name"],
                "course_title": course["title"],
                "score": percentage,
                "percentage": percentage,
                "certificate_code": make_id("SICSI"),
                "issued_at": now(),
            }

            certificates.append(certificate)
        else:
            certificate = existing

    write_json("users", users)
    write_json("certificates", certificates)

    return {
        "score": score,
        "total_questions": len(questions),
        "percentage": percentage,
        "passed": passed,
        "feedback": feedback,
        "certificate": certificate,
        "attempts": user["test_results"][course_id]["attempts"],
        "last_result": user["test_results"][course_id]["last_result"],
    }

# ============================================================
# ============================================================
# TEST RESULTADOS E CERTIFICADOS
# ============================================================

@app.get("/api/courses/{course_id}/test/{user_id}")
def get_test_result(course_id: str, user_id: str):
    users = read_json("users")

    user = next(
        (u for u in users if u["id"] == user_id),
        None,
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Utilizador não encontrado.",
        )

    test_results = user.get("test_results", {})
    course_result = test_results.get(course_id)

    if not course_result:
        return {
            "has_result": False,
            "attempts": [],
            "last_result": None,
        }

    return {
        "has_result": True,
        "attempts": course_result.get("attempts", []),
        "last_result": course_result.get("last_result"),
    }


@app.get("/api/certificates/{certificate_id}")
def get_certificate(certificate_id: str):
    certificates = read_json("certificates")

    certificate = next(
        (
            c for c in certificates
            if c["id"] == certificate_id
        ),
        None,
    )

    if not certificate:
        raise HTTPException(
            status_code=404,
            detail="Certificado não encontrado.",
        )

    return certificate


@app.get("/api/certificates/{certificate_id}/pdf")
def certificate_pdf(certificate_id: str):
    certificates = read_json("certificates")

    certificate = next(
        (
            c for c in certificates
            if c["id"] == certificate_id
        ),
        None,
    )

    if not certificate:
        raise HTTPException(
            status_code=404,
            detail="Certificado não encontrado.",
        )

    try:
        from io import BytesIO
        from reportlab.lib.pagesizes import A4, landscape
        from reportlab.lib import colors
        from reportlab.lib.enums import TA_CENTER
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.pdfgen import canvas

        buffer = BytesIO()

        page_width, page_height = landscape(A4)

        pdf = canvas.Canvas(
            buffer,
            pagesize=(page_width, page_height),
        )

        # Fundo
        pdf.setFillColor(colors.HexColor("#f8fafc"))
        pdf.rect(
            0,
            0,
            page_width,
            page_height,
            fill=1,
            stroke=0,
        )

        # Moldura exterior
        pdf.setStrokeColor(colors.HexColor("#2563eb"))
        pdf.setLineWidth(3)
        pdf.rect(
            1.2 * cm,
            1.2 * cm,
            page_width - 2.4 * cm,
            page_height - 2.4 * cm,
            fill=0,
            stroke=1,
        )

        # Moldura interior
        pdf.setStrokeColor(colors.HexColor("#bfdbfe"))
        pdf.setLineWidth(1)
        pdf.rect(
            1.65 * cm,
            1.65 * cm,
            page_width - 3.3 * cm,
            page_height - 3.3 * cm,
            fill=0,
            stroke=1,
        )

        center_x = page_width / 2

        pdf.setFillColor(colors.HexColor("#1d4ed8"))
        pdf.setFont("Helvetica-Bold", 28)
        pdf.drawCentredString(
            center_x,
            page_height - 3.2 * cm,
            "SICSI III",
        )

        pdf.setFillColor(colors.HexColor("#64748b"))
        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawCentredString(
            center_x,
            page_height - 4.1 * cm,
            "CERTIFICADO DE CONCLUSÃO",
        )

        pdf.setFillColor(colors.HexColor("#0f172a"))
        pdf.setFont("Helvetica", 12)
        pdf.drawCentredString(
            center_x,
            page_height - 5.6 * cm,
            "Certificamos que",
        )

        pdf.setFont("Helvetica-Bold", 25)
        pdf.drawCentredString(
            center_x,
            page_height - 6.8 * cm,
            certificate["student_name"],
        )

        pdf.setFont("Helvetica", 12)
        pdf.setFillColor(colors.HexColor("#475569"))
        pdf.drawCentredString(
            center_x,
            page_height - 8.0 * cm,
            "concluiu com aproveitamento o curso",
        )

        pdf.setFillColor(colors.HexColor("#0f172a"))
        pdf.setFont("Helvetica-Bold", 19)
        pdf.drawCentredString(
            center_x,
            page_height - 9.2 * cm,
            certificate["course_title"],
        )

        pdf.setFillColor(colors.HexColor("#475569"))
        pdf.setFont("Helvetica", 10)
        pdf.drawCentredString(
            center_x,
            page_height - 10.4 * cm,
            "no âmbito da plataforma de consciencialização em segurança digital SICSI III.",
        )

        # Resultado
        pdf.setFillColor(colors.HexColor("#eff6ff"))
        pdf.roundRect(
            center_x - 3.2 * cm,
            page_height - 13.0 * cm,
            6.4 * cm,
            1.4 * cm,
            0.25 * cm,
            fill=1,
            stroke=0,
        )

        pdf.setFillColor(colors.HexColor("#1d4ed8"))
        pdf.setFont("Helvetica-Bold", 18)
        pdf.drawCentredString(
            center_x,
            page_height - 12.1 * cm,
            f"Aproveitamento: {certificate.get('percentage', certificate.get('score', 0))}%",
        )

        # Código
        pdf.setFillColor(colors.HexColor("#64748b"))
        pdf.setFont("Helvetica", 9)
        pdf.drawCentredString(
            center_x,
            2.8 * cm,
            f"Código de validação: {certificate.get('certificate_code', certificate['id'])}",
        )

        pdf.drawCentredString(
            center_x,
            2.25 * cm,
            f"Emitido em: {certificate.get('issued_at', '')}",
        )

        pdf.setFillColor(colors.HexColor("#1d4ed8"))
        pdf.setFont("Helvetica-Bold", 9)
        pdf.drawCentredString(
            center_x,
            1.7 * cm,
            "SICSI III · Segurança Digital",
        )

        pdf.showPage()
        pdf.save()

        buffer.seek(0)

        filename = (
            certificate.get("certificate_code", certificate["id"])
            + ".pdf"
        )

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'inline; filename="{filename}"'
            },
        )

    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="A biblioteca necessária para gerar PDF não está instalada.",
        )
# CERTIFICATES
# ============================================================

@app.get("/api/certificates")
def get_certificates():
    return read_json("certificates")


@app.get("/api/users/{user_id}/certificates")
def user_certificates(user_id: str):
    return [
        c for c in read_json("certificates")
        if c["user_id"] == user_id
    ]


# ============================================================
# ADMIN STATS
# ============================================================

@app.get("/api/admin/stats")
def admin_stats():
    users = read_json("users")
    courses = read_json("courses")
    certificates = read_json("certificates")

    return {
        "users": len(users),
        "students": len(
            [u for u in users if u.get("role") == "student"]
        ),
        "admins": len(
            [u for u in users if u.get("role") == "admin"]
        ),
        "courses": len(courses),
        "published_courses": len(
            [c for c in courses if c.get("published", True)]
        ),
        "certificates": len(certificates),
    }


# ============================================================
# BOOTSTRAP ADMIN LOCAL
# ============================================================

def ensure_admin():
    users = read_json("users")

    existing_admin = next(
        (u for u in users if u.get("email", "").lower() == "admin@sicsi.local"),
        None,
    )

    if existing_admin:
        existing_admin["role"] = "admin"
        existing_admin["password_hash"] = password_hash("Admin@123")
        write_json("users", users)
        return

    admin = {
        "id": "usr_admin",
        "name": "Administrador SICSI",
        "email": "admin@sicsi.local",
        "password_hash": password_hash("Admin@123"),
        "role": "admin",
        "initial_assessment_completed": True,
        "awareness_level": "Administrador",
        "assessment_score": 100,
        "recommendations": [],
        "enrolled_courses": [],
        "completed_lessons": {},
        "completed_courses": [],
        "simulation_results": {},
        "created_at": now(),
    }

    write_json("users", [admin])


ensure_admin()


# ============================================================
# AUTOAVALIAÇÃO INICIAL DO ESTUDANTE
# ============================================================

ASSESSMENT_QUESTIONS = [
    {
        "id": 1,
        "question": "Recebe um email inesperado a pedir que clique num link e confirme a sua palavra-passe. O que faz?",
        "options": [
            "Clico imediatamente para evitar o bloqueio da conta.",
            "Verifico o remetente e o endereço do link antes de qualquer acção.",
            "Respondo ao email a pedir mais informações.",
            "Encaminho o email para todos os meus colegas."
        ],
        "correct": 1,
    },
    {
        "id": 2,
        "question": "Qual destes sinais pode indicar uma tentativa de phishing?",
        "options": [
            "Mensagem urgente com link suspeito.",
            "Email esperado de uma pessoa conhecida.",
            "Documento criado por si.",
            "Notificação normal de uma aplicação."
        ],
        "correct": 0,
    },
    {
        "id": 3,
        "question": "Como deve tratar uma palavra-passe importante?",
        "options": [
            "Usar a mesma em todos os serviços.",
            "Partilhá-la com um colega de confiança.",
            "Usar uma palavra-passe forte e única.",
            "Guardá-la num ficheiro público."
        ],
        "correct": 2,
    },
    {
        "id": 4,
        "question": "Alguém liga dizendo ser do suporte técnico e pede o seu código de autenticação. O que deve fazer?",
        "options": [
            "Fornecer o código se a pessoa souber o meu nome.",
            "Fornecer apenas metade do código.",
            "Não fornecer o código e confirmar a identidade por um canal oficial.",
            "Pedir à pessoa que ligue novamente."
        ],
        "correct": 2,
    },
    {
        "id": 5,
        "question": "Encontrou um programa pago gratuitamente num site desconhecido. Qual é a opção mais segura?",
        "options": [
            "Instalar imediatamente.",
            "Desactivar o antivírus para instalar.",
            "Usar uma fonte oficial e legítima.",
            "Perguntar nas redes sociais se alguém já instalou."
        ],
        "correct": 2,
    },
    {
        "id": 6,
        "question": "Recebe uma mensagem de WhatsApp de um conhecido a pedir dinheiro com urgência. O que deve fazer?",
        "options": [
            "Transferir imediatamente.",
            "Confirmar a identidade por outro meio antes de agir.",
            "Enviar os dados bancários.",
            "Partilhar a mensagem publicamente."
        ],
        "correct": 1,
    },
    {
        "id": 7,
        "question": "O que representa melhor a autenticação multifactor?",
        "options": [
            "Usar a mesma palavra-passe duas vezes.",
            "Usar mais de um factor para confirmar a identidade.",
            "Ter duas contas de email.",
            "Mudar a palavra-passe todos os dias."
        ],
        "correct": 1,
    },
    {
        "id": 8,
        "question": "Qual é uma boa prática ao utilizar uma rede Wi-Fi pública?",
        "options": [
            "Aceder livremente a todas as contas.",
            "Partilhar ficheiros com desconhecidos.",
            "Ter cuidado com dados sensíveis e utilizar protecções adequadas.",
            "Desactivar todas as medidas de segurança."
        ],
        "correct": 2,
    },
    {
        "id": 9,
        "question": "Uma página de login parece verdadeira, mas o endereço do site é estranho. O que deve fazer?",
        "options": [
            "Introduzir a palavra-passe para testar.",
            "Ignorar o endereço.",
            "Não introduzir credenciais e verificar o endereço oficial.",
            "Enviar o link aos amigos."
        ],
        "correct": 2,
    },
    {
        "id": 10,
        "question": "Qual é a atitude mais importante perante uma situação digital suspeita?",
        "options": [
            "Agir rapidamente sem verificar.",
            "Parar, verificar e pensar antes de agir.",
            "Partilhar a situação imediatamente.",
            "Desactivar as ferramentas de segurança."
        ],
        "correct": 1,
    },
]


@app.get("/api/assessment/questions")
def assessment_questions():
    return [
        {
            "id": q["id"],
            "question": q["question"],
            "options": q["options"],
        }
        for q in ASSESSMENT_QUESTIONS
    ]


@app.post("/api/assessment/submit")
def submit_assessment(body: TestBody):
    users = read_json("users")

    user = next(
        (u for u in users if u["id"] == body.user_id),
        None,
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Estudante não encontrado.",
        )

    score = 0

    for index, question in enumerate(ASSESSMENT_QUESTIONS):
        answer = (
            body.answers[index]
            if index < len(body.answers)
            else -1
        )

        if answer == question["correct"]:
            score += 1

    percentage = score * 10

    if percentage < 40:
        level = "Iniciante"
        recommendations = [
            "Fundamentos de Segurança Digital",
            "Protecção de Contas e Credenciais",
            "Reconhecimento de Phishing",
        ]
    elif percentage < 70:
        level = "Intermédio"
        recommendations = [
            "Reconhecimento de Phishing",
            "Engenharia Social",
            "Fraudes Digitais",
        ]
    else:
        level = "Avançado"
        recommendations = [
            "Phishing Avançado",
            "Engenharia Social",
            "Fraudes Digitais",
        ]

    user["initial_assessment_completed"] = True
    user["assessment_score"] = percentage
    user["awareness_level"] = level
    user["recommendations"] = recommendations

    write_json("users", users)

    return {
        "score": score,
        "percentage": percentage,
        "level": level,
        "recommendations": recommendations,
    }

# ============================================================
# ============================================================
# SIMULAÇÕES INTERACTIVAS
# ============================================================

# Os resultados das simulações são temporários.
# Não são escritos em users.json nem noutro ficheiro persistente.
SIMULATION_SESSIONS = {}


def simulation_session_key(user_id, simulation_id):
    return f"{user_id}:{simulation_id}"


def simulation_action_title(action, interaction_type=None):
    key = str(interaction_type or action or "").strip().lower()

    titles = {
        "report": "Denunciou a mensagem como suspeita.",
        "inspect": "Analisou os sinais da mensagem antes de continuar.",
        "inspect_url": "Verificou cuidadosamente o endereço da ligação.",
        "inspect_sender": "Verificou os dados do remetente.",
        "details": "Consultou os detalhes do remetente.",
        "leave_page": "Saiu da página sem fornecer informação.",
        "verify": "Optou por confirmar a situação através de um canal oficial.",
        "cancel": "Interrompeu a acção antes de continuar.",
        "secure": "Protegeu a conta através dos mecanismos oficiais.",
        "ignore": "Ignorou a mensagem e evitou prosseguir.",
        "block": "Bloqueou a tentativa suspeita.",
        "open": "Abriu a ligação apresentada na mensagem.",
        "open_link": "Abriu a ligação apresentada na mensagem.",
        "click": "Abriu a ligação apresentada na mensagem.",
        "submit_credentials": "Introduziu o seu endereço de correio electrónico e a sua palavra-passe.",
        "credentials": "Introduziu os seus dados de acesso.",
        "login": "Introduziu os seus dados de acesso.",
        "finish": "Concluiu a experiência.",
    }

    return titles.get(
        key,
        "Tomou uma decisão durante a experiência."
    )


def simulation_action_is_safe(action, interaction_type=None):
    key = str(interaction_type or action or "").strip().lower()

    safe_actions = {
        "report",
        "inspect",
        "inspect_url",
        "inspect_sender",
        "details",
        "leave_page",
        "verify",
        "cancel",
        "secure",
        "ignore",
        "block",
        "finish",
    }

    if key in safe_actions:
        return True

    return False


def simulation_impact(action, interaction_type=None):
    key = str(interaction_type or action or "").strip().lower()

    impacts = {
        "report": (
            "A mensagem foi encaminhada para análise sem expor os seus dados."
        ),
        "inspect": (
            "A verificação deu-lhe mais informação antes de tomar uma decisão."
        ),
        "inspect_url": (
            "A verificação do endereço reduz a probabilidade de entrar num site falso."
        ),
        "inspect_sender": (
            "Confirmar o remetente ajuda a detectar mensagens que imitam organizações legítimas."
        ),
        "details": (
            "Consultar os detalhes do remetente permite perceber melhor de onde veio a mensagem."
        ),
        "leave_page": (
            "Sair sem fornecer informação impediu que a situação avançasse."
        ),
        "verify": (
            "A confirmação por um canal oficial reduz o risco de confiar numa identidade falsa."
        ),
        "cancel": (
            "Interromper a acção evitou que o risco avançasse."
        ),
        "secure": (
            "Proteger a conta através do serviço oficial limita o impacto de um possível acesso indevido."
        ),
        "ignore": (
            "Não prosseguir impediu a tentativa de fraude de avançar."
        ),
        "block": (
            "Bloquear a tentativa reduz a possibilidade de nova interacção com o atacante."
        ),
        "open": (
            "Abrir a ligação levou-o para uma página controlada pelo atacante simulado."
        ),
        "open_link": (
            "Abrir a ligação levou-o para uma página controlada pelo atacante simulado."
        ),
        "click": (
            "Abrir a ligação levou-o para uma página controlada pelo atacante simulado."
        ),
        "submit_credentials": (
            "Os dados de acesso foram introduzidos numa página controlada pelo atacante simulado."
        ),
        "credentials": (
            "Os dados de acesso foram introduzidos numa página controlada pelo atacante simulado."
        ),
        "login": (
            "Os dados de acesso foram introduzidos numa página controlada pelo atacante simulado."
        ),
    }

    return impacts.get(
        key,
        "Esta decisão alterou a exposição ao risco durante a experiência."
    )


def simulation_next_id(simulation_id):
    if not str(simulation_id).startswith("phishing-"):
        return None

    try:
        number = int(str(simulation_id).split("-")[-1])
    except (TypeError, ValueError):
        return None

    if number >= 5:
        return None

    return f"phishing-{number + 1:02d}"


def build_simulation_report(session, simulation):
    actions = session.get("actions", [])

    dangerous_actions = [
        item for item in actions if not item.get("safe", False)
    ]

    safe_actions = [
        item for item in actions if item.get("safe", False)
    ]

    dangerous_count = len(dangerous_actions)
    safe_count = len(safe_actions)

    score = max(
        0,
        min(
            100,
            100 - (dangerous_count * 25) + (safe_count * 5)
        )
    )

    if score >= 80:
        classification = "Muito segura"
    elif score >= 60:
        classification = "Segura"
    elif score >= 40:
        classification = "A melhorar"
    else:
        classification = "Elevado risco"

    email_value = session.get("form_data", {}).get("email", "")
    password_entered = bool(
        session.get("form_data", {}).get("password_entered", False)
    )

    data_shared = []

    if email_value:
        data_shared.append(
            {
                "field": "Endereço de correio electrónico",
                "value": email_value,
                "sensitive": True,
            }
        )

    if password_entered:
        data_shared.append(
            {
                "field": "Palavra-passe",
                "value": "Introduzida — conteúdo não guardado",
                "sensitive": True,
            }
        )

    report = {
        "behaviour_score": score,
        "classification": classification,
        "total_actions": len(actions),
        "dangerous_actions": dangerous_actions,
        "safe_actions": safe_actions,
        "data_shared": data_shared,
        "form_data": {
            "email": email_value or None,
            "password_entered": password_entered,
        },
        "generated_at": now(),
    }

    return report


def build_simulation_result(session):
    simulation = session.get(
        "simulation",
        {}
    )

    report = build_simulation_report(
        session,
        simulation
    )

    # ========================================================
    # FONTE ÚNICA DO COMPORTAMENTO:
    # session["actions"]
    # ========================================================

    actions = session.get(
        "actions",
        []
    )

    if not isinstance(actions, list):
        actions = []

    decision_history = []

    for item in actions:

        if not isinstance(item, dict):
            continue

        decision_history.append(
            {
                "action": item.get(
                    "action",
                    ""
                ),
                "interaction_type": item.get(
                    "interaction_type",
                    item.get(
                        "action",
                        ""
                    )
                ),
                "correct": bool(
                    item.get(
                        "correct",
                        False
                    )
                ),
                "impact": item.get(
                    "impact",
                    ""
                ),
                "data_shared": item.get(
                    "data_shared",
                    []
                ),
                "timestamp": item.get(
                    "timestamp"
                ),
            }
        )

    # ========================================================
    # DETECTAR DENÚNCIA PELO COMPORTAMENTO REAL
    # ========================================================

    was_reported = any(
        str(
            item.get(
                "interaction_type",
                ""
            )
        ).strip().lower()
        in (
            "report",
            "report_email",
            "denounce",
            "denunc",
        )
        or
        str(
            item.get(
                "action",
                ""
            )
        ).strip().lower()
        in (
            "report",
            "report_email",
            "denounce",
            "denunc",
        )
        for item in decision_history
    )

    # ========================================================
    # DADOS REAIS INTRODUZIDOS
    # ========================================================

    form_data = session.get(
        "form_data",
        {}
    )

    if not isinstance(form_data, dict):
        form_data = {}

    email_value = str(
        form_data.get(
            "email",
            ""
        )
        or ""
    ).strip()

    password_entered = bool(
        form_data.get(
            "password_entered",
            False
        )
    )

    data_shared = []

    if email_value:

        data_shared.append(
            {
                "field":
                    "Endereço de correio electrónico",
                "value":
                    email_value,
                "sensitive":
                    True,
            }
        )

    if password_entered:

        data_shared.append(
            {
                "field":
                    "Palavra-passe",
                "value":
                    "Introduzida — conteúdo não guardado",
                "sensitive":
                    True,
            }
        )

    # ========================================================
    # INFORMAÇÃO EXTRA ENTREGUE DURANTE A EXPERIÊNCIA
    # ========================================================

    for item in decision_history:

        values = item.get(
            "data_shared",
            []
        )

        if not isinstance(
            values,
            list
        ):
            continue

        for value in values:

            value_text = str(
                value
                or ""
            ).strip()

            if not value_text:
                continue

            known = [
                str(
                    existing.get(
                        "field",
                        ""
                    )
                )
                for existing in data_shared
                if isinstance(
                    existing,
                    dict
                )
            ]

            field_name = value_text

            if value_text.lower() in (
                "email",
                "e-mail",
                "endereço de correio electrónico",
            ):
                field_name = (
                    "Endereço de correio electrónico"
                )

            elif value_text.lower() in (
                "password",
                "palavra-passe",
                "palavra passe",
            ):
                field_name = "Palavra-passe"

            if field_name not in known:
                data_shared.append(
                    {
                        "field":
                            field_name,
                        "value":
                            (
                                "Introduzida — conteúdo não guardado"
                                if field_name == "Palavra-passe"
                                else field_name
                            ),
                        "sensitive":
                            True,
                    }
                )

    # ========================================================
    # RESULTADO FINAL PARA WEBSITE + PDF
    # ========================================================

    report["decision_history"] = (
        decision_history
    )

    report["data_shared"] = (
        data_shared
    )

    report["was_reported"] = (
        was_reported
    )

    report["form_data"] = {
        "email":
            email_value or None,
        "password_entered":
            password_entered,
    }

    report["completed"] = bool(
        session.get(
            "completed",
            False
        )
    )

    return {
        "completed": bool(
            session.get(
                "completed",
                False
            )
        ),
        "correct": bool(
            session.get(
                "last_safe",
                False
            )
        ),
        "feedback": session.get(
            "last_feedback",
            ""
        ),
        "explanation": session.get(
            "last_explanation",
            ""
        ),
        "next_simulation_id":
            session.get(
                "next_simulation_id"
            ),
        "report":
            report,
    }

# ============================================================
# ROTAS PRINCIPAIS DAS SIMULAÇÕES
# ============================================================

@app.get("/api/simulations")
def get_simulations():
    return read_json("simulations")


@app.get("/api/simulations/{simulation_id}")
def get_simulation(
    simulation_id: str,
):
    simulations = read_json(
        "simulations"
    )

    simulation = next(
        (
            item
            for item in simulations
            if item.get("id") == simulation_id
        ),
        None,
    )

    if not simulation:
        raise HTTPException(
            status_code=404,
            detail="Simulação não encontrada.",
        )

    return simulation


@app.post("/api/simulations/{simulation_id}/evaluate")
def evaluate_simulation(
    simulation_id: str,
    body: dict,
):
    simulations = read_json(
        "simulations"
    )

    simulation = next(
        (
            item
            for item in simulations
            if item.get("id") == simulation_id
        ),
        None,
    )

    if not simulation:
        raise HTTPException(
            status_code=404,
            detail="Simulação não encontrada.",
        )

    action = str(
        body.get("action")
        or ""
    ).strip()

    user_id = str(
        body.get("user_id")
        or ""
    ).strip()

    step_id = str(
        body.get("step_id")
        or ""
    ).strip()

    interaction_type = str(
        body.get("interaction_type")
        or action
    ).strip()

    metadata = body.get(
        "metadata"
    )

    if not isinstance(
        metadata,
        dict
    ):
        metadata = {}

    if not user_id:
        raise HTTPException(
            status_code=400,
            detail="É necessário identificar o utilizador.",
        )

    if not action:
        raise HTTPException(
            status_code=400,
            detail="É necessário indicar a acção.",
        )

    key = simulation_session_key(
        user_id,
        simulation_id,
    )

    session = SIMULATION_SESSIONS.setdefault(
        key,
        {
            "simulation_id":
                simulation_id,
            "user_id":
                user_id,
            "simulation":
                simulation,
            "actions":
                [],
            "form_data":
                {
                    "email": "",
                    "password_entered":
                        False,
                },
            "completed":
                False,
            "last_safe":
                False,
            "last_feedback":
                "",
            "last_explanation":
                "",
            "next_simulation_id":
                None,
        },
    )

    # --------------------------------------------------------
    # DADOS DO FORMULÁRIO
    # --------------------------------------------------------

    email_value = str(
        metadata.get(
            "email"
        )
        or ""
    ).strip()

    if email_value:
        session["form_data"]["email"] = (
            email_value
        )

    if metadata.get(
        "password_entered"
    ) is True:

        # Nunca armazenar o valor da palavra-passe.
        session["form_data"][
            "password_entered"
        ] = True

    # --------------------------------------------------------
    # AVALIAÇÃO DA DECISÃO
    # --------------------------------------------------------

    safe = simulation_action_is_safe(
        action,
        interaction_type,
    )

    impact = simulation_impact(
        action,
        interaction_type,
    )

    # --------------------------------------------------------
    # FEEDBACK INTERNO PARA O MOTOR
    # --------------------------------------------------------

    action_title = simulation_action_title(
        action,
        interaction_type,
    )

    action_data = []

    if email_value:
        action_data.append(
            "Endereço de correio electrónico"
        )

    if metadata.get(
        "password_entered"
    ) is True:
        action_data.append(
            "Palavra-passe"
        )

    action_record = {
        "action":
            action,
        "interaction_type":
            interaction_type,
        "step_id":
            step_id,
        "safe":
            bool(safe),
        "correct":
            bool(safe),
        "title":
            action_title,
        "impact":
            impact,
        "data_shared":
            action_data,
        "timestamp":
            now(),
    }

    session["actions"].append(
        action_record
    )

    session["last_safe"] = bool(
        safe
    )

    session["last_feedback"] = (
        action_title
    )

    session["last_explanation"] = (
        impact
    )

    # --------------------------------------------------------
    # DENÚNCIA = CONCLUSÃO SEGURA
    # --------------------------------------------------------

    normalized_type = (
        interaction_type
        .strip()
        .lower()
    )

    normalized_action = (
        action
        .strip()
        .lower()
    )

    if normalized_type in (
        "report",
        "report_email",
        "denounce",
        "denunc",
    ) or normalized_action in (
        "report",
        "report_email",
        "denounce",
        "denunc",
    ):

        session["was_reported"] = True
        session["completed"] = True

    # --------------------------------------------------------
    # OUTRAS FORMAS DE CONCLUSÃO
    # --------------------------------------------------------

    completion_actions = {
        "finish",
        "complete",
        "complete_simulation",
    }

    if (
        normalized_action
        in completion_actions
    ):
        session["completed"] = True

    if (
        normalized_type
        in completion_actions
    ):
        session["completed"] = True

    # --------------------------------------------------------
    # PRÓXIMO PHISHING
    # --------------------------------------------------------

    current_id = simulation_id

    if current_id.startswith(
        "phishing-"
    ):

        try:

            current_number = int(
                current_id.split(
                    "-"
                )[-1]
            )

            next_number = (
                current_number + 1
            )

            next_id = (
                f"phishing-{next_number:02d}"
            )

            exists = any(
                item.get("id")
                == next_id
                for item in simulations
            )

            if exists:
                session[
                    "next_simulation_id"
                ] = next_id

        except (
            ValueError,
            IndexError,
        ):
            pass

    return {
        "correct":
            bool(safe),
        "feedback":
            action_title,
        "explanation":
            impact,
        "safe_action":
            simulation.get(
                "safe_action"
            ),
        "completed":
            bool(
                session.get(
                    "completed",
                    False,
                )
            ),
    }


# ============================================================
# SICSI III — JORNADA FINAL DE PHISHING
# ============================================================

PHISHING_FINAL_SEQUENCE = [
    "phishing-01",
    "phishing-02",
    "phishing-03",
    "phishing-04",
    "phishing-05",
]


def build_phishing_final_report(user_id):
    simulations = {
        item.get("id"): item
        for item in read_json("simulations")
        if isinstance(item, dict)
        and item.get("id")
    }

    completed = []
    decision_history = []
    data_shared = []

    total_safe = 0
    total_dangerous = 0
    reported_count = 0

    for sequence, simulation_id in enumerate(
        PHISHING_FINAL_SEQUENCE,
        start=1,
    ):

        key = simulation_session_key(
            user_id,
            simulation_id,
        )

        session = SIMULATION_SESSIONS.get(
            key
        )

        if not session or not session.get(
            "completed",
            False,
        ):
            raise HTTPException(
                status_code=409,
                detail=(
                    "Conclua as cinco simulações de "
                    "Phishing para consultar o relatório final."
                ),
            )

        simulation = (
            session.get("simulation")
            or simulations.get(
                simulation_id,
                {},
            )
        )

        report = build_simulation_report(
            session,
            simulation,
        )

        safe_actions = report.get(
            "safe_actions",
            [],
        )

        dangerous_actions = report.get(
            "dangerous_actions",
            [],
        )

        if not isinstance(
            safe_actions,
            list,
        ):
            safe_actions = []

        if not isinstance(
            dangerous_actions,
            list,
        ):
            dangerous_actions = []

        total_safe += len(
            safe_actions
        )

        total_dangerous += len(
            dangerous_actions
        )

        if report.get(
            "was_reported",
            False,
        ):
            reported_count += 1

        stage_history = report.get(
            "decision_history",
            [],
        )

        if not isinstance(
            stage_history,
            list,
        ):
            stage_history = []

        for item in stage_history:

            if not isinstance(
                item,
                dict,
            ):
                continue

            decision = dict(item)

            decision["sequence"] = sequence
            decision["simulation_id"] = simulation_id
            decision["simulation_title"] = simulation.get(
                "title",
                simulation_id,
            )

            decision_history.append(
                decision
            )

        stage_data = report.get(
            "data_shared",
            [],
        )

        if not isinstance(
            stage_data,
            list,
        ):
            stage_data = []

        for item in stage_data:

            if not isinstance(
                item,
                dict,
            ):
                continue

            shared = dict(item)

            shared["sequence"] = sequence
            shared["simulation_id"] = simulation_id
            shared["simulation_title"] = simulation.get(
                "title",
                simulation_id,
            )

            field_name = str(
                shared.get(
                    "field",
                    "",
                )
            ).lower()

            if (
                "password" in field_name
                or "palavra-passe" in field_name
            ):
                shared["value"] = (
                    "Introduzida — conteúdo não guardado"
                )

            data_shared.append(
                shared
            )

        completed.append(
            {
                "sequence": sequence,
                "id": simulation_id,
                "title": simulation.get(
                    "title",
                    simulation_id,
                ),
                "difficulty": simulation.get(
                    "difficulty",
                    "—",
                ),
                "score": int(
                    report.get(
                        "behaviour_score",
                        0,
                    )
                    or 0
                ),
                "total_actions": len(
                    stage_history
                ),
                "safe_count": len(
                    safe_actions
                ),
                "dangerous_count": len(
                    dangerous_actions
                ),
                "data_shared_count": len(
                    stage_data
                ),
                "was_reported": bool(
                    report.get(
                        "was_reported",
                        False,
                    )
                ),
            }
        )

    overall_score = max(
        0,
        min(
            100,
            100
            - (
                total_dangerous * 25
            )
            + (
                total_safe * 5
            ),
        ),
    )

    if overall_score >= 80:
        classification = "Comportamento seguro"
    elif overall_score >= 60:
        classification = "Atenção necessária"
    else:
        classification = "Exposição elevada ao risco"

    chat_feedback = [
        (
            "Completou as cinco experiências de "
            "Phishing. A análise considera o seu "
            "comportamento ao longo de todo o percurso."
        )
    ]

    if total_dangerous == 0:

        chat_feedback.append(
            "Não foram observadas decisões classificadas "
            "como perigosas ao longo da jornada."
        )

    elif total_dangerous == 1:

        chat_feedback.append(
            "Foi observada uma exposição pontual ao risco. "
            "Esse comportamento deve ser revisto sobretudo "
            "perante mensagens inesperadas ou urgentes."
        )

    else:

        chat_feedback.append(
            (
                f"Foram observadas {total_dangerous} decisões "
                "com exposição ao risco. O padrão recomenda "
                "maior atenção antes de agir."
            )
        )

    if reported_count > 0:

        chat_feedback.append(
            (
                f"Houve comportamento de denúncia em "
                f"{reported_count} das cinco experiências."
            )
        )

    else:

        chat_feedback.append(
            (
                "Não foi observada uma acção de denúncia "
                "durante as cinco experiências."
            )
        )

    if data_shared:

        chat_feedback.append(
            (
                "Foi identificada exposição potencial de "
                "informação durante a jornada. O conteúdo "
                "de palavras-passe nunca é guardado."
            )
        )

    else:

        chat_feedback.append(
            (
                "Não foi identificada informação sensível "
                "partilhada nos registos produzidos."
            )
        )

    if overall_score >= 80:

        chat_feedback.append(
            (
                "O comportamento global demonstra uma boa "
                "capacidade de reconhecer e evitar ameaças."
            )
        )

    elif overall_score >= 60:

        chat_feedback.append(
            (
                "Existe uma base positiva, mas alguns sinais "
                "de risco ainda exigem maior atenção."
            )
        )

    else:

        chat_feedback.append(
            (
                "A jornada mostra exposição elevada ao risco. "
                "Recomenda-se rever os sinais de Phishing e "
                "voltar a praticar antes de enfrentar situações reais."
            )
        )

    recommendations = [
        (
            "Verifique sempre o remetente, o contexto e "
            "o endereço real da ligação."
        ),
        (
            "Perante urgência ou ameaça de bloqueio, "
            "pare e confirme através de um canal oficial."
        ),
        (
            "Nunca entregue palavras-passe ou códigos "
            "de autenticação através de ligações inesperadas."
        ),
    ]

    return {
        "sequence_complete": True,
        "completed_count": len(completed),
        "total_simulations": len(PHISHING_FINAL_SEQUENCE),
        "overall_score": overall_score,
        "classification": classification,
        "safe_actions": total_safe,
        "dangerous_actions": total_dangerous,
        "reported_simulations": reported_count,
        "simulations": completed,
        "decision_history": decision_history,
        "data_shared": data_shared,
        "chat_feedback": chat_feedback,
        "recommendations": recommendations,
        "generated_at": now(),
    }


def build_phishing_final_pdf(report):
    from io import BytesIO
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import (
        ParagraphStyle,
        getSampleStyleSheet,
    )
    from reportlab.lib.units import mm
    from reportlab.platypus import (
        Paragraph,
        SimpleDocTemplate,
        Table,
        TableStyle,
    )

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=16 * mm,
        leftMargin=16 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
        title="Relatório Final de Phishing — SICSI III",
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "SicsiTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=19,
        leading=23,
    )

    heading_style = ParagraphStyle(
        "SicsiHeading",
        parent=styles["Heading2"],
        fontSize=13,
        leading=17,
        spaceBefore=9,
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        "SicsiBody",
        parent=styles["BodyText"],
        fontSize=9,
        leading=13,
        spaceAfter=5,
    )

    story = [
        Paragraph(
            "SICSI III",
            title_style,
        ),
        Paragraph(
            "Relatório Final da Jornada de Phishing",
            heading_style,
        ),
        Paragraph(
            (
                f"<b>Avaliação global:</b> "
                f"{report.get('overall_score', 0)}%"
            ),
            body_style,
        ),
        Paragraph(
            (
                f"<b>Classificação:</b> "
                f"{report.get('classification', '—')}"
            ),
            body_style,
        ),
        Paragraph(
            "Leitura do comportamento",
            heading_style,
        ),
    ]

    for message in report.get(
        "chat_feedback",
        [],
    ):
        story.append(
            Paragraph(
                str(message),
                body_style,
            )
        )

    story.append(
        Paragraph(
            "Cinco experiências",
            heading_style,
        )
    )

    table_data = [
        [
            "Etapa",
            "Experiência",
            "Avaliação",
            "Risco",
        ]
    ]

    for item in report.get(
        "simulations",
        [],
    ):
        table_data.append(
            [
                str(
                    item.get(
                        "sequence",
                        "—",
                    )
                ),
                str(
                    item.get(
                        "title",
                        "—",
                    )
                ),
                f"{item.get('score', 0)}%",
                str(
                    item.get(
                        "dangerous_count",
                        0,
                    )
                ),
            ]
        )

    table = Table(
        table_data,
        repeatRows=1,
        colWidths=[
            12 * mm,
            95 * mm,
            27 * mm,
            22 * mm,
        ],
    )

    table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#2563EB"),
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold",
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.4,
                    colors.HexColor("#CBD5E1"),
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP",
                ),
            ]
        )
    )

    story.append(table)

    story.append(
        Paragraph(
            "Recomendações",
            heading_style,
        )
    )

    for recommendation in report.get(
        "recommendations",
        [],
    ):
        story.append(
            Paragraph(
                f"• {recommendation}",
                body_style,
            )
        )

    story.append(
        Paragraph(
            (
                "<b>Privacidade:</b> o conteúdo de "
                "palavras-passe introduzidas nas "
                "simulações não é guardado pelo SICSI."
            ),
            body_style,
        )
    )

    document.build(story)

    buffer.seek(0)

    return buffer


@app.get(
    "/api/simulations/phishing/result/{user_id}"
)
def get_phishing_final_result(user_id: str):
    return build_phishing_final_report(
        user_id
    )


@app.get(
    "/api/simulations/phishing/result/{user_id}/pdf"
)
def phishing_final_result_pdf(user_id: str):

    report = build_phishing_final_report(
        user_id
    )

    pdf_buffer = build_phishing_final_pdf(
        report
    )

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                'attachment; filename="relatorio-phishing-sicsi-iii.pdf"'
        },
    )


@app.delete(
    "/api/simulations/phishing/result/{user_id}"
)
def clear_phishing_final_result(user_id: str):

    removed = 0

    for simulation_id in PHISHING_FINAL_SEQUENCE:

        key = simulation_session_key(
            user_id,
            simulation_id,
        )

        if SIMULATION_SESSIONS.pop(
            key,
            None,
        ) is not None:

            removed += 1

    return {
        "success": True,
        "removed_sessions": removed,
    }

@app.get("/api/simulations/{simulation_id}/result/{user_id}")
def get_simulation_result(
    simulation_id: str,
    user_id: str,
):
    key = simulation_session_key(
        user_id,
        simulation_id,
    )

    session = SIMULATION_SESSIONS.get(key)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Ainda não existe um relatório concluído para esta simulação.",
        )

    return build_simulation_result(session)


@app.get("/api/simulations/{simulation_id}/result/{user_id}/pdf")
def simulation_result_pdf(
    simulation_id: str,
    user_id: str,
):
    key = simulation_session_key(
        user_id,
        simulation_id,
    )

    session = SIMULATION_SESSIONS.get(key)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="O relatório temporário desta experiência já não está disponível.",
        )

    try:
        from io import BytesIO
        import re

        from fastapi.responses import StreamingResponse
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import cm
        from reportlab.pdfgen import canvas

        simulation = session.get("simulation")

        if not isinstance(simulation, dict):
            raise HTTPException(
                status_code=404,
                detail="A simulação associada a esta experiência não foi encontrada.",
            )

        if simulation.get("id") != simulation_id:
            raise HTTPException(
                status_code=404,
                detail="A simulação associada ao relatório não corresponde à experiência.",
            )

        result = build_simulation_result(
            session
        )

        report = (
            result.get("report")
            if isinstance(result, dict)
            else {}
        )

        if not isinstance(report, dict):
            report = {}

        users = read_json("users")

        student = next(
            (
                item
                for item in users
                if str(
                    item.get("id", "")
                ) == str(user_id)
            ),
            None,
        )

        student_name = str(
            (
                student.get("name")
                if isinstance(student, dict)
                else None
            )
            or session.get("user_name")
            or session.get("student_name")
            or session.get("name")
            or "Estudante"
        )

        student_email = str(
            (
                student.get("email")
                if isinstance(student, dict)
                else ""
            )
            or ""
        )

        title = str(
            simulation.get(
                "title",
                "Experiência de phishing",
            )
        )

        category = str(
            simulation.get(
                "category",
                "Phishing",
            )
        )

        difficulty = str(
            simulation.get(
                "difficulty",
                "Fácil",
            )
        )

        report_date = datetime.now().strftime(
            "%d/%m/%Y %H:%M"
        )

        score = int(
            report.get(
                "behaviour_score",
                0,
            )
            or 0
        )

        classification = str(
            report.get(
                "classification",
                "",
            )
            or ""
        )

        if not classification:
            if score >= 80:
                classification = "Comportamento seguro"
            elif score >= 60:
                classification = "Atenção necessária"
            else:
                classification = "Exposição elevada ao risco"

        safe_actions = (
            report.get("safe_actions")
            if isinstance(
                report.get("safe_actions"),
                list,
            )
            else []
        )

        dangerous_actions = (
            report.get("dangerous_actions")
            if isinstance(
                report.get("dangerous_actions"),
                list,
            )
            else []
        )


        def action_description(item):

            if not isinstance(
                item,
                dict
            ):
                return ""

            raw = str(
                item.get(
                    "interaction_type"
                )
                or item.get(
                    "action"
                )
                or ""
            ).strip().lower()

            mapping = {
                "report":
                    "denunciou a mensagem como suspeita",
                "report_email":
                    "denunciou a mensagem como suspeita",
                "denounce":
                    "denunciou a mensagem como suspeita",
                "denunc":
                    "denunciou a mensagem como suspeita",
                "inspect":
                    "analisou os sinais da mensagem antes de continuar",
                "inspect_sender":
                    "verificou os dados do remetente",
                "details":
                    "consultou os detalhes do remetente",
                "inspect_url":
                    "verificou cuidadosamente o endereço da ligação",
                "open_link":
                    "abriu a ligação apresentada na mensagem",
                "open_form":
                    "abriu o formulário apresentado",
                "submit_credentials":
                    "introduziu dados de acesso no formulário",
                "submit_personal_data":
                    "introduziu dados pessoais no formulário",
                "submit_mfa":
                    "introduziu um código de segurança",
                "refuse_mfa":
                    "recusou partilhar o código de segurança",
                "leave_page":
                    "saiu da página sem fornecer mais informação",
                "download_attachment":
                    "descarregou o ficheiro apresentado",
                "inspect_attachment":
                    "analisou o ficheiro antes de o abrir",
                "inspect_file":
                    "verificou as propriedades do ficheiro",
                "execute_file":
                    "abriu o ficheiro descarregado",
                "delete_file":
                    "eliminou o ficheiro suspeito",
                "finish":
                    "terminou a experiência",
            }

            if raw in mapping:
                return mapping[raw]

            for key, value in mapping.items():

                if key in raw:
                    return value

            return "avançou numa etapa da situação simulada"
        # ====================================================
        # DADOS DO FORMULÁRIO — DISPONÍVEIS ANTES DA NARRATIVA
        # ====================================================

        form_data = report.get(
            "form_data",
            {}
        )

        if not isinstance(
            form_data,
            dict
        ):
            form_data = {}

        email_value = str(
            form_data.get(
                "email",
                ""
            )
            or ""
        ).strip()

        password_entered = bool(
            form_data.get(
                "password_entered",
                False
            )
        )

        data_shared = (
            report.get("data_shared")
            if isinstance(
                report.get("data_shared"),
                list,
            )
            else []
        )

        decision_history = (
            report.get("decision_history")
            if isinstance(
                report.get("decision_history"),
                list,
            )
            else []
        )

        was_reported = bool(
            report.get(
                "was_reported",
                False,
            )
        )

        descriptions = []

        for item in decision_history:

            if not isinstance(
                item,
                dict,
            ):
                continue

            raw = str(
                item.get(
                    "interaction_type"
                )
                or item.get(
                    "action"
                )
                or ""
            ).strip().lower()

            mapping = {
                "report":
                    "denunciou a mensagem como suspeita",
                "report_email":
                    "denunciou a mensagem como suspeita",
                "denounce":
                    "denunciou a mensagem como suspeita",
                "denunc":
                    "denunciou a mensagem como suspeita",
                "inspect":
                    "analisou os sinais da mensagem antes de continuar",
                "inspect_sender":
                    "verificou os dados do remetente",
                "details":
                    "consultou os detalhes do remetente",
                "inspect_url":
                    "verificou cuidadosamente o endereço da ligação",
                "open_link":
                    "abriu a ligação apresentada na mensagem",
                "open_form":
                    "abriu o formulário apresentado",
                "submit_credentials":
                    "introduziu dados de acesso no formulário",
                "submit_personal_data":
                    "introduziu dados pessoais no formulário",
                "submit_mfa":
                    "introduziu um código de segurança",
                "refuse_mfa":
                    "recusou partilhar o código de segurança",
                "leave_page":
                    "saiu da página sem fornecer mais informação",
                "download_attachment":
                    "descarregou o ficheiro apresentado",
                "inspect_attachment":
                    "analisou o ficheiro antes de o abrir",
                "inspect_file":
                    "verificou as propriedades do ficheiro",
                "execute_file":
                    "abriu o ficheiro descarregado",
                "delete_file":
                    "eliminou o ficheiro suspeito",
                "finish":
                    "terminou a experiência",
            }

            description = mapping.get(
                raw
            )

            if raw in (
                "link",
                "open_link",
            ):
                description = (
                    "abriu a ligação apresentada na mensagem"
                )

            elif raw in (
                "credentials",
                "submit_credentials",
                "login",
            ):
                description = (
                    "introduziu dados de acesso no formulário"
                )

            elif raw in (
                "report",
                "report_email",
            ):
                description = (
                    "denunciou a mensagem como suspeita"
                )

            if not description:

                for key, value in mapping.items():

                    if key in raw:
                        description = value
                        break

            if not description:
                description = (
                    "avançou numa etapa da situação simulada"
                )

            if (
                description
                and description not in descriptions
            ):
                descriptions.append(
                    description
                )

        narrative_parts = []


        narrative = ""


        if was_reported:

            narrative_parts.append(
                "A resposta principal do estudante foi denunciar a mensagem como suspeita."
            )

        if descriptions:

            if was_reported:

                narrative_parts.append(
                    "O percurso registado mostra que "
                    + ", ".join(
                        descriptions
                    )
                    + "."
                )

            else:

                narrative_parts.append(
                    "Durante a experiência, "
                    + ", ".join(
                        descriptions
                    )
                    + "."
                )

        if email_value:

            narrative_parts.append(
                "O endereço de correio electrónico introduzido foi "
                + email_value
                + "."
            )

        if password_entered:

            narrative_parts.append(
                "Foi também introduzida uma palavra-passe; o conteúdo real nunca é guardado nem apresentado."
            )

        if data_shared:

            narrative_parts.append(
                "A informação entregue poderia, num caso real, ser aproveitada para tornar novas tentativas de fraude mais convincentes ou apoiar tentativas de acesso indevido."
            )

        elif was_reported:

            narrative_parts.append(
                "Nenhuma informação sensível foi entregue porque a denúncia interrompeu o percurso de ataque."
            )

        else:

            narrative_parts.append(
                "A experiência terminou sem entrega de informação sensível."
            )

        narrative_parts.append(
            "A principal melhoria é confirmar a origem da mensagem, verificar o endereço verdadeiro do serviço e evitar fornecer credenciais através de ligações inesperadas."
        )

        narrative = " ".join(
            narrative_parts
        )

        if was_reported:
            narrative = (
                "A sua principal decisão foi denunciar a mensagem como suspeita. "
                "O percurso registado mostra que interrompeu a tentativa antes de entregar "
                "informação sensível e concluiu a experiência em segurança. "
                "Foi uma resposta eficaz perante o risco apresentado. "
                "Para reforçar este comportamento no dia-a-dia, confirme sempre a origem "
                "da mensagem, valide o endereço verdadeiro do serviço e prefira os "
                "canais oficiais em vez de ligações inesperadas."
            )

        if dangerous_actions:
            impact = (
                "Num caso real, a informação obtida poderia ser "
                "utilizada para tentar aceder à conta, recolher "
                "mais informação ou preparar novas tentativas de fraude."
            )
        else:
            impact = (
                "As decisões tomadas reduziram a possibilidade "
                "de entregar informação a uma página suspeita."
            )

        improvement = (
            "Pare antes de agir. Confirme o remetente, "
            "verifique o endereço verdadeiro da página e, "
            "perante qualquer dúvida, utilize directamente "
            "o canal oficial."
        )

        # --------------------------------------------------------
        # PDF simples e robusto
        # --------------------------------------------------------

        buffer = BytesIO()

        pdf = canvas.Canvas(
            buffer,
            pagesize=A4,
        )

        page_width, page_height = A4

        # CORES
        blue = colors.HexColor(
            "#2563EB"
        )

        dark = colors.HexColor(
            "#0F172A"
        )

        slate = colors.HexColor(
            "#475569"
        )

        light = colors.HexColor(
            "#F8FAFC"
        )

        line = colors.HexColor(
            "#E2E8F0"
        )

        red = colors.HexColor(
            "#DC2626"
        )

        green = colors.HexColor(
            "#059669"
        )

        # FUNÇÕES DE DESENHO
        def rounded_box(
            x,
            y,
            width,
            height,
            fill,
            stroke=None,
            radius=12,
        ):
            pdf.setFillColor(fill)

            if stroke is not None:
                pdf.setStrokeColor(stroke)
            else:
                pdf.setStrokeColor(fill)

            pdf.roundRect(
                x,
                y,
                width,
                height,
                radius,
                fill=1,
                stroke=1 if stroke else 0,
            )

        def draw_wrapped(
            text,
            x,
            y,
            max_width,
            font="Helvetica",
            size=10,
            leading=15,
            color=slate,
        ):
            pdf.setFont(
                font,
                size,
            )

            pdf.setFillColor(
                color
            )

            words = str(text).split()
            lines = []
            current = ""

            for word in words:
                test = (
                    word
                    if not current
                    else current + " " + word
                )

                if (
                    pdf.stringWidth(
                        test,
                        font,
                        size,
                    )
                    <= max_width
                ):
                    current = test
                else:
                    if current:
                        lines.append(
                            current
                        )
                    current = word

            if current:
                lines.append(
                    current
                )

            for line_text in lines:
                pdf.drawString(
                    x,
                    y,
                    line_text,
                )
                y -= leading

            return y

        margin = 1.6 * cm
        content_width = (
            page_width - 2 * margin
        )

        # --------------------------------------------------------
        # CABEÇALHO
        # --------------------------------------------------------

        rounded_box(
            margin,
            page_height - 4.0 * cm,
            content_width,
            2.45 * cm,
            blue,
        )

        pdf.setFillColor(
            colors.white
        )

        pdf.setFont(
            "Helvetica-Bold",
            19,
        )

        pdf.drawString(
            margin + 0.45 * cm,
            page_height - 2.55 * cm,
            "SICSI III",
        )

        pdf.setFont(
            "Helvetica",
            8,
        )

        pdf.drawString(
            margin + 0.45 * cm,
            page_height - 4.45 * cm,
            "SEGURANÇA DIGITAL",
        )

        pdf.setFont(
            "Helvetica-Bold",
            8,
        )

        pdf.drawRightString(
            page_width - margin - 0.45 * cm,
            page_height - 2.35 * cm,
            "RELATÓRIO DE EXPERIÊNCIA",
        )

        pdf.setFont(
            "Helvetica",
            7,
        )

        pdf.drawRightString(
            page_width - margin - 0.45 * cm,
            page_height - 2.72 * cm,
            "PHISHING",
        )

        y = (
            page_height
            - 5.0 * cm
        )

        pdf.setFillColor(
            blue
        )

        pdf.setFont(
            "Helvetica-Bold",
            8,
        )

        pdf.drawString(
            margin,
            y,
            "EXPERIÊNCIA CONCLUÍDA",
        )

        y -= 0.65 * cm

        pdf.setFillColor(
            dark
        )

        pdf.setFont(
            "Helvetica-Bold",
            21,
        )

        y = draw_wrapped(
            title,
            margin,
            y,
            content_width,
            font="Helvetica-Bold",
            size=21,
            leading=25,
            color=dark,
        )

        y -= 0.25 * cm

        # --------------------------------------------------------
        # METADADOS
        # --------------------------------------------------------

        meta_y = y - 2.35 * cm

        box_gap = 0.25 * cm
        box_width = (
            (
                content_width
                - 2 * box_gap
            )
            / 3
        )

        meta_items = [
            (
                "ESTUDANTE",
                student_name,
            ),
            (
                "CATEGORIA",
                category,
            ),
            (
                "DIFICULDADE",
                difficulty,
            ),
        ]

        for index, (
            label,
            value,
        ) in enumerate(meta_items):

            x = (
                margin
                + index
                * (
                    box_width
                    + box_gap
                )
            )

            rounded_box(
                x,
                meta_y,
                box_width,
                1.8 * cm,
                light,
                line,
                10,
            )

            pdf.setFillColor(
                slate
            )

            pdf.setFont(
                "Helvetica-Bold",
                7,
            )

            pdf.drawString(
                x + 0.3 * cm,
                meta_y + 1.28 * cm,
                label,
            )

            pdf.setFillColor(
                dark
            )

            pdf.setFont(
                "Helvetica-Bold",
                9,
            )

            draw_wrapped(
                value,
                x + 0.3 * cm,
                meta_y + 0.78 * cm,
                box_width - 0.6 * cm,
                font="Helvetica-Bold",
                size=9,
                leading=11,
                color=dark,
            )

        y = meta_y - 0.65 * cm

        # --------------------------------------------------------
        # RESULTADO
        # --------------------------------------------------------

        result_height = 3.0 * cm

        rounded_box(
            margin,
            y - result_height,
            content_width,
            result_height,
            dark,
        )

        pdf.setFillColor(
            colors.HexColor("#BFDBFE")
        )

        pdf.setFont(
            "Helvetica-Bold",
            7,
        )

        pdf.drawString(
            margin + 0.45 * cm,
            y - 0.7 * cm,
            "RESULTADO",
        )

        pdf.setFillColor(
            colors.white
        )

        pdf.setFont(
            "Helvetica-Bold",
            26,
        )

        pdf.drawString(
            margin + 0.45 * cm,
            y - 1.55 * cm,
            f"{score}/100",
        )

        pdf.setFont(
            "Helvetica-Bold",
            8,
        )

        pdf.drawString(
            margin + 0.5 * cm,
            y - 2.15 * cm,
            classification,
        )

        pdf.setFillColor(
            colors.HexColor("#DCEAFE")
        )

        draw_wrapped(
            "A pontuação resume o comportamento demonstrado "
            "durante a experiência. O mais importante é perceber "
            "onde o risco aumentou e como agir melhor no futuro.",
            margin + 5.1 * cm,
            y - 0.85 * cm,
            content_width - 5.6 * cm,
            font="Helvetica",
            size=9,
            leading=14,
            color=colors.HexColor("#DCEAFE"),
        )

        y -= result_height + 0.7 * cm

        # --------------------------------------------------------
        # FEEDBACK
        # --------------------------------------------------------

        pdf.setFillColor(
            blue
        )

        pdf.setFont(
            "Helvetica-Bold",
            8,
        )

        pdf.drawString(
            margin,
            y,
            "O SEU FEEDBACK",
        )

        y -= 0.55 * cm

        pdf.setFillColor(
            dark
        )

        pdf.setFont(
            "Helvetica-Bold",
            14,
        )

        pdf.drawString(
            margin,
            y,
            "O que aconteceu",
        )

        y -= 0.60 * cm

        y = draw_wrapped(
            narrative,
            margin,
            y,
            content_width,
            font="Helvetica",
            size=9.5,
            leading=15,
            color=slate,
        )

        y -= 0.35 * cm

        # --------------------------------------------------------
        # INFORMAÇÃO
        # --------------------------------------------------------

        pdf.setFillColor(
            red
        )

        pdf.setFont(
            "Helvetica-Bold",
            8,
        )

        pdf.drawString(
            margin,
            y,
            "INFORMAÇÃO POTENCIALMENTE EXPOSTA",
        )

        y -= 0.55 * cm

        pdf.setFillColor(
            dark
        )

        pdf.setFont(
            "Helvetica-Bold",
            14,
        )

        pdf.drawString(
            margin,
            y,
            "O que poderia ter sido aproveitado",
        )

        y -= 0.45 * cm

        information_height = (
            2.65 * cm
            if data_shared
            else 1.8 * cm
        )

        rounded_box(
            margin,
            y - information_height,
            content_width,
            information_height,
            colors.HexColor("#FEF2F2"),
            colors.HexColor("#FECACA"),
            10,
        )

        info_y = (
            y
            - 0.6 * cm
        )

        if email_value:
            pdf.setFillColor(
                red
            )

            pdf.setFont(
                "Helvetica-Bold",
                7,
            )

            pdf.drawString(
                margin + 0.35 * cm,
                info_y,
                "ENDEREÇO DE CORREIO ELECTRÓNICO",
            )

            info_y -= 0.42 * cm

            pdf.setFillColor(
                dark
            )

            pdf.setFont(
                "Helvetica-Bold",
                10,
            )

            pdf.drawString(
                margin + 0.35 * cm,
                info_y,
                email_value,
            )

            info_y -= 0.42 * cm

            info_y = draw_wrapped(
                "Poderia ser utilizado para tornar futuras "
                "tentativas de fraude mais convincentes.",
                margin + 0.35 * cm,
                info_y,
                content_width - 0.7 * cm,
                font="Helvetica",
                size=8,
                leading=12,
                color=slate,
            )

        if password_entered:

            if email_value:
                info_y -= 0.18 * cm

            pdf.setFillColor(
                red
            )

            pdf.setFont(
                "Helvetica-Bold",
                7,
            )

            pdf.drawString(
                margin + 0.35 * cm,
                info_y,
                "PALAVRA-PASSE",
            )

            info_y -= 0.42 * cm

            pdf.setFillColor(
                dark
            )

            pdf.setFont(
                "Helvetica-Bold",
                9,
            )

            pdf.drawString(
                margin + 0.35 * cm,
                info_y,
                "Introduzida — conteúdo não guardado",
            )

        if not data_shared:

            pdf.setFillColor(
                green
            )

            pdf.setFont(
                "Helvetica-Bold",
                9,
            )

            if was_reported:

                pdf.drawString(
                    margin + 0.35 * cm,
                    info_y,
                    "Nenhuma informação sensível foi entregue.",
                )

                info_y -= 0.42 * cm

                info_y = draw_wrapped(
                    "A denúncia interrompeu a tentativa antes da recolha de dados.",
                    margin + 0.35 * cm,
                    info_y,
                    content_width - 0.7 * cm,
                    font="Helvetica",
                    size=8,
                    leading=12,
                    color=slate,
                )

            else:

                pdf.drawString(
                    margin + 0.35 * cm,
                    info_y,
                    "Nenhuma informação sensível foi entregue.",
                )

        y -= information_height + 0.55 * cm

        # --------------------------------------------------------
        # IMPACTO / MELHORIA
        # --------------------------------------------------------

        half = (
            content_width - 0.3 * cm
        ) / 2

        card_height = 4.2 * cm

        # Impacto
        rounded_box(
            margin,
            y - card_height,
            half,
            card_height,
            colors.HexColor("#FFF7F7"),
            colors.HexColor("#FECACA"),
            10,
        )

        pdf.setFillColor(
            red
        )

        pdf.setFont(
            "Helvetica-Bold",
            7,
        )

        pdf.drawString(
            margin + 0.35 * cm,
            y - 0.58 * cm,
            "IMPACTO POSSÍVEL",
        )

        draw_wrapped(
            impact,
            margin + 0.35 * cm,
            y - 1.05 * cm,
            half - 0.7 * cm,
            font="Helvetica",
            size=8.5,
            leading=13,
            color=slate,
        )

        # Melhoria
        improvement_x = (
            margin
            + half
            + 0.3 * cm
        )

        rounded_box(
            improvement_x,
            y - card_height,
            half,
            card_height,
            colors.HexColor("#EFF6FF"),
            colors.HexColor("#BFDBFE"),
            10,
        )

        pdf.setFillColor(
            blue
        )

        pdf.setFont(
            "Helvetica-Bold",
            7,
        )

        pdf.drawString(
            improvement_x + 0.35 * cm,
            y - 0.58 * cm,
            "COMO MELHORAR",
        )

        draw_wrapped(
            improvement,
            improvement_x + 0.35 * cm,
            y - 1.05 * cm,
            half - 0.7 * cm,
            font="Helvetica",
            size=8.5,
            leading=13,
            color=slate,
        )

        y -= card_height + 0.65 * cm

        # --------------------------------------------------------
        # RODAPÉ
        # --------------------------------------------------------

        pdf.setStrokeColor(
            line
        )

        pdf.line(
            margin,
            1.55 * cm,
            page_width - margin,
            1.55 * cm,
        )

        pdf.setFillColor(
            slate
        )

        pdf.setFont(
            "Helvetica",
            7,
        )

        pdf.drawString(
            margin,
            1.15 * cm,
            "SICSI III • Segurança Digital",
        )

        pdf.drawRightString(
            page_width - margin,
            1.15 * cm,
            "Relatório de aprendizagem",
        )

        pdf.save()

        pdf_bytes = buffer.getvalue()

        if not pdf_bytes:
            raise RuntimeError(
                "O PDF foi gerado sem conteúdo."
            )

        safe_filename = (
            "SICSI III RELACTÓRIO.pdf"
        )

        return StreamingResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition":
                    f'attachment; filename="{safe_filename}"',
                "Content-Length":
                    str(len(pdf_bytes)),
                "Cache-Control":
                    "no-store",
            },
        )

    except HTTPException:
        raise

    except Exception as exc:

        print(
            "========== ERRO PDF SICSI III =========="
        )

        print(
            f"{type(exc).__name__}: {exc}"
        )

        print(
            "========================================"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Falha na geração do relatório PDF: "
                + type(exc).__name__
                + ": "
                + str(exc)
            ),
        )
@app.delete("/api/simulations/{simulation_id}/result/{user_id}")
def clear_simulation_result(
    simulation_id: str,
    user_id: str,
):
    key = simulation_session_key(
        user_id,
        simulation_id,
    )

    SIMULATION_SESSIONS.pop(
        key,
        None,
    )

    return {
        "status": "deleted",
    }