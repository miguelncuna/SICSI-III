from pathlib import Path
import re

path = Path("src/pages/admin/AdminCoursesPage.jsx")
text = path.read_text(encoding="utf-8")

def erro(mensagem):
    raise RuntimeError(mensagem)

print("")
print("============================================================")
print(" SICSI III - CORRECÇÃO DEFINITIVA DO NOVO CURSO")
print("============================================================")
print("")

# ============================================================
# 1. MODAL DO CURSO — ADICIONAR ERRO
# ============================================================

assinatura_antiga = '''  onAbrirTeste,
}) {'''

assinatura_nova = '''  onAbrirTeste,
  erro,
}) {'''

if assinatura_antiga in text:
    text = text.replace(
        assinatura_antiga,
        assinatura_nova,
        1
    )
    print("[OK] Campo de erro ligado ao ModalCurso.")
elif "  erro," in text:
    print("[OK] ModalCurso já possui campo de erro.")
else:
    erro("Assinatura do ModalCurso não encontrada.")

# ============================================================
# 2. MENSAGEM DE ERRO VISÍVEL DENTRO DO MODAL
# ============================================================

marcador_form = '''        <form
          onSubmit={onSubmit}
          className="min-h-0 overflow-y-auto"
        >'''

banner_erro = '''        {erro && (
          <div className="shrink-0 border-b border-red-100 bg-red-50 px-5 py-3.5 sm:px-7">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />

              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-red-600">
                  Não foi possível continuar
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
        >'''

if marcador_form in text:
    text = text.replace(
        marcador_form,
        banner_erro,
        1
    )
    print("[OK] Mensagem de erro visual adicionada.")
else:
    if "{erro && (" not in text:
        erro("Formulário principal do ModalCurso não encontrado.")

# ============================================================
# 3. SELECTOR DE NÍVEL — DESIGN MODERNO
# ============================================================

padrao_nivel = re.compile(
    r'''<CampoCurso titulo="Nível">.*?</CampoCurso>''',
    re.DOTALL
)

nivel_moderno = '''<CampoCurso titulo="Nível">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {[
                        {
                          valor: "Básico",
                          descricao: "Fundamentos e conceitos essenciais",
                        },
                        {
                          valor: "Intermédio",
                          descricao: "Prática e aplicação",
                        },
                        {
                          valor: "Avançado",
                          descricao: "Domínio e análise",
                        },
                      ].map((nivel) => {
                        const ativo =
                          formulario.level === nivel.valor;

                        return (
                          <button
                            key={nivel.valor}
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              setFormulario((atual) => ({
                                ...atual,
                                level: nivel.valor,
                              }))
                            }
                            aria-pressed={ativo}
                            className={`relative overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                              ativo
                                ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-black">
                                {nivel.valor}
                              </span>

                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                  ativo
                                    ? "border-white/60 bg-white/15"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                {ativo && (
                                  <span className="h-2 w-2 rounded-full bg-white" />
                                )}
                              </span>
                            </div>

                            <p
                              className={`mt-2 text-[9px] leading-4 font-semibold ${
                                ativo
                                  ? "text-blue-100"
                                  : "text-slate-400"
                              }`}
                            >
                              {nivel.descricao}
                            </p>

                            {ativo && (
                              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/70" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CampoCurso>'''

m = padrao_nivel.search(text)

if not m:
    erro("Campo Nível não encontrado.")

text = (
    text[:m.start()]
    + nivel_moderno
    + text[m.end():]
)

print("[OK] Selector de nível modernizado.")

# ============================================================
# 4. BOTÃO DAS PERGUNTAS — DISPONÍVEL NO NOVO CURSO
# ============================================================

botao_antigo = '''                {curso && (
                  <button
                    type="button"
                    onClick={onAbrirTeste}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-3 text-xs font-bold text-white transition hover:bg-indigo-700"
                  >
                    <Settings2Icon />
                    Configurar perguntas
                  </button>
                )}'''

botao_novo = '''                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onAbrirTeste();
                  }}
                  disabled={saving}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-3.5 text-xs font-black text-white shadow-lg shadow-indigo-600/15 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Settings2Icon />
                  {curso
                    ? "Configurar perguntas"
                    : "Preencher 10 perguntas"}
                </button>'''

