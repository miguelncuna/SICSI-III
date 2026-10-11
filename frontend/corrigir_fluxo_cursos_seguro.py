from pathlib import Path
import re

path = Path("src/pages/admin/AdminCoursesPage.jsx")
text = path.read_text(encoding="utf-8")

print("")
print("============================================================")
print(" SICSI III - PATCH SEGURO DO FLUXO NOVO CURSO")
print("============================================================")
print("")


# ============================================================
# LOCALIZAR FUNÇÃO JAVASCRIPT PELO BALANCEAMENTO DE CHAVES
# ============================================================

def localizar_funcao(nome):
    padrao = re.compile(
        rf'function\s+{re.escape(nome)}\s*\('
    )

    encontrado = padrao.search(text)

    if not encontrado:
        raise RuntimeError(
            f"Função '{nome}' não encontrada."
        )

    inicio = encontrado.start()

    abre = text.find("{", encontrado.end())

    if abre == -1:
        raise RuntimeError(
            f"Abertura da função '{nome}' não encontrada."
        )

    profundidade = 0
    estado = "normal"
    i = abre

    while i < len(text):
        ch = text[i]
        prox = (
            text[i + 1]
            if i + 1 < len(text)
            else ""
        )

        if estado == "normal":
            if ch == "/" and prox == "/":
                estado = "comentario_linha"
                i += 2
                continue

            if ch == "/" and prox == "*":
                estado = "comentario_bloco"
                i += 2
                continue

            if ch == "'":
                estado = "aspas_simples"
                i += 1
                continue

            if ch == '"':
                estado = "aspas_duplas"
                i += 1
                continue

            if ch == "`":
                estado = "template"
                i += 1
                continue

            if ch == "{":
                profundidade += 1

            elif ch == "}":
                profundidade -= 1

                if profundidade == 0:
                    return inicio, i + 1

            i += 1
            continue

        if estado == "comentario_linha":
            if ch == "\n":
                estado = "normal"
            i += 1
            continue

        if estado == "comentario_bloco":
            if ch == "*" and prox == "/":
                estado = "normal"
                i += 2
            else:
                i += 1
            continue

        if estado == "aspas_simples":
            if ch == "\\":
                i += 2
                continue

            if ch == "'":
                estado = "normal"

            i += 1
            continue

        if estado == "aspas_duplas":
            if ch == "\\":
                i += 2
                continue

            if ch == '"':
                estado = "normal"

            i += 1
            continue

        if estado == "template":
            if ch == "\\":
                i += 2
                continue

            if ch == "`":
                estado = "normal"

            i += 1
            continue

    raise RuntimeError(
        f"Não foi possível determinar o fim da função '{nome}'."
    )


def substituir_funcao(nome, novo_codigo):
    global text

    inicio, fim = localizar_funcao(nome)

    text = (
        text[:inicio]
        + novo_codigo
        + text[fim:]
    )

    print(
        f"[OK] Função {nome}() actualizada."
    )


# ============================================================
# 1. MODALCURSO — PROP ERRO
# ============================================================

inicio_modal, fim_modal = localizar_funcao(
    "ModalCurso"
)

modal = text[inicio_modal:fim_modal]

if "  erro," not in modal:
    alvo = """  onAbrirTeste,
}) {"""

    novo_alvo = """  onAbrirTeste,
  erro,
}) {"""

    if alvo not in modal:
        raise RuntimeError(
            "Não encontrei a assinatura actual de ModalCurso."
        )

    modal = modal.replace(
        alvo,
        novo_alvo,
        1
    )

    print(
        "[OK] Prop 'erro' ligada ao ModalCurso."
    )


# ============================================================
# 2. MODALCURSO — BANNER DE ERRO
# ============================================================

if "{erro && (" not in modal:

    marcador = """  if (!aberto) return null;"""

    banner = """  if (!aberto) return null;

  const erroVisivel = erro ? (
    <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-red-600">
        Atenção
      </p>

      <p className="mt-1 text-xs font-semibold leading-5 text-red-700">
        {erro}
      </p>
    </div>
  ) : null;"""

    if marcador not in modal:
        raise RuntimeError(
            "Não encontrei o início visual de ModalCurso."
        )

    modal = modal.replace(
        marcador,
        banner,
        1
    )

    # Inserir o banner antes do formulário.
    marcador_form = """        <form"""

    if marcador_form not in modal:
        raise RuntimeError(
            "Formulário de ModalCurso não encontrado."
        )

    modal = modal.replace(
        marcador_form,
        """        {erroVisivel}

        <form""",
        1
    )

    print(
        "[OK] Banner de erro adicionado ao ModalCurso."
    )


