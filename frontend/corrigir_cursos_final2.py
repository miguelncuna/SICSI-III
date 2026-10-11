from pathlib import Path
import re

path = Path("src/pages/admin/AdminCoursesPage.jsx")
text = path.read_text(encoding="utf-8")

erros = []

def substituir(pattern, replacement, nome):
    global text

    novo, total = re.subn(
        pattern,
        replacement,
        text,
        count=1,
        flags=re.MULTILINE | re.DOTALL
    )

    if total != 1:
        erros.append(nome)
        print(f"[ERRO] Não foi possível corrigir: {nome}")
        return

    text = novo
    print(f"[OK] {nome}")

# ============================================================
# 1. FECHAR MODAL DAS PERGUNTAS
# ============================================================

substituir(
    r'''function fecharTesteModal\(\) \{.*?\n\s*\}''',
    '''function fecharTesteModal() {
    if (saving) return;

    setTesteModal(false);

    if (!cursoActual?.id) {
      setCursoModal(true);
    }
  }''',
    "fechar modal de perguntas"
)

# ============================================================
# 2. BOTÃO "PREENCHER 10 PERGUNTAS"
# ============================================================

padrao_botao = r'''\{curso\s*&&\s*\(\s*<button
\s*type="button"
\s*onClick=\{onAbrirTeste\}
\s*className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-3 text-xs font-bold text-white transition hover:bg-indigo-700"
\s*>
\s*<Settings2Icon />
\s*Configurar perguntas
\s*</button>\s*\)\}'''

novo_botao = '''<button
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

substituir(
    padrao_botao,
    novo_botao,
    "botão de preencher perguntas"
)

# ============================================================
# 3. GUARDAR AS PERGUNTAS
# ============================================================

substituir(
    r'''async function guardarTeste\(\) \{.*?(?=\n\s*async function )''',
    '''async function guardarTeste() {
    const erroValidacao = validarTeste();

    if (erroValidacao) {
      setErro(erroValidacao);
      setSucesso("");
      return;
    }

    // NOVO CURSO:
    // As perguntas ficam no estado React e serão enviadas
    // juntamente com o POST do curso.
    if (!cursoActual?.id) {
      setTesteModal(false);
      setCursoModal(true);
      setErro("");
      setSucesso(
        "As 10 perguntas foram preenchidas. Agora pode publicar o curso."
      );
      return;
    }

    // CURSO EXISTENTE:
    // Mantém o CRUD original das perguntas.
    setSaving(true);
    setErro("");
    setSucesso("");

    try {
      const existentes = Array.isArray(cursoActual.questions)
        ? cursoActual.questions
        : [];

      const guardadas = [];

      for (let index = 0; index < TOTAL_PERGUNTAS; index += 1) {
        const pergunta = perguntas[index];

        const payload = {
          question: String(pergunta.question || "").trim(),
          options: pergunta.options.map(
            (opcao) => String(opcao || "").trim()
          ),
          correct_answer: Number(pergunta.correct_answer),
          explanation: String(
            pergunta.explanation || ""
          ).trim(),
        };

        const idExistente =
          pergunta.id ||
          existentes[index]?.id;

        let resposta;

        if (idExistente) {
          resposta = await fetch(
            `${API_BASE}/admin/courses/${cursoActual.id}/questions/${idExistente}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            }
          );
        } else {
          resposta = await fetch(
            `${API_BASE}/admin/courses/${cursoActual.id}/questions`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            }
          );
        }

        const dados = await resposta
          .json()
          .catch(() => null);

        if (!resposta.ok) {
          throw new Error(
            dados?.detail ||
              `Não foi possível guardar a pergunta ${index + 1}.`
          );
        }

        guardadas.push(dados);
      }

      setCursoActual((atual) => ({
        ...atual,
        questions: guardadas,
        questions_count: guardadas.length,
      }));

      setPerguntas(
        normalizarPerguntas(guardadas)
      );

      await carregarCursos();

      setTesteModal(false);
      setCursoModal(true);

      setSucesso(
        "As 10 perguntas foram guardadas com sucesso."
      );
    } catch (error) {
      setErro(
        error?.message ||
          "Não foi possível guardar as perguntas."
      );
    } finally {
      setSaving(false);
    }
  }

''',
    "guardar perguntas"
)

# ============================================================
# 4. GUARDAR / PUBLICAR CURSO
# ============================================================

substituir(
    r'''async function guardarCurso\(.*?\) \{.*?(?=\n\s*async function guardarTeste\(\))''',
    '''async function guardarCurso(event) {
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
      setErro("O nome do curso é obrigatório.");
      return;
    }

    if (!descricao) {
      setErro("A descrição do curso é obrigatória.");
      return;
    }

    if (!link) {
      setErro("O link do curso é obrigatório.");
      return;
    }

    if (!/^https?:\\\\/\\\\//i.test(link)) {
      setErro(
        "O link do curso deve começar por http:// ou https://."
      );
      return;
    }

    // VERIFICA AS 10 PERGUNTAS ANTES DE PUBLICAR
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

        options: pergunta.options.map(
          (opcao) =>
            String(opcao || "").trim()
        ),

        correct_answer: Number(
          pergunta.correct_answer
        ),

        explanation: String(
          pergunta.explanation || ""
        ).trim(),
      })
    );

    // GARANTIA FINAL
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
      // =====================================================
      // NOVO CURSO
      // =====================================================

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
              published: true,
              image_url: fotografia,
              link,
              questions:
                perguntasPayload,
            }),
          }
        );

        const dados = await resposta
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

      // =====================================================
      // CURSO EXISTENTE
      // =====================================================

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

      const dados = await resposta
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

''',
    "criação e publicação"
)

# ============================================================
# 5. ELIMINAR QUALQUER LIMITE DE 5 CURSOS NO FRONTEND
# ============================================================

antes = text

text = re.sub(
    r'''\.slice\(\s*0\s*,\s*5\s*\)''',
    "",
    text
)

text = re.sub(
    r'''\.slice\(\s*0\s*,\s*5\s*\)''',
    "",
    text
)

if text != antes:
    print("[OK] Limite de 5 cursos removido.")
else:
    print("[INFO] Não existe limite slice(0,5) no frontend.")

# ============================================================
# 6. GARANTIR LISTA COMPLETA
# ============================================================

# Mantém todos os cursos filtrados pela pesquisa/filtro actual.
# Não altera a lógica dos filtros.
text = text.replace(
    'cursosFiltrados.map(',
    'cursosFiltrados.map('
)

path.write_text(
    text,
    encoding="utf-8"
)

print("")
print("==================================================")
print(" CORRECÇÃO FINAL DOS CURSOS TERMINADA")
print("==================================================")

if erros:
    print("")
    print("ATENÇÃO — alterações que NÃO foram encontradas:")
    for erro in erros:
        print(" -", erro)
else:
    print("Todas as alterações críticas foram aplicadas.")
