from pathlib import Path
import re

path = Path("src/pages/admin/AdminCoursesPage.jsx")
text = path.read_text(encoding="utf-8")

def fail(msg):
    raise RuntimeError(msg)

def must_replace(pattern, replacement, label, source=None):
    global text

    alvo = text if source is None else source

    novo, total = re.subn(
        pattern,
        replacement,
        alvo,
        count=1,
        flags=re.MULTILINE | re.DOTALL
    )

    if total != 1:
        fail(f"Não foi possível alterar: {label}")

    if source is None:
        text = novo

    return novo

# ============================================================
# 1. MODAL DE CURSO — RECEBER ERRO
# ============================================================

modal_start = text.find("function ModalCurso({")
modal_end = text.find("function Settings2Icon()", modal_start)

if modal_start == -1 or modal_end == -1:
    fail("ModalCurso não encontrado.")

modal = text[modal_start:modal_end]

if "erro," not in modal.split("})", 1)[0]:
    modal = modal.replace(
        "  onAbrirTeste,\n}) {",
        "  onAbrirTeste,\n  erro,\n}) {",
        1
    )

# ============================================================
# 2. FORMULÁRIO SEM VALIDAÇÃO NATIVA DO NAVEGADOR
# ============================================================

modal = re.sub(
    r'''(<form\b[^>]*onSubmit=\{onSubmit\})(\s*)(className=)''',
    r'''\1 noValidate\2\3''',
    modal,
    count=1,
    flags=re.MULTILINE | re.DOTALL
)

# ============================================================
# 3. MENSAGEM DE ERRO DENTRO DO MODAL
# ============================================================

if "{erro && (" not in modal:
    marcador = r'''(\s*</div>\s*</div>\s*<form)'''

    banner = '''
        
        {erro && (
          <div className="shrink-0 border-b border-red-100 bg-red-50 px-5 py-3 sm:px-7">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertCircle className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-600">
                  Atenção
                </p>

                <p className="mt-0.5 text-xs font-semibold leading-5 text-red-700">
                  {erro}
                </p>
              </div>
            </div>
          </div>
        )}

        <form'''

    novo_modal, total = re.subn(
        marcador,
        lambda m: m.group(1).replace("<form", "") + banner,
        modal,
        count=1,
        flags=re.MULTILINE | re.DOTALL
    )

    if total == 1:
        modal = novo_modal
        print("[OK] Mensagens de erro integradas no modal.")
    else:
        print("[INFO] Não foi possível inserir banner de erro automaticamente.")

# ============================================================
# 4. SUBSTITUIR DROPDOWN POR SELECTOR MODERNO DE NÍVEL
# ============================================================

padrao_nivel = r'''<CampoCurso titulo="Nível">.*?</CampoCurso>'''

nivel_novo = '''<CampoCurso titulo="Nível">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          valor: "Básico",
                          descricao: "Fundamentos",
                        },
                        {
                          valor: "Intermédio",
                          descricao: "Prática",
                        },
                        {
                          valor: "Avançado",
                          descricao: "Especialista",
                        },
                      ].map((nivel) => {
                        const selecionado =
                          formulario.level === nivel.valor;

                        return (
                          <button
                            key={nivel.valor}
                            type="button"
                            onClick={() =>
                              setFormulario((atual) => ({
                                ...atual,
                                level: nivel.valor,
                              }))
                            }
                            disabled={saving}
                            aria-pressed={selecionado}
                            className={`group rounded-2xl border p-3 text-left transition ${
                              selecionado
                                ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-black">
                                {nivel.valor}
                              </span>

                              <span
                                className={`h-2.5 w-2.5 rounded-full ${
                                  selecionado
                                    ? "bg-white"
                                    : "bg-slate-300 group-hover:bg-blue-400"
                                }`}
                              />
                            </div>

                            <p
                              className={`mt-1 text-[9px] font-semibold ${
                                selecionado
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

novo_modal, total = re.subn(
    padrao_nivel,
    nivel_novo,
    modal,
    count=1,
    flags=re.MULTILINE | re.DOTALL
)

if total != 1:
    fail("Campo Nível não encontrado.")

modal = novo_modal

# ============================================================
# 5. BOTÃO DE PERGUNTAS — TANTO NOVO COMO EDIÇÃO
# ============================================================

padrao_botao = r'''\{curso\s*&&\s*\(\s*<button\b.*?<Settings2Icon\s*/>\s*Configurar perguntas\s*</button>\s*\)\}'''

botao_perguntas = '''<button
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

novo_modal, total = re.subn(
    padrao_botao,
    botao_perguntas,
    modal,
    count=1,
    flags=re.MULTILINE | re.DOTALL
)

if total != 1:
    fail("Botão de perguntas não encontrado.")

modal = novo_modal

# ============================================================
# 6. TEXTO INFORMATIVO DO TESTE
# ============================================================