# ============================================================
# 3. MODALCURSO — LEVEL SELECT MODERNO
# ============================================================

padrao_nivel = re.compile(
    r'''<CampoCurso titulo="Nível">\s*
        <div className="relative">.*?
        </div>\s*
      </CampoCurso>''',
    re.DOTALL | re.VERBOSE
)

novo_nivel = """<CampoCurso titulo="Nível">
                    <div className="grid gap-2 sm:grid-cols-3">
                      {[
                        {
                          valor: "Básico",
                          descricao:
                            "Fundamentos essenciais",
                        },
                        {
                          valor: "Intermédio",
                          descricao:
                            "Aplicação prática",
                        },
                        {
                          valor: "Avançado",
                          descricao:
                            "Domínio aprofundado",
                        },
                      ].map((nivel) => {
                        const activo =
                          formulario.level ===
                          nivel.valor;

                        return (
                          <button
                            key={nivel.valor}
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              setFormulario(
                                (atual) => ({
                                  ...atual,
                                  level:
                                    nivel.valor,
                                })
                              )
                            }
                            aria-pressed={activo}
                            className={`rounded-2xl border p-4 text-left transition-all ${
                              activo
                                ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black">
                                {nivel.valor}
                              </span>

                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                  activo
                                    ? "border-white/50"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                {activo && (
                                  <span className="h-2 w-2 rounded-full bg-white" />
                                )}
                              </span>
                            </div>

                            <p
                              className={`mt-2 text-[9px] font-semibold ${
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
                  </CampoCurso>"""

modal_novo, quantidade = re.subn(
    padrao_nivel,
    novo_nivel,
    modal,
    count=1
)

if quantidade != 1:
    raise RuntimeError(
        "Selector de nível não encontrado."
    )

modal = modal_novo

print(
    "[OK] Selector de nível modernizado."
)


# ============================================================
# 4. MODALCURSO — BOTÃO DAS 10 PERGUNTAS
# ============================================================

condicional = """{curso && (
                  <button
                    type="button"
                    onClick={onAbrirTeste}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-3 text-xs font-bold text-white transition hover:bg-indigo-700"
                  >
                    <Settings2Icon />
                    Configurar perguntas
                  </button>
                )}"""

botao_perguntas = """<button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onAbrirTeste();
                  }}
                  disabled={saving}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-3 py-3.5 text-xs font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  <Settings2Icon />
                  {curso
                    ? "Configurar perguntas"
                    : "Preencher 10 perguntas"}
                </button>"""

if condicional not in modal:

    # Fallback mais tolerante:
    pos_label = modal.find(
        "Configurar perguntas"
    )

    if pos_label == -1:
        raise RuntimeError(
            "Texto 'Configurar perguntas' não encontrado no ModalCurso."
        )

    inicio_botao = modal.rfind(
        "{curso && (",
        0,
        pos_label
    )

    fim_botao = modal.find(
        ")}",
        pos_label
    )

    if inicio_botao == -1 or fim_botao == -1:
        raise RuntimeError(
            "Estrutura condicional do botão de perguntas não encontrada."
        )

    modal = (
        modal[:inicio_botao]
        + botao_perguntas
        + modal[fim_botao + 2:]
    )

else:
    modal = modal.replace(
        condicional,
        botao_perguntas,
        1
    )

print(
    "[OK] Botão 'Preencher 10 perguntas' disponível também no novo curso."
)


# ============================================================
# 5. BOTÃO PRINCIPAL
# ============================================================

modal = modal.replace(
    ': "Criar curso"}',
    ': "Publicar curso"}',
    1
)

# Substituir o modal no documento.
text = (
    text[:inicio_modal]
    + modal
    + text[fim_modal:]
)

print(
    "[OK] Botão principal renomeado para 'Publicar curso'."
)


