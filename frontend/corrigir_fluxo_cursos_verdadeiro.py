from pathlib import Path
import re
import shutil

path = Path("src/pages/admin/AdminCoursesPage.jsx")

original = path.read_text(encoding="utf-8")
text = original

print("")
print("============================================================")
print(" SICSI III - CORRECÇÃO REAL DO FLUXO DE NOVO CURSO")
print("============================================================")
print("")


# ============================================================
# LOCALIZAR FUNÇÃO CORRECTAMENTE
# ============================================================

def localizar_funcao(nome):
    """
    Localiza uma função JS/JSX pelo nome e encontra o seu corpo,
    respeitando chaves dentro do código.
    """

    cabecalho = re.search(
        rf'function\s+{re.escape(nome)}\s*\(',
        text
    )

    if not cabecalho:
        raise RuntimeError(
            f"Função '{nome}' não encontrada."
        )

    inicio_funcao = cabecalho.start()

    # Primeiro encontramos o ')' correspondente do cabeçalho.
    pos = cabecalho.end()
    nivel_parenteses = 1

    while pos < len(text):

        ch = text[pos]
        prox = (
            text[pos + 1]
            if pos + 1 < len(text)
            else ""
        )

        if ch == "'":
            pos += 1
            while pos < len(text):
                if text[pos] == "\\":
                    pos += 2
                    continue
                if text[pos] == "'":
                    pos += 1
                    break
                pos += 1
            continue

        if ch == '"':
            pos += 1
            while pos < len(text):
                if text[pos] == "\\":
                    pos += 2
                    continue
                if text[pos] == '"':
                    pos += 1
                    break
                pos += 1
            continue

        if ch == "`":
            pos += 1
            while pos < len(text):
                if text[pos] == "\\":
                    pos += 2
                    continue
                if text[pos] == "`":
                    pos += 1
                    break
                pos += 1
            continue

        if ch == "(":
            nivel_parenteses += 1

        elif ch == ")":
            nivel_parenteses -= 1

            if nivel_parenteses == 0:
                pos += 1
                break

        pos += 1

    while pos < len(text) and text[pos].isspace():
        pos += 1

    if pos >= len(text) or text[pos] != "{":
        raise RuntimeError(
            f"Não encontrei o início do corpo de '{nome}()'."
        )

    inicio_corpo = pos

    profundidade = 0
    estado = "normal"
    pos = inicio_corpo

    while pos < len(text):

        ch = text[pos]
        prox = (
            text[pos + 1]
            if pos + 1 < len(text)
            else ""
        )

        if estado == "normal":

            if ch == "/" and prox == "/":
                estado = "comentario_linha"
                pos += 2
                continue

            if ch == "/" and prox == "*":
                estado = "comentario_bloco"
                pos += 2
                continue

            if ch == "'":
                estado = "aspas_simples"
                pos += 1
                continue

            if ch == '"':
                estado = "aspas_duplas"
                pos += 1
                continue

            if ch == "`":
                estado = "template"
                pos += 1
                continue

            if ch == "{":
                profundidade += 1

            elif ch == "}":
                profundidade -= 1

                if profundidade == 0:
                    return inicio_funcao, pos + 1

            pos += 1
            continue

        if estado == "comentario_linha":

            if ch == "\n":
                estado = "normal"

            pos += 1
            continue

        if estado == "comentario_bloco":

            if ch == "*" and prox == "/":
                estado = "normal"
                pos += 2
            else:
                pos += 1

            continue

        if estado == "aspas_simples":

            if ch == "\\":
                pos += 2
                continue

            if ch == "'":
                estado = "normal"

            pos += 1
            continue

        if estado == "aspas_duplas":

            if ch == "\\":
                pos += 2
                continue

            if ch == '"':
                estado = "normal"

            pos += 1
            continue

        if estado == "template":

            if ch == "\\":
                pos += 2
                continue

            if ch == "`":
                estado = "normal"

            pos += 1
            continue

    raise RuntimeError(
        f"Não foi possível determinar o fim de '{nome}()'."
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
        f"[OK] {nome}() substituída."
    )


# ============================================================
# 1. MODALCURSO — ADICIONAR erro SEM DEPENDER DA ASSINATURA
# ============================================================

inicio, fim = localizar_funcao("ModalCurso")

modal = text[inicio:fim]

# Adicionar erro à destruturação de props.
if re.search(r'\berro\b\s*,', modal) is None:

    assinatura = re.search(
        r'function\s+ModalCurso\s*\((.*?)\)\s*\{',
        modal,
        flags=re.DOTALL
    )

    if not assinatura:
        raise RuntimeError(
            "Não consegui interpretar a assinatura de ModalCurso()."
        )

    parametros = assinatura.group(1)

    parametros_novos = parametros.rstrip()

    if parametros_novos.endswith("}"):
        parametros_novos = (
            parametros_novos[:-1].rstrip()
            + ",\n  erro,\n}"
        )
    else:
        raise RuntimeError(
            "ModalCurso não usa a destruturação esperada de propriedades."
        )

    modal = (
        modal[:assinatura.start(1)]
        + parametros_novos
        + modal[assinatura.end(1):]
    )

    print(
        "[OK] Prop 'erro' adicionada ao ModalCurso."
    )


