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
# LOCALIZADOR DE FUNÇÕES
# ============================================================

def localizar_funcao(nome):
    global text

    procura = re.search(
        rf'function\s+{re.escape(nome)}\s*\(',
        text
    )

    if not procura:
        raise RuntimeError(
            f"Função tradicional '{nome}()' não encontrada."
        )

    inicio = procura.start()
    pos = procura.end()

    # Encontrar a primeira abertura de chaveta do corpo.
    abre = text.find("{", pos)

    if abre == -1:
        raise RuntimeError(
            f"Corpo de '{nome}()' não encontrado."
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
                estado = "linha"
                i += 2
                continue

            if ch == "/" and prox == "*":
                estado = "bloco"
                i += 2
                continue

            if ch == "'":
                estado = "simples"
                i += 1
                continue

            if ch == '"':
                estado = "duplas"
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

        if estado == "linha":

            if ch == "\n":
                estado = "normal"

            i += 1
            continue

        if estado == "bloco":

            if ch == "*" and prox == "/":
                estado = "normal"
                i += 2
            else:
                i += 1

            continue

        if estado == "simples":

            if ch == "\\":
                i += 2
                continue

            if ch == "'":
                estado = "normal"

            i += 1
            continue

        if estado == "duplas":

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
        f"Fim da função '{nome}()' não encontrado."
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
        f"[OK] {nome}() actualizada."
    )


# ============================================================
# 1. MODALCURSO — ADICIONAR ERRO
# ============================================================

inicio, fim = localizar_funcao("ModalCurso")
modal = text[inicio:fim]

if re.search(
    r'^\s*erro,\s*$',
    modal,
    re.MULTILINE
) is None:

    alvo = """  onAbrirTeste,
}) {"""

    if alvo not in modal:
        raise RuntimeError(
            "A assinatura actual de ModalCurso não corresponde ao esperado."
        )

    modal = modal.replace(
        alvo,
        """  onAbrirTeste,
  erro,
}) {""",
        1
    )

    print(
        "[OK] Prop erro adicionada ao ModalCurso."
    )
else:
    print(
        "[OK] Prop erro já estava presente."
    )


# ============================================================
# 2. MODALCURSO — MENSAGEM DE ERRO
# ============================================================

if "erroVisivel" not in modal:

    alvo = """  if (!aberto) return null;"""

    if alvo not in modal:
        raise RuntimeError(
            "Início visual do ModalCurso não encontrado."
        )

    banner = """  if (!aberto) return null;

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
  ) : null;"""

    modal = modal.replace(
        alvo,
        banner,
        1
    )

    # inserir antes do formulário
    encontrou_form = re.search(
        r'(\n\s*)<form\b',
        modal
    )

    if not encontrou_form:
        raise RuntimeError(
            "Formulário do ModalCurso não encontrado."
        )

    pos = encontrou_form.start()

    indentacao = encontrou_form.group(1)

    insercao = (
        "\n"
        + indentacao
        + "{erroVisivel}\n"
    )

    modal = (
        modal[:pos]
        + insercao
        + modal[pos:]
    )

    print(
        "[OK] Banner de erro adicionado."
    )


# ============================================================
# 3. NÍVEL MODERNO
# ============================================================

nivel = re.compile(
    r'''<CampoCurso\s+titulo="Nível">\s*
        <div\s+className="relative">.*?
        </div>\s*
        </CampoCurso>''',
    flags=re.DOTALL | re.VERBOSE
)

novo_nivel = '''<CampoCurso titulo="Nível">
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
                                    ? "border-white/40"
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

modal_novo, qtd = nivel.subn(
    novo_nivel,
    modal,
    count=1
)

if qtd != 1:
    raise RuntimeError(
        "Selector de nível não encontrado."
    )

modal = modal_novo

print(
    "[OK] Selector de nível modernizado."
)


# ============================================================
# 4. BOTÃO DE PERGUNTAS
# ============================================================

padrao_botao = re.compile(
    r'''\{curso\s*&&\s*\(\s*
        <button
        type="button"
        onClick=\{onAbrirTeste\}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-3 text-xs font-bold text-white transition hover:bg-indigo-700"
        >
        <Settings2Icon\s*/>
        Configurar perguntas
        </button>
        \)\}''',
    flags=re.DOTALL | re.VERBOSE
)

novo_botao = '''<button
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

