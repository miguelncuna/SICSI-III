from pathlib import Path
import re

path = Path("src/pages/admin/AdminCoursesPage.jsx")
text = path.read_text(encoding="utf-8")

print("")
print("============================================================")
print(" SICSI III - CORRECÇÃO DEFINITIVA DO FLUXO DE CURSOS")
print("============================================================")
print("")

# ============================================================
# FUNÇÃO AUXILIAR
# ============================================================

def substituir_funcao(nome, nova_funcao, proximo_nome):
    global text

    inicio = text.find(f"function {nome}(")

    if inicio == -1:
        raise RuntimeError(
            f"Função {nome} não encontrada."
        )

    fim = text.find(
        f"function {proximo_nome}(",
        inicio + 1
    )

    if fim == -1:
        raise RuntimeError(
            f"Limite da função {nome} não encontrado."
        )

    text = (
        text[:inicio]
        + nova_funcao
        + text[fim:]
    )

    print(f"[OK] {nome}() corrigida.")


# ============================================================
# 1. FOTOGRAFIA AUTOMÁTICA
# ============================================================

if "function obterImagemCurso(" not in text:
    inicio = text.find("function obterLinkCurso(")

    if inicio == -1:
        raise RuntimeError(
            "obterLinkCurso() não encontrada."
        )

    fim = text.find("\n}", inicio)

    if fim == -1:
        raise RuntimeError(
            "Fim de obterLinkCurso() não encontrado."
        )

    fim += 2

    imagem = '''

function obterImagemCurso(titulo) {
  const nome = String(
    titulo || ""
  ).toLowerCase();

  const imagens = [
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=85",
  ];

  if (
    nome.includes("phishing") ||
    nome.includes("engenharia")
  ) {
    return imagens[0];
  }

  if (
    nome.includes("fraude") ||
    nome.includes("banco")
  ) {
    return imagens[1];
  }

  if (
    nome.includes("senha") ||
    nome.includes("credencial") ||
    nome.includes("protec")
  ) {
    return imagens[2];
  }

  return imagens[
    Math.abs(
      Array.from(nome).reduce(
        (total, letra) =>
          total + letra.charCodeAt(0),
        0
      )
    ) % imagens.length
  ];
}
'''

    text = (
        text[:fim]
        + imagem
        + text[fim:]
    )

    print("[OK] Sistema de fotografias automáticas criado.")
else:
    print("[OK] Fotografias automáticas já existem.")


# ============================================================
# 2. SUBSTITUIR COMPLETAMENTE O MODAL DE CURSO
# ============================================================

inicio = text.find("function ModalCurso(")
fim = text.find("function Settings2Icon()", inicio)

if inicio == -1 or fim == -1:
    raise RuntimeError(
        "ModalCurso() não encontrado."
    )