if botao_antigo in text:
    text = text.replace(
        botao_antigo,
        botao_novo,
        1
    )
    print("[OK] Botão das perguntas agora aparece em Novo curso.")
else:
    # Segunda tentativa para pequenas diferenças de espaçamento.
    padrao_botao = re.compile(
        r'''\{curso\s*&&\s*\(\s*<button\b.*?<Settings2Icon\s*/>\s*Configurar perguntas\s*</button>\s*\)\}''',
        re.DOTALL
    )

    m = padrao_botao.search(text)

    if not m:
        erro("Botão 'Configurar perguntas' não encontrado.")

    text = (
        text[:m.start()]
        + botao_novo
        + text[m.end():]
    )

    print("[OK] Botão das perguntas corrigido pela segunda forma.")

# ============================================================
# 5. TEXTO DO TESTE FINAL
# ============================================================

texto_antigo = '''Depois de criar o curso, pode configurar imediatamente o
                    teste final com as 10 perguntas.'''

texto_novo = '''Preencha as 10 perguntas antes de publicar.
                    Cada pergunta deve possuir quatro opções,
                    uma resposta certa e uma explicação.'''

if texto_antigo in text:
    text = text.replace(
        texto_antigo,
        texto_novo,
        1
    )

# ============================================================
# 6. BOTÃO PRINCIPAL — PUBLICAR CURSO
# ============================================================

if ': "Criar curso"' in text:
    text = text.replace(
        ': "Criar curso"',
        ': "Publicar curso"',
        1
    )
    print("[OK] Botão alterado para 'Publicar curso'.")
else:
    print("[INFO] Texto 'Criar curso' já não está presente.")

# ============================================================
# 7. ABRIR NOVO CURSO — LIMPAR TUDO
# ============================================================

inicio = text.find("function abrirNovoCurso()")
fim = text.find("function abrirEditarCurso(", inicio)

if inicio == -1 or fim == -1:
    erro("Função abrirNovoCurso não encontrada.")

nova_funcao = '''function abrirNovoCurso() {
    setCursoActual(null);
    setFormulario({
      ...CURSO_VAZIO,
      published: true,
    });
    setPerguntas(perguntasVazias());
    setCursoModal(true);
    setTesteModal(false);
    setErro("");
    setSucesso("");
  }

  '''

text = text[:inicio] + nova_funcao + text[fim:]

print("[OK] Novo curso inicia sempre limpo.")

# ============================================================
# 8. EDITAR CURSO — PRESERVAR LINK E FOTOGRAFIA INTERNOS
# ============================================================

inicio = text.find("function abrirEditarCurso(")
fim = text.find("function abrirTeste(", inicio)

if inicio == -1 or fim == -1:
    erro("Função abrirEditarCurso não encontrada.")

nova_edicao = '''function abrirEditarCurso(curso) {
    setCursoActual(curso);

    setFormulario({
      title: curso.title || "",
      description: curso.description || "",
      level: curso.level || "Básico",
      published: Boolean(curso.published),
      image_url: curso.image_url || "",
      link: curso.link || "",
    });

    setPerguntas(
      Array.isArray(curso.questions)
        ? normalizarPerguntas(curso.questions)
        : perguntasVazias()
    );

    setCursoModal(true);
    setTesteModal(false);
    setErro("");
    setSucesso("");
  }

  '''

text = text[:inicio] + nova_edicao + text[fim:]

print("[OK] Edição preserva dados do curso.")

# ============================================================
# 9. ABRIR PERGUNTAS — FUNCIONAR COM NOVO CURSO
# ============================================================

inicio = text.find("function abrirTeste(")
fim = text.find("function fecharCursoModal(", inicio)

if inicio == -1 or fim == -1:
    erro("Função abrirTeste não encontrada.")

nova_abrir_teste = '''function abrirTeste(curso = null) {
    setCursoActual(curso || null);

    if (
      curso &&
      Array.isArray(curso.questions) &&
      curso.questions.length > 0
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
        normalizarPerguntas(perguntas)
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

  '''

text = text[:inicio] + nova_abrir_teste + text[fim:]

