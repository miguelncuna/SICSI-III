$ErrorActionPreference = "Continue"

$root = Get-Location
$frontend = Join-Path $root "frontend"
$backend = Join-Path $root "backend"
$data = Join-Path $backend "data"

$OK = 0
$WARN = 0
$ERR = 0

function OK($m) {
    $script:OK++
    Write-Host "[ OK ] $m" -ForegroundColor Green
}

function WARN($m) {
    $script:WARN++
    Write-Host "[WARN] $m" -ForegroundColor Yellow
}

function ERR($m) {
    $script:ERR++
    Write-Host "[ERR ] $m" -ForegroundColor Red
}

function SECTION($m) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host $m -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "############################################################" -ForegroundColor Blue
Write-Host "#                 AUDITORIA SICSI III                      #" -ForegroundColor Blue
Write-Host "############################################################" -ForegroundColor Blue

# ------------------------------------------------------------
# 1. ESTRUTURA
# ------------------------------------------------------------

SECTION "1. ESTRUTURA"

$required = @(
    "frontend",
    "frontend\src",
    "frontend\src\App.jsx",
    "frontend\src\main.jsx",
    "frontend\src\index.css",
    "frontend\src\context\AuthContext.jsx",
    "frontend\src\services\api.js",
    "frontend\src\pages\public",
    "frontend\src\pages\student",
    "frontend\src\pages\admin",
    "frontend\src\layouts",
    "backend",
    "backend\main.py",
    "backend\data",
    "backend\data\users.json",
    "backend\data\courses.json",
    "backend\data\assessments.json",
    "backend\data\simulations.json",
    "backend\data\certificates.json"
)

foreach ($item in $required) {
    if (Test-Path (Join-Path $root $item)) {
        OK $item
    }
    else {
        ERR "Em falta: $item"
    }
}

# ------------------------------------------------------------
# 2. JSON
# ------------------------------------------------------------

SECTION "2. JSON"

$jsonNames = @(
    "users.json",
    "courses.json",
    "assessments.json",
    "simulations.json",
    "certificates.json"
)

foreach ($name in $jsonNames) {
    $path = Join-Path $data $name

    try {
        $raw = Get-Content $path -Raw -Encoding UTF8
        $obj = $raw | ConvertFrom-Json

        if ($null -eq $obj) {
            WARN "$name está vazio."
        }
        else {
            OK "$name válido."
        }
    }
    catch {
        ERR "$name inválido: $($_.Exception.Message)"
    }
}

# ------------------------------------------------------------
# 3. UTILIZADORES
# ------------------------------------------------------------

SECTION "3. UTILIZADORES"

try {
    $users = Get-Content (Join-Path $data "users.json") -Raw -Encoding UTF8 |
        ConvertFrom-Json

    if ($users -isnot [array]) {
        $users = @($users)
    }

    $students = @($users | Where-Object { $_.role -eq "student" })
    $admins = @($users | Where-Object { $_.role -eq "admin" })

    Write-Host "Total: $($users.Count)"
    Write-Host "Estudantes: $($students.Count)"
    Write-Host "Administradores: $($admins.Count)"

    if ($admins.Count -gt 0) {
        OK "Administrador existente."
    }
    else {
        ERR "Nenhum administrador."
    }

    foreach ($user in $users) {
        $fields = @(
            "id",
            "name",
            "email",
            "role",
            "initial_assessment_completed",
            "awareness_level",
            "assessment_score",
            "recommendations",
            "enrolled_courses",
            "completed_lessons",
            "completed_courses",
            "simulation_results"
        )

        $missing = @(
            $fields | Where-Object {
                $null -eq $user.PSObject.Properties[$_]
            }
        )

        if ($missing.Count -eq 0) {
            OK "Estrutura: $($user.email)"
        }
        else {
            ERR "$($user.email) sem: $($missing -join ', ')"
        }

        if ($user.role -notin @("student", "admin")) {
            ERR "Role inválida: $($user.role)"
        }
    }
}
catch {
    ERR "Falha na auditoria de users.json."
}

# ------------------------------------------------------------
# 4. CURSOS
# ------------------------------------------------------------

SECTION "4. CURSOS"

