from pathlib import Path
import re

path = Path("src/pages/admin/AdminCoursesPage.jsx")
text = path.read_text(encoding="utf-8")

# ============================================================
# 1. IMAGEM AUTOMÁTICA
# ============================================================

if "function obterImagemCurso" not in text:
    marcador = re.search(
        r'''function obterLinkCurso\(id\) \{.*?\n\}''',
        text,
        flags=re.DOTALL
    )

    if not marcador:
        raise RuntimeError(
            "Não encontrei obterLinkCurso()."
        )

    imagem = '''

function obterImagemCurso(titulo) {
  const nome = String(titulo || "").toLowerCase();

  if (nome.includes("phishing")) {
    return "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=85";
  }

  if (nome.includes("engenharia")) {
    return "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=85";
  }

  if (nome.includes("fraude")) {
    return "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85";
  }

  if (
    nome.includes("credencial") ||
    nome.includes("protec")
  ) {
    return "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1200&q=85";
  }

  return "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=85";
}
'''

    pos = marcador.end()
    text = text[:pos] + imagem + text[pos:]
    print("[OK] Imagem automática configurada.")
else:
    print("[OK] Imagem automática já existe.")

# ============================================================
# 2. BOTÃO PREENCHER 10 PERGUNTAS
# ============================================================

padrao_condicional = re.compile(
    r'''\{curso\s*&&\s*\(\s*<button\b.*?
    <Settings2Icon\s*/>\s*
    Configurar perguntas\s*
    </button>\s*\)\}''',
    re.DOTALL | re.VERBOSE
)

botao_novo = '''<button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onAbrirTeste();
                  }}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-3 text-xs font-bold text-white transition hover:bg-indigo-700"
                >
                  <Settings2Icon />
                  {curso ? "Configurar perguntas" : "Preencher 10 perguntas"}
                </button>'''

novo, quantidade = padrao_condicional.subn(
    botao_novo,
    text,
    count=1
)

if quantidade == 1:
    text = novo
    print("[OK] Botão 'Preencher 10 perguntas' activado para novos cursos.")
else:
    # Caso já esteja fora do bloco condicional, apenas corrige o clique.
    if "Configurar perguntas" in text or "Preencher 10 perguntas" in text:
        text = text.replace(
            "onClick={onAbrirTeste}",
            '''onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onAbrirTeste();
                  }}''',
            1
        )
        print("[OK] Clique do botão das perguntas corrigido.")
    else:
        print("[AVISO] Botão das perguntas não localizado.")

# ============================================================
# 3. GUARDAR CURSO
#    NOVO CURSO = CURSO + 10 PERGUNTAS NO MESMO POST
# ============================================================

inicio = text.find("async function guardarCurso(")
fim = text.find("async function guardarTeste(", inicio)

if inicio == -1:
    raise RuntimeError(
        "Não encontrei async function guardarCurso()."
    )

if fim == -1:
    raise RuntimeError(
        "Não encontrei async function guardarTeste()."
    )