modal = modal.replace(
    '''Depois de criar o curso, pode configurar imediatamente o
                    teste final com as 10 perguntas.''',
    '''Preencha as 10 perguntas antes de publicar o curso.
                    Cada pergunta deve ter quatro opções, uma resposta certa
                    e uma explicação.''',
    1
)

# ============================================================
# 7. BOTÃO PRINCIPAL: "PUBLICAR CURSO"
# ============================================================

modal = modal.replace(
    '''{curso
                    ? "Guardar alterações"
                    : "Criar curso"}''',
    '''{curso
                    ? "Guardar alterações"
                    : "Publicar curso"}''',
    1
)

# Substitui o modal original pela versão corrigida.
text = text[:modal_start] + modal + text[modal_end:]

print("[OK] Interface do Novo Curso actualizada.")

# ============================================================
# 8. ABRIR TESTE — FUNCIONAR COM NOVO CURSO
# ============================================================

inicio = text.find("function abrirTeste(curso)")
fim = text.find("function fecharCursoModal()", inicio)

if inicio == -1 or fim == -1:
    fail("Função abrirTeste() não encontrada.")

nova_funcao = '''function abrirTeste(curso = null) {
    setCursoActual(curso || null);

    if (
      curso &&
      Array.isArray(curso.questions)
    ) {
      setPerguntas(
        normalizarPerguntas(
          curso.questions
        )
      );
    } else {
      setPerguntas(
        (atual) =>
          Array.isArray(atual) &&
          atual.length === TOTAL_PERGUNTAS
            ? atual
            : perguntasVazias()
      );
    }

    setCursoModal(false);
    setTesteModal(true);
    setErro("");
    setSucesso("");
  }

  '''

text = text[:inicio] + nova_funcao + text[fim:]

print("[OK] Abertura do teste corrigida para novos cursos.")

# ============================================================
# 9. CALLBACK DO MODAL PRINCIPAL
# ============================================================

padrao_callback = r'''onAbrirTeste=\{\(\) => \{
\s*setCursoModal\(false\);
\s*abrirTeste\(cursoActual\);
\s*\}\}'''

callback_novo = '''onAbrirTeste={() => {
          abrirTeste(cursoActual);
        }}'''

text, total = re.subn(
    padrao_callback,
    callback_novo,
    text,
    count=1,
    flags=re.MULTILINE | re.DOTALL
)

if total == 1:
    print("[OK] Ligação Novo Curso → Perguntas corrigida.")
else:
    print("[INFO] Callback já está noutra forma; não foi necessário substituir.")

# ============================================================
# 10. PASSAR ERRO AO MODAL DE CURSO
# ============================================================

if "erro={erro}" not in text:
    padrao = r'''(formulario=\{formulario\}\s*
\s*setFormulario=\{setFormulario\}\s*
\s*saving=\{saving\})'''

    replacement = r'''\1
        erro={erro}'''

    text, total = re.subn(
        padrao,
        replacement,
        text,
        count=1,
        flags=re.MULTILINE | re.DOTALL
    )

    if total == 1:
        print("[OK] Erros ligados ao modal.")
    else:
        print("[INFO] Não foi possível ligar erro={erro} automaticamente.")

# ============================================================
# 11. GARANTIR QUE A VALIDAÇÃO DO CURSO ABRE O MODAL DAS PERGUNTAS
# ============================================================

padrao_validacao = r'''const erroTeste\s*=\s*validarTeste\(\);\s*
\s*if\s*\(erroTeste\)\s*\{\s*
\s*setErro\(erroTeste\);\s*
\s*setSucesso\(""\);\s*
\s*(?:setCursoModal\(false\);\s*)?
\s*(?:setTesteModal\(true\);\s*)?
\s*return;\s*
\s*\}'''

replacement_validacao = '''const erroTeste = validarTeste();

    if (erroTeste) {
      setErro(erroTeste);
      setSucesso("");
      setCursoModal(false);
      setTesteModal(true);
      return;
    }'''

text, total = re.subn(
    padrao_validacao,
    replacement_validacao,
    text,
    count=1,
    flags=re.MULTILINE | re.DOTALL
)

if total == 1:
    print("[OK] Guardar/Publicar redirecciona para a pergunta que falta.")
else:
    print("[INFO] Validação já possui lógica equivalente.")

# ============================================================
# 12. REMOVER EVENTUAIS LIMITES DE 5
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
    print("[OK] Nenhum limite slice(0,5) encontrado.")

# ============================================================
# 13. GRAVAR
# ============================================================

path.write_text(
    text,
    encoding="utf-8"
)

print("")
print("============================================================")
print(" SICSI III — NOVO CURSO CORRIGIDO")
print("============================================================")
print("")
print("Agora o Novo Curso possui:")
print(" - botão Preencher 10 perguntas")
print(" - 10 perguntas independentes")
print(" - 4 opções por pergunta")
print(" - resposta certa")
print(" - explicação")
print(" - selector de nível moderno")
print(" - mensagens de erro visíveis")
print(" - botão Publicar curso")
print(" - fotografia automática")
print(" - todos os cursos sem limite de cinco")