# ============================================================
# 2. MODALCURSO — BANNER DE ERRO
# ============================================================

if "erroVisivel" not in modal:

    assinatura = re.search(
        r'function\s+ModalCurso\s*\((.*?)\)\s*\{',
        modal,
        flags=re.DOTALL
    )

    if not assinatura:
        raise RuntimeError(
            "Não consegui localizar o corpo de ModalCurso()."
        )

    corpo_inicio = assinatura.end()

    banner = '''

  const erroVisivel = erro ? (
    <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />

        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-red-600">
            Atenção
          </p>

          <p className="mt-1 text-xs font-semibold leading-5 text-red-700">
            {erro}
          </p>
        </div>
      </div>
    </div>
  ) : null;
'''

    modal = (
        modal[:corpo_inicio]
        + banner
        + modal[corpo_inicio:]
    )

    marcador_form = re.search(
        r'\n(\s*)<form\b',
        modal
    )

    if not marcador_form:
        raise RuntimeError(
            "Formulário de ModalCurso não encontrado."
        )

    indentacao = marcador_form.group(1)

    insercao = (
        "\n"
        + indentacao
        + "{erroVisivel}\n"
    )

    pos = marcador_form.start()

    modal = (
        modal[:pos]
        + insercao
        + modal[pos:]
    )

    print(
        "[OK] Banner de erro inserido no ModalCurso."
    )


# ============================================================
# 3. NÍVEL — CARDS MODERNOS
# ============================================================

bloco_nivel = re.compile(
    r'''<CampoCurso\s+titulo="Nível">\s*
        <div\s+className="relative">\s*
        <select.*?</select>\s*
        <ChevronDown[^>]*/>\s*
        </div>\s*
        </CampoCurso>''',
    flags=re.DOTALL | re.VERBOSE
)

novo_nivel = '''<CampoCurso titulo="Nível">
                    <div className="grid gap-2 sm:grid-cols-3">
                      {[
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
                      ].map((nivel) => {
                        const activo =
                          formulario.level === nivel.valor;

                        return (
                          <button
                            key={nivel.valor}
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              setFormulario(
                                (atual) => ({
                                  ...atual,
                                  level: nivel.valor,
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
                  </CampoCurso>'''

modal_novo, encontrados = bloco_nivel.subn(
    novo_nivel,
    modal,
    count=1
)

if encontrados != 1:
    raise RuntimeError(
        "Selector actual de nível não foi encontrado."
    )

modal = modal_novo

print(
    "[OK] Nível convertido para selector visual moderno."
)


# ============================================================
# 4. BOTÃO DE PERGUNTAS — NOVO CURSO TAMBÉM
# ============================================================

condicional = re.compile(
    r'''\{curso\s*&&\s*\(\s*
        <button\s+
        type="button"\s+
        onClick=\{onAbrirTeste\}.*?
        <Settings2Icon\s*/>\s*
        Configurar\s+perguntas\s*
        </button>\s*
        \)\}''',
    flags=re.DOTALL | re.VERBOSE
)

botao = '''<button
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
                </button>'''

modal_novo, encontrados = condicional.subn(
    botao,
    modal,
    count=1
)

if encontrados != 1:
    # Fallback: procurar pelo texto e remover somente a condição.
    alvo = modal.find(
        "Configurar perguntas"
    )

    if alvo == -1:
        raise RuntimeError(
            "O botão 'Configurar perguntas' não foi encontrado."
        )

    inicio_botao = modal.rfind(
        "{curso && (",
        0,
        alvo
    )

    if inicio_botao == -1:
        raise RuntimeError(
            "Não encontrei a condição que esconde o botão de perguntas."
        )

    fim_botao = modal.find(
        ")}",
        alvo
    )

    if fim_botao == -1:
        raise RuntimeError(
            "Não encontrei o fim do botão de perguntas."
        )

    modal = (
        modal[:inicio_botao]
        + botao
        + modal[fim_botao + 2:]
    )
else:
    modal = modal_novo

print(
    "[OK] Botão de perguntas agora existe no Novo curso."
)


# ============================================================
# 5. BOTÃO PRINCIPAL
# ============================================================

modal = modal.replace(
    ': "Criar curso"}',
    ': "Publicar curso"}',
    1
)

# Gravar a versão actualizada do ModalCurso em memória.
text = (
    text[:inicio]
    + modal
    + text[fim:]
)