modal_curso = '''function ModalCurso({
  aberto,
  curso,
  formulario,
  setFormulario,
  saving,
  onClose,
  onSubmit,
  onAbrirTeste,
  erro,
}) {
  if (!aberto) return null;

  const niveis = [
    {
      valor: "Básico",
      descricao: "Fundamentos essenciais",
    },
    {
      valor: "Intermédio",
      descricao: "Aplicação prática",
    },
    {
      valor: "Avançado",
      descricao: "Domínio aprofundado",
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-md sm:p-5">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl">

        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">
              Gestão de formação
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
              {curso ? "Editar curso" : "Novo curso"}
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Configure o conteúdo antes de disponibilizá-lo aos estudantes.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {erro && (
          <div className="shrink-0 border-b border-red-100 bg-red-50 px-5 py-3.5 sm:px-7">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-red-600">
                  Atenção
                </p>

                <p className="mt-0.5 text-xs font-semibold leading-5 text-red-700">
                  {erro}
                </p>
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={onSubmit}
          noValidate
          className="min-h-0 overflow-y-auto"
        >
          <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_300px] sm:p-7">

            <div className="space-y-5">

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <BookOpen className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-950">
                      Informações do curso
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Dados apresentados aos estudantes.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">

                  <CampoCurso titulo="Nome do curso">
                    <input
                      value={formulario.title || ""}
                      onChange={(event) =>
                        setFormulario((atual) => ({
                          ...atual,
                          title: event.target.value,
                        }))
                      }
                      placeholder="Ex.: Segurança Digital"
                      disabled={saving}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </CampoCurso>

                  <CampoCurso titulo="Descrição">
                    <textarea
                      value={formulario.description || ""}
                      onChange={(event) =>
                        setFormulario((atual) => ({
                          ...atual,
                          description:
                            event.target.value,
                        }))
                      }
                      rows={5}
                      placeholder="Descreva o que o estudante vai aprender..."
                      disabled={saving}
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-6 text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </CampoCurso>

                  <CampoCurso titulo="Nível do curso">
                    <div className="grid gap-2 sm:grid-cols-3">
                      {niveis.map((nivel) => {
                        const activo =
                          formulario.level === nivel.valor;

                        return (
                          <button
                            key={nivel.valor}
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              setFormulario((atual) => ({
                                ...atual,
                                level:
                                  nivel.valor,
                              }))
                            }
                            aria-pressed={activo}
                            className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                              activo
                                ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black">
                                {nivel.valor}
                              </span>

                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                  activo
                                    ? "border-white/50 bg-white/15"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                {activo && (
                                  <span className="h-2 w-2 rounded-full bg-white" />
                                )}
                              </span>
                            </div>

                            <p
                              className={`mt-2 text-[9px] font-semibold leading-4 ${
                                activo
                                  ? "text-blue-100"
                                  : "text-slate-400"
                              }`}
                            >
                              {nivel.descricao}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </CampoCurso>

                  <CampoCurso titulo="Endereço do curso">
                    <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3.5">
                      <Link2 className="h-4 w-4 shrink-0 text-blue-600" />

                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-blue-500">
                          Gerado automaticamente
                        </p>

                        <p className="mt-0.5 truncate text-xs font-semibold text-blue-700">
                          {curso?.id
                            ? `${window.location.origin}/student/cursos/${curso.id}`
                            : "Será criado automaticamente ao publicar"}
                        </p>
                      </div>

                      {curso?.id && (
                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(
                              `${window.location.origin}/student/cursos/${curso.id}`
                            )
                          }
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm transition hover:bg-blue-100"
                          title="Copiar endereço"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </CampoCurso>

                </div>
              </div>

              <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-5">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                  <div>
                    <h3 className="text-sm font-black text-slate-950">
                      Fotografia automática
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      O sistema selecciona automaticamente uma imagem adequada ao tema do curso. O administrador não precisa de introduzir qualquer link.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            <aside className="space-y-4">

              <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                  <ClipboardCheck className="h-5 w-5" />
                </div>

                <h3 className="mt-4 text-sm font-black text-slate-950">
                  Teste final
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  O curso precisa de 10 perguntas, cada uma com quatro opções, uma resposta certa e uma explicação.
                </p>

                <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Estrutura
                    </span>

                    <span className="text-lg font-black text-indigo-700">
                      10 perguntas
                    </span>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div className="h-2 w-full rounded-full bg-indigo-500" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onAbrirTeste();
                  }}
                  disabled={saving}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3.5 text-xs font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Settings2Icon />
                  {curso
                    ? "Configurar perguntas"
                    : "Preencher 10 perguntas"}
                </button>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-3">
                  <Eye className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Publicação
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-700">
                      {formulario.published
                        ? "Curso publicado após validação."
                        : "Curso será guardado como rascunho."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFormulario((atual) => ({
                      ...atual,
                      published:
                        !atual.published,
                    }))
                  }
                  disabled={saving}
                  className={`mt-4 flex h-10 w-full items-center justify-between rounded-2xl px-4 text-xs font-black transition ${
                    formulario.published
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <span>
                    {formulario.published
                      ? "PUBLICADO"
                      : "RASCUNHO"}
                  </span>

                  <span
                    className={`h-6 w-6 rounded-full bg-white shadow transition ${
                      formulario.published
                        ? "translate-x-0"
                        : ""
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 text-sm font-black text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}

                  {curso
                    ? "Guardar alterações"
                    : "Publicar curso"}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
              </div>

            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}

'''