modal_novo, qtd = padrao_botao.subn(
    novo_botao,
    modal,
    count=1
)

if qtd != 1:
    # fallback directo pelo bloco real
    alvo = """                {curso && (
                  <button
                    type="button"
                    onClick={onAbrirTeste}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-3 text-xs font-bold text-white transition hover:bg-indigo-700"
                  >
                    <Settings2Icon />
                    Configurar perguntas
                  </button>
                )}"""

    if alvo not in modal:
        raise RuntimeError(
            "Botão actual de configuração das perguntas não encontrado."
        )

    modal_novo = modal.replace(
        alvo,
        novo_botao,
        1
    )

modal = modal_novo

print(
    "[OK] Botão de perguntas habilitado no Novo curso."
)


# ============================================================
# 5. BOTÃO PRINCIPAL
# ============================================================

modal = modal.replace(
    ': "Criar curso"}',
    ': "Publicar curso"}',
    1
)

text = (
    text[:inicio]
    + modal
    + text[fim:]
)

print(
    "[OK] ModalCurso actualizado."
)


# ============================================================
# 6. NOVO CURSO
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

    setCursoModal(true);
    setTesteModal(false);
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
      title:
        curso?.title || "",

      description:
        curso?.description || "",

      level:
        curso?.level || "Básico",

      published:
        Boolean(curso?.published),

      image_url:
        curso?.image_url || "",

      link:
        curso?.link || "",
    });

    setPerguntas(
      Array.isArray(curso?.questions)
        ? normalizarPerguntas(
            curso.questions
          )
        : perguntasVazias()
    );

    setErro("");
    setSucesso("");

    setCursoModal(true);
    setTesteModal(false);
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
      // Novo curso:
      // utilizar as perguntas que já estão no estado.
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
# 10. GUARDAR TESTE
#
# NÃO substituímos validarTeste.
# Preservamos a validação existente.
# ============================================================

inicio, fim = localizar_funcao(
    "guardarTeste"
)

bloco = text[inicio:fim]