# ============================================================
# 6. ABRIR NOVO CURSO
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

'''
)


# ============================================================
# 7. EDITAR CURSO
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
      Array.isArray(
        curso.questions
      )
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

'''
)


# ============================================================
# 8. ABRIR TESTE — NOVO OU EXISTENTE
# ============================================================

substituir_funcao(
    "abrirTeste",
    '''function abrirTeste(curso = null) {
    setCursoActual(
      curso || null
    );

    if (
      curso &&
      Array.isArray(
        curso.questions
      )
    ) {
      setPerguntas(
        normalizarPerguntas(
          curso.questions
        )
      );
    } else {
      setPerguntas(
        (actual) => {
          if (
            Array.isArray(actual) &&
            actual.length === TOTAL_PERGUNTAS
          ) {
            return normalizarPerguntas(
              actual
            );
          }

          return perguntasVazias();
        }
      );
    }

    setCursoModal(false);
    setTesteModal(true);

    setErro("");
    setSucesso("");
  }

'''
)


# ============================================================
# 9. FECHAR TESTE
# ============================================================

substituir_funcao(
    "fecharTesteModal",
    '''function fecharTesteModal() {
    if (saving) return;

    setTesteModal(false);
    setCursoModal(true);
  }

'''
)


# ============================================================
# 10. VALIDAR TESTE
# ============================================================

substituir_funcao(
    "validarTeste",
    '''function validarTeste() {
    if (
      !Array.isArray(perguntas) ||
      perguntas.length !== TOTAL_PERGUNTAS
    ) {
      return "O teste deve conter exactamente 10 perguntas.";
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
        return `A pergunta ${numero} não foi criada.`;
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
        return `A pergunta ${numero} deve possuir exactamente 4 opções.`;
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
        return `As 4 opções da pergunta ${numero} devem ser diferentes.`;
      }

      const resposta =
        Number(
          pergunta.correct_answer
        );

      if (
        !Number.isInteger(
          resposta
        ) ||
        resposta < 0 ||
        resposta >=
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

'''
)


# ============================================================
# 11. GUARDAR TESTE
# ============================================================

inicio_guardar, fim_guardar = localizar_funcao(
    "guardarTeste"
)

bloco_guardar = text[
    inicio_guardar:fim_guardar
]

antigo_inicio = """async function guardarTeste() {
    if (!cursoActual?.id) {
      setErro(
        "O curso precisa de ser criado primeiro."
      );
      return;
    }

    const erroValidacao =
      validarTeste();

    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setSaving(true);"""

novo_inicio = """async function guardarTeste() {
    const erroValidacao =
      validarTeste();

    if (erroValidacao) {
      setErro(
        erroValidacao
      );
      setSucesso("");
      return;
    }

    // Novo curso:
    // As perguntas ficam guardadas localmente
    // até o administrador publicar o curso.
    if (!cursoActual?.id) {
      setErro("");
      setSucesso(
        "As 10 perguntas foram preenchidas com sucesso."
      );

      setTesteModal(false);
      setCursoModal(true);

      return;
    }

    // Curso existente:
    // manter o fluxo CRUD actual.
    setSaving(true);"""

if antigo_inicio not in bloco_guardar:
    raise RuntimeError(
        "Bloco inicial de guardarTeste() não corresponde ao código actual."
    )

bloco_guardar = bloco_guardar.replace(
    antigo_inicio,
    novo_inicio,
    1
)

text = (
    text[:inicio_guardar]
    + bloco_guardar
    + text[fim_guardar:]
)

print(
    "[OK] guardarTeste() agora funciona também no novo curso."
)