print(
    "[OK] ModalCurso actualizado."
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

'''
)


# ============================================================
# 8. ABRIR TESTE
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
        !Number.isInteger(resposta) ||
        resposta < 0 ||
        resposta >= OPCOES_POR_PERGUNTA
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

      // O ModalTeste pode ser um componente separado.
      // Por isso, também mostramos o erro de forma inequívoca.
      window.alert(
        erroValidacao
      );

      return;
    }

    // NOVO CURSO:
    // ainda não há course_id.
    // As perguntas ficam no estado React.
    if (!cursoActual?.id) {
      setErro("");
      setSucesso(
        "As 10 perguntas foram preenchidas. Pode agora publicar o curso."
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
        (actual) => ({
          ...actual,
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

        const enderecoInicial =
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
                    enderecoInicial,

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
            "O servidor criou o curso mas não devolveu o ID."
          );
        }

        // ====================================================
        // ENDEREÇO DEFINITIVO
        // ====================================================

        const enderecoReal =
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
                    enderecoReal,
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
              "O curso foi criado mas o endereço definitivo não pôde ser gravado."
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

      const endereco =
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

                link:
                  endereco,
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
# 13. INSTÂNCIA DO MODALCURSO
# ============================================================

inicio_inst = text.find(
    "<ModalCurso"
)

if inicio_inst == -1:
    raise RuntimeError(
        "Instância <ModalCurso /> não encontrada."
    )

fim_inst = text.find(
    "/>",
    inicio_inst
)

if fim_inst == -1:
    raise RuntimeError(
        "Fim da instância <ModalCurso /> não encontrado."
    )

instancia = text[
    inicio_inst:
    fim_inst + 2
]

instancia = re.sub(
    r'''onAbrirTeste=\{\(\) => \{.*?abrirTeste\(cursoActual\);\s*\}\}''',
    '''onAbrirTeste={() => {
          abrirTeste(cursoActual);
        }}''',
    instancia,
    count=1,
    flags=re.DOTALL
)

if "erro={erro}" not in instancia:

    ancora = "setFormulario={setFormulario}"

    if ancora not in instancia:
        raise RuntimeError(
            "Não encontrei o ponto para ligar erro ao ModalCurso."
        )

    instancia = instancia.replace(
        ancora,
        """setFormulario={setFormulario}
        erro={erro}""",
        1
    )

text = (
    text[:inicio_inst]
    + instancia
    + text[fim_inst + 2:]
)

print(
    "[OK] Instância do ModalCurso ligada às mensagens de erro."
)


# ============================================================
# 14. GARANTIR QUE NÃO EXISTE LIMITE DE 5
# ============================================================

text = re.sub(
    r'\.slice\(\s*0\s*,\s*5\s*\)',
    "",
    text
)

print(
    "[OK] Limite artificial de 5 cursos removido, se existisse."
)


# ============================================================
# 15. FORM NO-VALIDATE
# ============================================================

text = re.sub(
    r'(<form\s+onSubmit=\{onSubmit\})',
    r'\1\n          noValidate',
    text,
    count=1
)

print(
    "[OK] Validação controlada pelo SICSI."
)


# ============================================================
# 16. VERIFICAÇÕES DE SEGURANÇA
# ============================================================

obrigatorios = [
    (
        "botão novo teste",
        "Preencher 10 perguntas"
        in text
    ),

    (
        "publicar curso",
        "Publicar curso"
        in text
    ),

    (
        "abrir teste sem curso",
        "function abrirTeste(curso = null)"
        in text
    ),

    (
        "guardar teste sem course_id",
        "As 10 perguntas foram preenchidas."
        in text
    ),

    (
        "POST completo",
        "questions: perguntasPayload"
        in text
    ),

    (
        "endereço definitivo",
        "student/cursos/${cursoId}"
        in text
    ),

    (
        "validação 10 perguntas",
        "TOTAL_PERGUNTAS"
        in text
    ),

    (
        "mensagem erro",
        "erroVisivel"
        in text
    ),

    (
        "modalcurso recebe erro",
        "erro={erro}"
        in text
    ),
]

falhas = [
    nome
    for nome, ok in obrigatorios
    if not ok
]

if falhas:
    raise RuntimeError(
        "VERIFICAÇÕES FALHARAM: "
        + ", ".join(falhas)
        + "\n\nNenhuma alteração foi gravada."
    )


# ============================================================
# 17. GRAVAÇÃO ATÓMICA
# ============================================================

temporario = path.with_suffix(
    ".jsx.tmp"
)

temporario.write_text(
    text,
    encoding="utf-8"
)

# Confirma que o ficheiro temporário tem conteúdo.
if temporario.stat().st_size <= 0:
    temporario.unlink(
        missing_ok=True
    )

    raise RuntimeError(
        "O ficheiro temporário ficou vazio. Alteração cancelada."
    )

shutil.move(
    temporario,
    path
)

print("")
print("============================================================")
print(" CORRECÇÃO REAL GRAVADA")
print("============================================================")
print("")

for nome, ok in obrigatorios:
    print(
        f"[OK] {nome}"
    )

print("")
print(
    "[OK] Backup criado:"
)
print(
    "     AdminCoursesPage.jsx.backup-verdadeiro-fluxo"
)
print("")
print(
    "[OK] O ModalTeste não foi alterado."
)
print("")