try {
    $courses = Get-Content (Join-Path $data "courses.json") -Raw -Encoding UTF8 |
        ConvertFrom-Json

    if ($courses -isnot [array]) {
        $courses = @($courses)
    }

    Write-Host "Total de cursos: $($courses.Count)"

    if ($courses.Count -gt 0) {
        OK "Existem cursos."
    }
    else {
        WARN "Nenhum curso."
    }

    foreach ($course in $courses) {
        $lessons = @($course.lessons)
        $questions = @($course.questions)

        Write-Host ""
        Write-Host "Curso: $($course.title)" -ForegroundColor Yellow
        Write-Host "  ID: $($course.id)"
        Write-Host "  Aulas: $($lessons.Count)"
        Write-Host "  Perguntas: $($questions.Count)"
        Write-Host "  Publicado: $($course.published)"

        if ($lessons.Count -gt 0) {
            OK "Aulas presentes."
        }
        else {
            WARN "Curso sem aulas."
        }

        if ($questions.Count -eq 10) {
            OK "Exactamente 10 perguntas."
        }
        else {
            ERR "Curso possui $($questions.Count) perguntas; esperado 10."
        }

        foreach ($lesson in $lessons) {
            if (
                $null -eq $lesson.id -or
                $null -eq $lesson.title -or
                $null -eq $lesson.video_url
            ) {
                ERR "Aula incompleta: $($lesson.title)"
            }
        }

        foreach ($question in $questions) {
            if (
                $null -eq $question.id -or
                $null -eq $question.question -or
                $null -eq $question.options -or
                $null -eq $question.correct_answer -or
                $null -eq $question.explanation
            ) {
                ERR "Pergunta incompleta."
                continue
            }

            $ids = @(
                $question.options | ForEach-Object {
                    [string]$_.id
                }
            )

            if ($ids -contains [string]$question.correct_answer) {
                OK "Resposta correcta válida."
            }
            else {
                ERR "Resposta correcta inválida na pergunta: $($question.question)"
            }
        }
    }
}
catch {
    ERR "Falha na auditoria de courses.json."
}

# ------------------------------------------------------------
# 5. SIMULAÇÕES
# ------------------------------------------------------------

SECTION "5. SIMULAÇÕES"

try {
    $simulations = Get-Content (Join-Path $data "simulations.json") -Raw -Encoding UTF8 |
        ConvertFrom-Json

    if ($simulations -isnot [array]) {
        $simulations = @($simulations)
    }

    Write-Host "Total: $($simulations.Count)"

    $categories = @(
        "Phishing",
        "Engenharia Social",
        "Software Pirateado",
        "Contas e Credenciais",
        "Fraudes Digitais"
    )

    foreach ($category in $categories) {
        $count = @(
            $simulations |
            Where-Object { $_.category -eq $category }
        ).Count

        Write-Host "$category : $count"

        if ($count -gt 0) {
            OK "Categoria $category"
        }
        else {
            WARN "Sem simulações: $category"
        }
    }
}
catch {
    ERR "Falha na auditoria de simulations.json."
}

# ------------------------------------------------------------
# 6. CERTIFICADOS
# ------------------------------------------------------------

SECTION "6. CERTIFICADOS"

try {
    $certificates = Get-Content (Join-Path $data "certificates.json") -Raw -Encoding UTF8 |
        ConvertFrom-Json

    if ($null -eq $certificates) {
        $certificates = @()
    }

    if ($certificates -isnot [array]) {
        $certificates = @($certificates)
    }

    Write-Host "Certificados: $($certificates.Count)"

    foreach ($cert in $certificates) {
        $fields = @(
            "id",
            "user_id",
            "course_id",
            "student_name",
            "course_title",
            "score",
            "issued_at"
        )

        $missing = @(
            $fields | Where-Object {
                $null -eq $cert.PSObject.Properties[$_]
            }
        )

        if ($missing.Count -eq 0) {
            OK "Certificado $($cert.id)"
        }
        else {
            ERR "Certificado incompleto: $($missing -join ', ')"
        }
    }
}
catch {
    ERR "Falha na auditoria de certificates.json."
}

# ------------------------------------------------------------
# 7. BACKEND
# ------------------------------------------------------------

SECTION "7. BACKEND"

$python = Join-Path $backend ".venv\Scripts\python.exe"
$main = Join-Path $backend "main.py"

if (Test-Path $python) {
    OK "Python virtual environment."
}
else {
    ERR "Python virtual environment em falta."
}

if (Test-Path $main) {
    OK "main.py encontrado."

    Push-Location $backend

    & $python -m py_compile ".\main.py"

    if ($LASTEXITCODE -eq 0) {
        OK "main.py sem erros de sintaxe."
    }
    else {
        ERR "main.py contém erros de sintaxe."
    }

    Pop-Location
}
else {
    ERR "main.py não encontrado."
}

$backendText = Get-Content $main -Raw -Encoding UTF8

$backendChecks = @(
    '/api/users',
    '/api/courses',
    '/api/assessment',
    '/api/simulations',
    '/api/certificates',
    'completed_lessons',
    'completed_courses',
    'simulation_results',
    'initial_assessment_completed',
    'certificate'
)

foreach ($check in $backendChecks) {
    if ($backendText.Contains($check)) {
        OK "Backend: $check"
    }
    else {
        WARN "Backend sem referência: $check"
    }
}

# ------------------------------------------------------------
# 8. FRONTEND
# ------------------------------------------------------------

SECTION "8. FRONTEND"

$package = Join-Path $frontend "package.json"

if (Test-Path $package) {
    try {
        Get-Content $package -Raw -Encoding UTF8 | ConvertFrom-Json | Out-Null
        OK "package.json válido."
    }
    catch {
        ERR "package.json inválido."
    }
}
else {
    ERR "package.json em falta."
}