# ============================================================
# 12. GUARDAR CURSO
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
      setSucesso("");
      return;
    }

    if (!descricao) {
      setErro(
        "A descrição do curso é obrigatória."
      );
      setSucesso("");
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

      // ======================================================
      // NOVO CURSO
      // ======================================================

      if (!cursoActual?.id) {

        const linkTemporario =
          `${window.location.origin}/student/cursos/pending`;

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
                    Boolean(
                      formulario.published
                    ),

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

        const cursoId =
          dados?.id;

        if (!cursoId) {
          throw new Error(
            "O curso foi criado, mas o servidor não devolveu o ID."
          );
        }

        // ====================================================
        // ENDEREÇO DEFINITIVO
        // ====================================================

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
                    Boolean(
                      formulario.published
                    ),

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
              "O curso foi criado, mas não foi possível definir o endereço definitivo."
          );
        }

        const normalizado =
          normalizarCursos([
            dadosActualizados
          ]);

        setCursoActual(
          normalizado[0] ||
          dadosActualizados
        );

        setPerguntas(
          perguntasVazias()
        );

        await carregarCursos();

        setCursoModal(false);
        setTesteModal(false);

        setSucesso(
          "Curso publicado com sucesso, incluindo as 10 perguntas."
        );

        return;
      }


      // ======================================================
      // CURSO EXISTENTE
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

      const normalizado =
        normalizarCursos([
          dados
        ]);

      setCursoActual(
        normalizado[0] ||
        dados
      );

      await carregarCursos();

      setCursoModal(false);

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
)


# ============================================================
# 13. CALL DO MODALCURSO
# ============================================================

inst_inicio = text.find("<ModalCurso")

if inst_inicio == -1:
    raise RuntimeError(
        "Uso de ModalCurso não encontrado."
    )

inst_fim = text.find("/>", inst_inicio)

if inst_fim == -1:
    raise RuntimeError(
        "Fim do ModalCurso não encontrado."
    )

instancia = text[
    inst_inicio:
    inst_fim + 2
]

antigo_callback = """onAbrirTeste={() => {
          setCursoModal(false);
          abrirTeste(cursoActual);
        }}"""

novo_callback = """onAbrirTeste={() => {
          abrirTeste(cursoActual);
        }}"""

if antigo_callback in instancia:
    instancia = instancia.replace(
        antigo_callback,
        novo_callback,
        1
)
else:
    # Ainda funciona mesmo que a versão já tenha mudado.
    instancia = re.sub(
        r'''onAbrirTeste=\{\(\) => \{.*?abrirTeste\(cursoActual\);.*?\}\}''',
        novo_callback,
        instancia,
        count=1,
        flags=re.DOTALL
    )

if "erro={erro}" not in instancia:
    instancia = instancia.replace(
        "setFormulario={setFormulario}",
        """setFormulario={setFormulario}
        erro={erro}""",
        1
    )

text = (
    text[:inst_inicio]
    + instancia
    + text[inst_fim + 2:]
)

print(
    "[OK] ModalCurso ligado ao novo fluxo."
)


# ============================================================
# 14. FORMULÁRIO SEM VALIDAÇÃO NATIVA DO BROWSER
# ============================================================

text = text.replace(
    '<form\n          onSubmit={onSubmit}',
    '<form\n          onSubmit={onSubmit}\n          noValidate',
    1
)

# Variante caso esteja com outra indentação.
text = text.replace(
    '<form\n              onSubmit={onSubmit}',
    '<form\n              onSubmit={onSubmit}\n              noValidate',
    1
)

print(
    "[OK] Validação controlada pelo SICSI."
)


# ============================================================
# 15. VERIFICAÇÕES ANTES DE GRAVAR
# ============================================================

verificacoes = {
    "ModalCurso com erro":
        "erroVisivel" in text,

    "Botão novo teste":
        "Preencher 10 perguntas" in text,

    "Novo fluxo guardarTeste":
        "As 10 perguntas foram preenchidas com sucesso." in text,

    "Novo fluxo guardarCurso":
        "linkTemporario" in text,

    "Fotografia automática":
        "obterImagemCurso(" in text,

    "Validação 10 perguntas":
        "TOTAL_PERGUNTAS" in text,

    "Endereço student":
        "/student/cursos/" in text,

    "Publicar curso":
        "Publicar curso" in text,
}

falhas = [
    nome
    for nome, ok in verificacoes.items()
    if not ok
]

if falhas:
    raise RuntimeError(
        "Verificações falharam: "
        + ", ".join(falhas)
    )


# ============================================================
# GRAVAÇÃO — SOMENTE AGORA
# ============================================================

path.write_text(
    text,
    encoding="utf-8"
)

print("")
print("============================================================")
print(" PATCH GRAVADO COM SUCESSO")
print("============================================================")
print("")
for nome in verificacoes:
    print(f"[OK] {nome}")
print("")