print("[OK] Modal das perguntas funciona no Novo curso.")

# ============================================================
# 10. FECHAR PERGUNTAS — VOLTAR AO CURSO
# ============================================================

inicio = text.find("function fecharTesteModal()")
fim = text.find("function validarTeste()", inicio)

if inicio == -1 or fim == -1:
    erro("Função fecharTesteModal/validarTeste não encontrada.")

nova_fechar_teste = '''function fecharTesteModal() {
    if (saving) return;

    setTesteModal(false);
    setCursoModal(true);
    setErro("");
  }

  '''

text = text[:inicio] + nova_fechar_teste + text[fim:]

print("[OK] Fecho das perguntas volta para o curso.")

# ============================================================
# 11. VALIDAÇÃO COMPLETA DAS 10 PERGUNTAS
# ============================================================

inicio = text.find("function validarTeste()")
fim = text.find("async function guardarCurso(", inicio)

if inicio == -1 or fim == -1:
    erro("Função validarTeste/guardarCurso não encontrada.")

nova_validacao = '''function validarTeste() {
    if (
      !Array.isArray(perguntas) ||
      perguntas.length !== TOTAL_PERGUNTAS
    ) {
      return "O curso deve conter exactamente 10 perguntas.";
    }

    for (
      let index = 0;
      index < TOTAL_PERGUNTAS;
      index += 1
    ) {
      const pergunta = perguntas[index];
      const numero = index + 1;

      if (!pergunta) {
        return `A pergunta ${numero} não foi criada.`;
      }

      const texto = String(
        pergunta.question || ""
      ).trim();

      if (!texto) {
        return `Preencha o texto da pergunta ${numero}.`;
      }

      const opcoes = Array.isArray(
        pergunta.options
      )
        ? pergunta.options.map(
            (opcao) =>
              String(opcao || "").trim()
          )
        : [];

      if (
        opcoes.length !==
        OPCOES_POR_PERGUNTA
      ) {
        return `A pergunta ${numero} deve ter exactamente 4 opções.`;
      }

      for (
        let indiceOpcao = 0;
        indiceOpcao < OPCOES_POR_PERGUNTA;
        indiceOpcao += 1
      ) {
        if (!opcoes[indiceOpcao]) {
          return `Preencha a opção ${OPCOES_LETRAS[indiceOpcao]} da pergunta ${numero}.`;
        }
      }

      if (
        new Set(opcoes).size !==
        OPCOES_POR_PERGUNTA
      ) {
        return `As 4 opções da pergunta ${numero} devem ser diferentes.`;
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

      const explicacao = String(
        pergunta.explanation || ""
      ).trim();

      if (!explicacao) {
        return `Preencha a explicação da pergunta ${numero}.`;
      }
    }

    return "";
  }

  '''

text = text[:inicio] + nova_validacao + text[fim:]

print("[OK] Validação das perguntas reforçada.")

# ============================================================
# 12. GUARDAR PERGUNTAS
# ============================================================

inicio = text.find("async function guardarTeste()")
fim = text.find("async function ", inicio + 10)

if inicio == -1 or fim == -1:
    erro("Função guardarTeste não encontrada.")

nova_guardar_teste = '''async function guardarTeste() {
    const erroValidacao = validarTeste();

    if (erroValidacao) {
      setErro(erroValidacao);
      setSucesso("");
      return;
    }

    # ========================================================
    # NOVO CURSO
    # ========================================================

    if (!cursoActual?.id) {
      setTesteModal(false);
      setCursoModal(true);
      setErro("");
      setSucesso(
        "As 10 perguntas foram preenchidas. Pode agora publicar o curso."
      );
      return;
    }

    # ========================================================
    # CURSO EXISTENTE
    # ========================================================

    setSaving(true);
    setErro("");
    setSucesso("");

    try {
      const existentes =
        Array.isArray(cursoActual.questions)
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
                JSON.stringify(payload),
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
                JSON.stringify(payload),
            }
          );
        }

        const dados =
          await resposta
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

  '''

# Converter comentários Python para comentários JavaScript.
nova_guardar_teste = nova_guardar_teste.replace(
    "    # ========================================================",
    "    // ========================================================"
)