antigo = """async function guardarTeste() {
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

novo = """async function guardarTeste() {
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
    // As perguntas ficam em memória até a publicação.
    if (!cursoActual?.id) {
      setErro("");
      setSucesso(
        "As 10 perguntas foram preenchidas com sucesso."
      );

      setTesteModal(false);
      setCursoModal(true);

      return;
    }

    // CURSO EXISTENTE:
    setSaving(true);"""

if antigo not in bloco:
    raise RuntimeError(
        "O início de guardarTeste() não corresponde ao código actual."
    )

bloco = bloco.replace(
    antigo,
    novo,
    1
)

text = (
    text[:inicio]
    + bloco
    + text[fim:]
)

print(
    "[OK] guardarTeste() funciona no Novo curso sem course_id."
)


# ============================================================
# 11. GUARDAR CURSO
# ============================================================

substituir_funcao(
    "guardarCurso",
    '''async function guardarCurso(event) {
    event?.preventDefault?.();

    const titulo =
      String(
        formulario?.title || ""
      ).trim();

    const descricao =
      String(
        formulario?.description || ""
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

    // A validação existente continua a ser a autoridade
    // para as 10 perguntas.
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
        formulario?.image_url || ""
      ).trim() ||
      obterImagemCurso(
        titulo
      );

    const perguntasPayload =
      perguntas.map(
        (pergunta) => ({
          question:
            String(
              pergunta?.question || ""
            ).trim(),

          options:
            Array.isArray(
              pergunta?.options
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
              pergunta?.correct_answer
            ),

          explanation:
            String(
              pergunta?.explanation || ""
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

      // ====================================================
      // NOVO CURSO
      // ====================================================

      if (!cursoActual?.id) {

        // O backend aceita o marcador {id} e resolve
        // o endereço com o ID real do curso.
        const endereco =
          `${window.location.origin}/student/cursos/{id}`;

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
                      formulario?.published
                    ),

                  image_url:
                    fotografia,

                  link:
                    endereco,

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
              "Não foi possível publicar o novo curso."
          );
        }

        const cursoCriado =
          normalizarCursos([
            dados
          ])[0] ||
          dados;

        setCursoActual(
          cursoCriado
        );

        await carregarCursos();

        setCursoModal(false);
        setTesteModal(false);

        setPerguntas(
          perguntasVazias()
        );

        setSucesso(
          "Curso publicado com sucesso, incluindo as 10 perguntas."
        );

        return;
      }


      // ====================================================
      // CURSO EXISTENTE
      // ====================================================

      const endereco =
        String(
          formulario?.link || ""
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
                    formulario?.published
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

      const cursoActualizado =
        normalizarCursos([
          dados
        ])[0] ||
        dados;

      setCursoActual(
        cursoActualizado
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
# 12. INSTÂNCIA DO MODAL
# ============================================================

inicio = text.find(
    "<ModalCurso"
)

if inicio == -1:
    raise RuntimeError(
        "Instância de <ModalCurso /> não encontrada."
    )

fim = text.find(
    "/>",
    inicio
)

if fim == -1:
    raise RuntimeError(
        "Fim de <ModalCurso /> não encontrado."
    )

instancia = text[
    inicio:
    fim + 2
]

# Simplificar callback actual.
callback = re.compile(
    r'''onAbrirTeste=\{\(\) => \{
\s*setCursoModal\(false\);
\s*abrirTeste\(cursoActual\);
\s*\}\}''',
    flags=re.DOTALL
)

instancia, qtd = callback.subn(
    """onAbrirTeste={() => {
          abrirTeste(cursoActual);
        }}""",
    instancia,
    count=1
)

if qtd == 1:
    print(
        "[OK] Callback do teste simplificado."
    )

if "erro={erro}" not in instancia:

    ancora = "setFormulario={setFormulario}"

    if ancora not in instancia:
        raise RuntimeError(
            "Ponto de ligação de erro ao ModalCurso não encontrado."
        )

    instancia = instancia.replace(
        ancora,
        """setFormulario={setFormulario}
        erro={erro}""",
        1
    )

    print(
        "[OK] Erro ligado ao ModalCurso."
    )

text = (
    text[:inicio]
    + instancia
    + text[fim + 2:]
)


# ============================================================
# 13. GARANTIR TODOS OS CURSOS
# ============================================================

text = re.sub(
    r'\.slice\(\s*0\s*,\s*5\s*\)',
    "",
    text
)

print(
    "[OK] Nenhum limite artificial de 5 cursos."
)


# ============================================================
# 14. VERIFICAÇÕES
# ============================================================

verificacoes = {
    "novo curso":
        "function abrirNovoCurso()" in text,

    "novo teste":
        'Preencher 10 perguntas' in text,

    "guardar teste local":
        "As 10 perguntas foram preenchidas com sucesso." in text,

    "publicar curso":
        "Publicar curso" in text,

    "fotografia automática":
        "obterImagemCurso(" in text,

    "10 perguntas":
        "TOTAL_PERGUNTAS" in text,

    "link student":
        "/student/cursos/{id}" in text,

    "ModalCurso recebe erro":
        "erro={erro}" in text,

    "ModalCurso banner":
        "erroVisivel" in text,

    "ModalTeste preservado":
        "<ModalTeste" in text,
}

falhas = [
    nome
    for nome, ok in verificacoes.items()
    if not ok
]

if falhas:
    raise RuntimeError(
        "VERIFICAÇÕES FALHARAM: "
        + ", ".join(falhas)
        + "\nNenhuma alteração foi gravada."
    )


# ============================================================
# 15. ESCRITA ATÓMICA
# ============================================================

temporario = path.with_suffix(
    ".jsx.tmp"
)

temporario.write_text(
    text,
    encoding="utf-8"
)

if temporario.stat().st_size <= 0:
    temporario.unlink(
        missing_ok=True
    )

    raise RuntimeError(
        "Ficheiro temporário inválido. Alteração cancelada."
    )

shutil.move(
    temporario,
    path
)

print("")
print("============================================================")
print(" CORRECÇÃO GRAVADA COM SUCESSO")
print("============================================================")
print("")

for nome in verificacoes:
    print(
        f"[OK] {nome}"
    )

print("")
print(
    "[OK] validarTeste() existente foi preservada."
)
print(
    "[OK] ModalTeste foi preservado."
)
print("")