text = (
    text[:inicio]
    + modal_curso
    + text[fim:]
)

print("[OK] ModalNovoCurso reconstruído.")

# ============================================================
# 3. MODAL DAS PERGUNTAS — MOSTRAR ERROS
# ============================================================

inicio = text.find("function ModalTeste(")

if inicio == -1:
    raise RuntimeError(
        "ModalTeste() não encontrado."
    )

fim = text.find("function ", inicio + 20)

if fim == -1:
    fim = len(text)

modal_teste = text[inicio:fim]

if "  erro," not in modal_teste:
    modal_teste = modal_teste.replace(
        "  onSave,\n}) {",
        "  onSave,\n  erro,\n}) {",
        1
    )

if "{erro && (" not in modal_teste:
    marcador = "  if (!aberto) return null;\n"

    if marcador not in modal_teste:
        raise RuntimeError(
            "Não encontrei o início do ModalTeste."
        )

    banner = '''  if (!aberto) return null;

  const mostrarErro = erro ? (
    <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-red-600">
        Atenção
      </p>

      <p className="mt-1 text-xs font-semibold leading-5 text-red-700">
        {erro}
      </p>
    </div>
  ) : null;

'''

    modal_teste = modal_teste.replace(
        marcador,
        banner,
        1
    )

    # Coloca o alerta imediatamente antes do conteúdo principal.
    retorno = modal_teste.find("  return (")

    if retorno == -1:
        raise RuntimeError(
            "Return do ModalTeste não encontrado."
        )

    pos = retorno + len("  return (\n")

    modal_teste = (
        modal_teste[:pos]
        + "    {mostrarErro}\n"
        + modal_teste[pos:]
    )

text = (
    text[:inicio]
    + modal_teste
    + text[fim:]
)

print("[OK] ModalTeste preparado para mostrar erros.")

# ============================================================
# 4. ABRIR NOVO CURSO
# ============================================================

substituir_funcao(
    "abrirNovoCurso",
    '''function abrirNovoCurso() {
    setCursoActual(null);

    setFormulario({
      ...CURSO_VAZIO,
      published: true,
      image_url: "",
      link: "",
    });

    setPerguntas(
      perguntasVazias()
    );

    setErro("");
    setSucesso("");

    setTesteModal(false);
    setCursoModal(true);
  }

  ''',
    "abrirEditarCurso"
)

# ============================================================
# 5. EDITAR CURSO
# ============================================================

substituir_funcao(
    "abrirEditarCurso",
    '''function abrirEditarCurso(curso) {
    setCursoActual(curso);

    setFormulario({
      title: curso.title || "",
      description:
        curso.description || "",
      level:
        curso.level || "Básico",
      published:
        Boolean(curso.published),
      image_url:
        curso.image_url || "",
      link:
        curso.link || "",
    });

    setPerguntas(
      Array.isArray(curso.questions)
        ? normalizarPerguntas(
            curso.questions
          )
        : perguntasVazias()
    );

    setErro("");
    setSucesso("");

    setTesteModal(false);
    setCursoModal(true);
  }

  ''',
    "abrirTeste"
)

# ============================================================
# 6. ABRIR PERGUNTAS PARA NOVO CURSO OU EXISTENTE
# ============================================================

substituir_funcao(
    "abrirTeste",
    '''function abrirTeste(curso = null) {
    setCursoActual(
      curso || null
    );

    if (
      curso &&
      Array.isArray(curso.questions)
    ) {
      setPerguntas(
        normalizarPerguntas(
          curso.questions
        )
      );
    } else if (
      Array.isArray(perguntas) &&
      perguntas.length === TOTAL_PERGUNTAS
    ) {
      setPerguntas(
        normalizarPerguntas(
          perguntas
        )
      );
    } else {
      setPerguntas(
        perguntasVazias()
      );
    }

    setCursoModal(false);
    setTesteModal(true);

    setErro("");
    setSucesso("");
  }

  ''',
    "fecharCursoModal"
)