nova_guardar_teste = nova_guardar_teste.replace(
    "    # NOVO CURSO",
    "    // NOVO CURSO"
)

nova_guardar_teste = nova_guardar_teste.replace(
    "    # CURSO EXISTENTE",
    "    // CURSO EXISTENTE"
)

text = text[:inicio] + nova_guardar_teste + text[fim:]

print("[OK] Guardar perguntas corrigido para novo e existente.")

# ============================================================
# 13. GUARDAR / PUBLICAR CURSO
# ============================================================

inicio = text.find("async function guardarCurso(")
fim = text.find("async function guardarTeste()", inicio)

if inicio == -1 or fim == -1:
    erro("Função guardarCurso não encontrada.")

nova_guardar_curso = r'''async function guardarCurso(event) {
    event?.preventDefault?.();

    const titulo = String(
      formulario.title || ""
    ).trim();

    const descricao = String(
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
      setErro(erroTeste);
      setSucesso("");
      setCursoModal(false);
      setTesteModal(true);
      return;
    }

    const fotografia =
      String(
        formulario.image_url || ""
      ).trim() ||
      obterImagemCurso(titulo);

    // Para um novo curso, o backend resolve
    // {id} depois de criar o curso.
    const link =
      cursoActual?.id
        ? (
            String(
              formulario.link || ""
            ).trim() ||
            `${window.location.origin}/student/cursos/${cursoActual.id}`
          )
        : `${window.location.origin}/student/cursos/{id}`;

    const perguntasPayload =
      perguntas.map(
        (pergunta) => ({
          question:
            String(
              pergunta.question || ""
            ).trim(),

          options:
            Array.isArray(
              pergunta.options
            )
              ? pergunta.options.map(
                  (opcao) =>
                    String(
                      opcao || ""
                    ).trim()
                )
              : [],

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
      // ========================================================
      // NOVO CURSO
      // ========================================================

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
                  title: titulo,
                  description: descricao,
                  published:
                    Boolean(
                      formulario.published
                    ),
                  image_url:
                    fotografia,
                  link,
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
          normalizarCursos(
            [dados]
          )[0]
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

      // ========================================================
      // EDITAR CURSO EXISTENTE
      // ========================================================

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
        normalizarCursos(
          [dados]
        )[0]
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

text = text[:inicio] + nova_guardar_curso + text[fim:]

print("[OK] Criar/Publicar curso corrigido.")

# ============================================================
# 14. CALLBACK DO MODAL
# ============================================================

callback_antigo = '''        onAbrirTeste={() => {
          setCursoModal(false);
          abrirTeste(cursoActual);
        }}'''

callback_novo = '''        onAbrirTeste={() => {
          abrirTeste(cursoActual);
        }}
        erro={erro}'''

if callback_antigo in text:
    text = text.replace(
        callback_antigo,
        callback_novo,
        1
    )
    print("[OK] Ligação ModalCurso → ModalTeste corrigida.")
else:
    if "erro={erro}" not in text:
        erro("Callback do ModalCurso não encontrado.")

# ============================================================
# 15. REMOVER QUALQUER LIMITAÇÃO EXPLÍCITA DE 5
# ============================================================

antes = text

text = re.sub(
    r'''\.slice\(\s*0\s*,\s*5\s*\)''',
    "",
    text
)

if text != antes:
    print("[OK] Limite de cinco cursos removido.")
else:
    print("[OK] Nenhum .slice(0,5) existe.")

# ============================================================
# 16. GRAVAR APENAS AGORA
# ============================================================

path.write_text(
    text,
    encoding="utf-8"
)

print("")
print("============================================================")
print(" SICSI III - PATCH APLICADO COM SUCESSO")
print("============================================================")
print("")
print("Novo curso:")
print("  [OK] Nome")
print("  [OK] Descrição")
print("  [OK] Nível moderno")
print("  [OK] Fotografia automática")
print("  [OK] Endereço automático")
print("  [OK] 10 perguntas")
print("  [OK] 4 opções por pergunta")
print("  [OK] Resposta certa")
print("  [OK] Explicação")
print("  [OK] Mensagens de erro")
print("  [OK] Publicação")
print("")