$frontendChecks = @(
    "src\App.jsx",
    "src\main.jsx",
    "src\index.css",
    "src\context\AuthContext.jsx",
    "src\services\api.js",
    "src\components\ProtectedRoute.jsx",
    "src\pages\student\AssessmentPage.jsx",
    "src\pages\student\CourseLearningPage.jsx",
    "src\pages\student\CourseTestPage.jsx",
    "src\pages\student\StudentPlaceholders.jsx",
    "src\pages\student\SimulationPage.jsx",
    "src\pages\student\CertificatesPage.jsx",
    "src\pages\student\SettingsPage.jsx",
    "src\pages\admin\AdminDashboardPage.jsx"
)

foreach ($file in $frontendChecks) {
    if (Test-Path (Join-Path $frontend $file)) {
        OK $file
    }
    else {
        ERR "Em falta: $file"
    }
}

# ------------------------------------------------------------
# 9. TESTE FINAL / CERTIFICADO
# ------------------------------------------------------------

SECTION "9. TESTE FINAL E CERTIFICADO"

$testPage = Join-Path $frontend "src\pages\student\CourseTestPage.jsx"

if (Test-Path $testPage) {
    $text = Get-Content $testPage -Raw -Encoding UTF8

    foreach ($check in @(
        "submitTest",
        "orderedAnswers",
        "result.passed",
        "result.certificate",
        "feedback"
    )) {
        if ($text.Contains($check)) {
            OK "CourseTestPage: $check"
        }
        else {
            WARN "CourseTestPage sem: $check"
        }
    }
}

foreach ($check in @(
    "answers: list[str]",
    "percentage = score * 10",
    "passed = percentage >= 70",
    "completed_courses",
    "certificate = {"
)) {
    if ($backendText.Contains($check)) {
        OK "Backend teste/certificado: $check"
    }
    else {
        WARN "Não encontrado exactamente: $check"
    }
}

# ------------------------------------------------------------
# 10. API FRONTEND
# ------------------------------------------------------------

SECTION "10. API FRONTEND"

$api = Join-Path $frontend "src\services\api.js"

if (Test-Path $api) {
    $apiText = Get-Content $api -Raw -Encoding UTF8

    foreach ($check in @(
        "register",
        "login",
        "submitAssessment",
        "getCourses",
        "getCourse",
        "completeLesson",
        "submitTest",
        "simulation"
    )) {
        if ($apiText.Contains($check)) {
            OK "api.js: $check"
        }
        else {
            WARN "api.js sem: $check"
        }
    }

    if ($apiText.Contains('lessons/${lessonId}/complete')) {
        OK "Endpoint de conclusão de aula correcto."
    }
    else {
        WARN "Endpoint de conclusão de aula não confirmado."
    }
}

# ------------------------------------------------------------
# 11. BUILD
# ------------------------------------------------------------

SECTION "11. BUILD FRONTEND"

Push-Location $frontend

if (Test-Path ".\node_modules") {
    OK "node_modules."
}
else {
    ERR "node_modules em falta."
}

npm.cmd run build

if ($LASTEXITCODE -eq 0) {
    OK "npm.cmd run build concluído."
}
else {
    ERR "npm.cmd run build falhou."
}

Pop-Location

# ------------------------------------------------------------
# 12. SERVIÇOS
# ------------------------------------------------------------

SECTION "12. SERVIÇOS HTTP"

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:8000/docs" `
        -TimeoutSec 5 `
        -UseBasicParsing

    if ($response.StatusCode -eq 200) {
        OK "Backend localhost:8000"
    }
}
catch {
    WARN "Backend localhost:8000 não está acessível."
}

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:5173" `
        -TimeoutSec 5 `
        -UseBasicParsing

    if ($response.StatusCode -eq 200) {
        OK "Frontend localhost:5173"
    }
}
catch {
    WARN "Frontend localhost:5173 não está acessível."
}

# ------------------------------------------------------------
# RESULTADO
# ------------------------------------------------------------

SECTION "RESULTADO FINAL"

Write-Host ""
Write-Host "OK     : $OK" -ForegroundColor Green
Write-Host "AVISOS : $WARN" -ForegroundColor Yellow
Write-Host "ERROS  : $ERR" -ForegroundColor Red
Write-Host ""

if ($ERR -eq 0 -and $WARN -eq 0) {
    Write-Host "STATUS: AUDITORIA LIMPA" -ForegroundColor Green
}
elseif ($ERR -eq 0) {
    Write-Host "STATUS: SEM ERROS CRÍTICOS — REVER AVISOS" -ForegroundColor Yellow
}
else {
    Write-Host "STATUS: EXISTEM ERROS A CORRIGIR" -ForegroundColor Red
}

Write-Host ""
Write-Host "========== FIM DA AUDITORIA SICSI III ==========" -ForegroundColor Cyan