# ============================================================
# 7. FECHAR PERGUNTAS
# ============================================================

substituir_funcao(
    "fecharTesteModal",
    '''function fecharTesteModal() {
    if (saving) return;

    setTesteModal(false);
    setCursoModal(true);
  }

  ''',
    "validarTeste"
)

# ============================================================
# 8. VALIDAÇÃO DAS PERGUNTAS
# ============================================================

substituir_funcao(
    "validarTeste",
    '''function validarTeste() {
    if (
      !Array.isArray(perguntas) ||
      perguntas.length !== TOTAL_PERGUNTAS
    ) {
      return "É necessário preencher exactamente 10 perguntas.";
    }

    for (
      let index = 0;
      index < TOTAL_PERGUNTAS;
      index += 1
    ) {
      const pergunta =
        perguntas[index];

      const numero =
        index + 1;

      if (!pergunta) {
        return `A pergunta ${numero} não existe.`;
      }

      const texto =
        String(
          pergunta.question || ""
        ).trim();

      if (!texto) {
        return `Preencha o texto da pergunta ${numero}.`;
      }

      const opcoes =
        Array.isArray(
          pergunta.options
        )
          ? pergunta.options.map(
              (opcao) =>
                String(
                  opcao || ""
                ).trim()
            )
          : [];

      if (
        opcoes.length !==
        OPCOES_POR_PERGUNTA
      ) {
        return `A pergunta ${numero} deve possuir 4 opções.`;
      }

      for (
        let opcao = 0;
        opcao < OPCOES_POR_PERGUNTA;
        opcao += 1
      ) {
        if (!opcoes[opcao]) {
          return `Preencha a opção ${OPCOES_LETRAS[opcao]} da pergunta ${numero}.`;
        }
      }

      if (
        new Set(opcoes).size !==
        OPCOES_POR_PERGUNTA
      ) {
        return `As opções da pergunta ${numero} devem ser diferentes.`;
      }

      const resposta =
        pergunta.correct_answer;

      if (
        resposta === null ||
        resposta === undefined ||
        resposta === "" ||
        !Number.isInteger(
          Number(resposta)
        ) ||
        Number(resposta) < 0 ||
        Number(resposta) >=
          OPCOES_POR_PERGUNTA
      ) {
        return `Marque a resposta certa da pergunta ${numero}.`;
      }

      const explicacao =
        String(
          pergunta.explanation || ""
        ).trim();

      if (!explicacao) {
        return `Preencha a explicação da pergunta ${numero}.`;
      }
    }

    return "";
  }

  ''',
    "guardarCurso"
)

# ============================================================
# 9. GUARDAR PERGUNTAS
# ============================================================