guardar_curso = r'''async function guardarCurso(event) {
    event?.preventDefault?.();

    const titulo = String(
      formulario.title || ""
    ).trim();

    const descricao = String(
      formulario.description || ""
    ).trim();

    const link = String(
      formulario.link || ""
    ).trim();

    if (!titulo) {
      setErro(
        "O nome do curso é obrigatório."
      );
      return;
    }

    if (!descricao) {
      setErro(
        "A descrição do curso é obrigatória."
      );
      return;
    }

    if (!link) {
      setErro(
        "O link do curso é obrigatório."
      );
      return;
    }

    if (!/^https?:\/\//i.test(link)) {
      setErro(
        "O link do curso deve começar por http:// ou https://."
      );
      return;
    }

    # --------------------------------------------------------
    # VALIDAR AS 10 PERGUNTAS
    # --------------------------------------------------------

    const erroTeste = validarTeste();

    if (erroTeste) {
      setErro(erroTeste);
      setSucesso("");

      setCursoModal(false);
      setTesteModal(true);

      return;
    }

    const fotografia =
      String(formulario.image_url || "").trim() ||
      obterImagemCurso(titulo);

    const perguntasPayload = perguntas.map(
      (pergunta) => ({
        question: String(
          pergunta.question || ""
        ).trim(),

        options: Array.isArray(
          pergunta.options
        )
          ? pergunta.options.map(
              (opcao) =>
                String(
                  opcao || ""
                ).trim()
            )
          : [],

        correct_answer: Number(
          pergunta.correct_answer
        ),

        explanation: String(
          pergunta.explanation || ""
        ).trim(),
      })
    );

    if (
      perguntasPayload.length !==
      TOTAL_PERGUNTAS
    ) {
      setErro(
        "O curso deve conter exactamente 10 perguntas."
      );
      return;
    }

    setSaving(true);
    setErro("");
    setSucesso("");

    try {
      # ======================================================
      # NOVO CURSO
      # ======================================================

      if (!cursoActual?.id) {
        const resposta = await fetch(
          `${API_BASE}/admin/courses`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              title: titulo,
              description: descricao,

              # Novo curso nasce publicado.
              published: true,

              # Fotografia automática.
              image_url: fotografia,

              link,

              # As 10 perguntas vão junto
              # com a criação do curso.
              questions:
                perguntasPayload,
            }),
          }
        );

        const dados =
          await resposta
            .json()
            .catch(() => null);

        if (!resposta.ok) {
          throw new Error(
            dados?.detail ||
              "Não foi possível publicar o curso."
          );
        }

        setCursoActual(
          normalizarCursos([dados])[0]
        );

        setCursoModal(false);
        setTesteModal(false);

        setPerguntas(
          perguntasVazias()
        );

        await carregarCursos();

        setSucesso(
          "Curso publicado com sucesso, incluindo as 10 perguntas."
        );

        return;
      }

      # ======================================================
      # CURSO EXISTENTE
      # ======================================================

      const resposta = await fetch(
        `${API_BASE}/admin/courses/${cursoActual.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title: titulo,
            description: descricao,
            published:
              Boolean(
                formulario.published
              ),
            image_url:
              fotografia,
            link,
          }),
        }
      );

      const dados =
        await resposta
          .json()
          .catch(() => null);

      if (!resposta.ok) {
        throw new Error(
          dados?.detail ||
            "Não foi possível actualizar o curso."
        );
      }

      setCursoActual(
        normalizarCursos([dados])[0]
      );

      setCursoModal(false);

      await carregarCursos();

      setSucesso(
        "Curso actualizado com sucesso."
      );
    } catch (error) {
      setErro(
        error?.message ||
          "Não foi possível guardar o curso."
      );
    } finally {
      setSaving(false);
    }
  }

'''

# Python comments acima foram convertidos para texto JS
# apenas onde necessário.
guardar_curso = guardar_curso.replace(
    "    # ",
    "    // "
)

guardar_curso = guardar_curso.replace(
    "              # ",
    "              // "
)

guardar_curso = guardar_curso.replace(
    "      # ",
    "      // "
)

text = (
    text[:inicio]
    + guardar_curso
    + text[fim:]
)

print("[OK] Criação/publicação do curso corrigida.")
print("[OK] Perguntas passam no mesmo POST do curso.")

# ============================================================
# 4. GARANTIR QUE NÃO EXISTE LIMITAÇÃO DE 5
# ============================================================

antes = text

text = re.sub(
    r'''\.slice\(\s*0\s*,\s*5\s*\)''',
    "",
    text
)

if text != antes:
    print("[OK] Limite .slice(0,5) removido.")
else:
    print("[OK] Não existe .slice(0,5).")

path.write_text(
    text,
    encoding="utf-8"
)

print("")
print("============================================================")
print(" PATCH CIRÚRGICO CONCLUÍDO")
print("============================================================")