substituir_funcao(
    "guardarTeste",
    '''async function guardarTeste() {
    const erroValidacao =
      validarTeste();

    if (erroValidacao) {
      setErro(
        erroValidacao
      );
      setSucesso("");
      return;
    }

    // NOVO CURSO:
    // Ainda não existe course_id.
    // Portanto, guardar apenas no estado local.
    if (!cursoActual?.id) {
      setErro("");
      setSucesso(
        "As 10 perguntas estão completas e prontas para publicação."
      );

      setTesteModal(false);
      setCursoModal(true);

      return;
    }

    // CURSO EXISTENTE:
    setSaving(true);
    setErro("");
    setSucesso("");

    try {
      const existentes =
        Array.isArray(
          cursoActual.questions
        )
          ? cursoActual.questions
          : [];

      const guardadas = [];

      for (
        let index = 0;
        index < TOTAL_PERGUNTAS;
        index += 1
      ) {
        const pergunta =
          perguntas[index];

        const payload = {
          question:
            String(
              pergunta.question || ""
            ).trim(),

          options:
            pergunta.options.map(
              (opcao) =>
                String(
                  opcao || ""
                ).trim()
            ),

          correct_answer:
            Number(
              pergunta.correct_answer
            ),

          explanation:
            String(
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
                "Content-Type":
                  "application/json",
              },
              body:
                JSON.stringify(
                  payload
                ),
            }
          );
        } else {
          resposta = await fetch(
            `${API_BASE}/admin/courses/${cursoActual.id}/questions`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body:
                JSON.stringify(
                  payload
                ),
            }
          );
        }

        const dados =
          await resposta
            .json()
            .catch(
              () => null
            );

        if (!resposta.ok) {
          throw new Error(
            dados?.detail ||
              `Não foi possível guardar a pergunta ${index + 1}.`
          );
        }

        guardadas.push(
          dados
        );
      }

      setCursoActual(
        (atual) => ({
          ...atual,
          questions:
            guardadas,
          questions_count:
            guardadas.length,
        })
      );

      setPerguntas(
        normalizarPerguntas(
          guardadas
        )
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
    "copiarLink"
)

# ============================================================
# 10. CRIAR / PUBLICAR CURSO
# ============================================================

substituir_funcao(
    "guardarCurso",
    '''async function guardarCurso(event) {
    event?.preventDefault?.();

    const titulo =
      String(
        formulario.title || ""
      ).trim();

    const descricao =
      String(
        formulario.description || ""
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

    const erroTeste =
      validarTeste();

    if (erroTeste) {
      setErro(
        erroTeste
      );
      setSucesso("");

      setCursoModal(false);
      setTesteModal(true);

      return;
    }

    const fotografia =
      String(
        formulario.image_url || ""
      ).trim() ||
      obterImagemCurso(
        titulo
      );

    // No momento da criação ainda não existe ID.
    // Usamos um endereço temporário válido para o backend.
    const linkTemporario =
      "http://127.0.0.1:5173/student/cursos/pending";

    const perguntasPayload =
      perguntas.map(
        (pergunta) => ({
          question:
            String(
              pergunta.question || ""
            ).trim(),

          options:
            pergunta.options.map(
              (opcao) =>
                String(
                  opcao || ""
                ).trim()
            ),

          correct_answer:
            Number(
              pergunta.correct_answer
            ),

          explanation:
            String(
              pergunta.explanation || ""
            ).trim(),
        })
      );

    setSaving(true);
    setErro("");
    setSucesso("");

    try {
      // ======================================================
      // NOVO CURSO
      // ======================================================

      if (!cursoActual?.id) {
        const resposta =
          await fetch(
            `${API_BASE}/admin/courses`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body:
                JSON.stringify({
                  title:
                    titulo,

                  description:
                    descricao,

                  published:
                    true,

                  image_url:
                    fotografia,

                  link:
                    linkTemporario,

                  questions:
                    perguntasPayload,
                }),
            }
          );

        const dados =
          await resposta
            .json()
            .catch(
              () => null
            );

        if (!resposta.ok) {
          throw new Error(
            dados?.detail ||
              "O servidor recusou a criação do curso."
          );
        }

        // ====================================================
        // AGORA TEMOS O ID REAL.
        // Corrigimos o endereço do curso.
        // ====================================================

        const cursoId =
          dados?.id;

        if (!cursoId) {
          throw new Error(
            "O servidor criou o curso, mas não devolveu o seu ID."
          );
        }

        const linkReal =
          `${window.location.origin}/student/cursos/${cursoId}`;

        const actualizacao =
          await fetch(
            `${API_BASE}/admin/courses/${cursoId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body:
                JSON.stringify({
                  title:
                    titulo,

                  description:
                    descricao,

                  published:
                    true,

                  image_url:
                    fotografia,

                  link:
                    linkReal,
                }),
            }
          );

        const dadosActualizados =
          await actualizacao
            .json()
            .catch(
              () => null
            );

        if (!actualizacao.ok) {
          throw new Error(
            dadosActualizados?.detail ||
              "O curso foi criado, mas não foi possível actualizar o seu endereço."
          );
        }

        setCursoActual(
          normalizarCursos([
            dadosActualizados
          ])[0]
        );

        setPerguntas(
          perguntasVazias()
        );

        await carregarCursos();

        setCursoModal(false);
        setTesteModal(false);

        setSucesso(
          "Curso publicado com sucesso com as 10 perguntas."
        );

        return;
      }

      // ======================================================
      // EDITAR CURSO EXISTENTE
      // ======================================================

      const link =
        String(
          formulario.link || ""
        ).trim() ||
        `${window.location.origin}/student/cursos/${cursoActual.id}`;

      const resposta =
        await fetch(
          `${API_BASE}/admin/courses/${cursoActual.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                title:
                  titulo,

                description:
                  descricao,

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
          .catch(
            () => null
          );

      if (!resposta.ok) {
        throw new Error(
          dados?.detail ||
            "Não foi possível actualizar o curso."
        );
      }

      setCursoActual(
        normalizarCursos([
          dados
        ])[0]
      );

      await carregarCursos();

      setCursoModal(false);

      setSucesso(
        "Curso actualizado com sucesso."
      );
    } catch (error) {
      setErro(
        error?.message ||
          "Não foi possível publicar o curso."
      );
    } finally {
      setSaving(false);
    }
  }

  ''',
    "guardarTeste"
)

# ============================================================
# 11. LIGAÇÃO DOS MODAIS
# ============================================================

inicio = text.find("<ModalCurso")

if inicio == -1:
    raise RuntimeError(
        "Instância de ModalCurso não encontrada."
    )

fim = text.find("/>", inicio)

if fim == -1:
    raise RuntimeError(
        "Fim da instância ModalCurso não encontrado."
    )

instancia = text[inicio:fim + 2]

instancia = re.sub(
    r'''onAbrirTeste=\{\(\) => \{.*?\}\}''',
    '''onAbrirTeste={() => {
          abrirTeste(cursoActual);
        }}''',
    instancia,
    count=1,
    flags=re.DOTALL
)

if "erro={erro}" not in instancia:
    instancia = instancia.replace(
        "setFormulario={setFormulario}",
        "setFormulario={setFormulario}\n        erro={erro}",
        1
    )

text = (
    text[:inicio]
    + instancia
    + text[fim + 2:]
)

# ============================================================
# 12. PASSAR ERRO PARA MODALTESTE
# ============================================================

inicio = text.find("<ModalTeste")

if inicio == -1:
    raise RuntimeError(
        "Instância ModalTeste não encontrada."
    )

fim = text.find("/>", inicio)

if fim == -1:
    raise RuntimeError(
        "Fim da instância ModalTeste não encontrado."
    )

instancia = text[inicio:fim + 2]

if "erro={erro}" not in instancia:
    instancia = instancia.replace(
        "saving={saving}",
        "saving={saving}\n        erro={erro}",
        1
    )

text = (
    text[:inicio]
    + instancia
    + text[fim + 2:]
)

# ============================================================
# 13. LISTAGEM — GARANTIR TODOS OS CURSOS
# ============================================================

text = re.sub(
    r'''\.slice\(\s*0\s*,\s*5\s*\)''',
    "",
    text
)

# Não há paginação artificial.
print("[OK] Listagem sem limite de cinco cursos.")

# ============================================================
# 14. GRAVAR
# ============================================================

path.write_text(
    text,
    encoding="utf-8"
)

print("")
print("============================================================")
print(" PATCH DEFINITIVO APLICADO")
print("============================================================")
print("")
print("[OK] Novo curso")
print("[OK] 10 perguntas")
print("[OK] 4 opções por pergunta")
print("[OK] Resposta certa")
print("[OK] Explicação")
print("[OK] Validação")
print("[OK] Fotografia automática")
print("[OK] Endereço automático")
print("[OK] Publicação")
print("[OK] Selector de nível avançado")
print("[OK] Erros visíveis")
print("[OK] Lista completa de cursos")
print("")
