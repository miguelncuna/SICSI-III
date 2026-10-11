from pathlib import Path
import re

path = Path("src/pages/admin/AdminCoursesPage.jsx")
text = path.read_text(encoding="utf-8")

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
        raise RuntimeError(f"Não foi possível corrigir: {nome}")
    text = novo
    print(f"[OK] {nome}")

# ============================================================
# 1. IMAGEM AUTOMÁTICA — SEM CAMPO PARA O ADMIN
# ============================================================

if "function obterImagemCurso" not in text:
    marcador = r'''function obterLinkCurso\(id\) \{.*?\n\}'''
    substituir(
        marcador,
        '''function obterLinkCurso(id) {
  if (!id) return "";
  return `${window.location.origin}/admin/cursos/${id}/visualizar`;
}

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

  if (nome.includes("credencial") || nome.includes("protec")) {
    return "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1200&q=85";
  }

  return "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=85";
}''',
        "imagem automática dos cursos"
    )

# ============================================================
# 2. REMOVER DEFINITIVAMENTE O CAMPO DE FOTOGRAFIA
# ============================================================

padrao_foto = r'''\s*<CampoCurso titulo="Fotografia do curso">.*?</CampoCurso>\s*'''

novo, total = re.subn(
    padrao_foto,
    "\n",
    text,
    count=1,
    flags=re.MULTILINE | re.DOTALL
)

if total == 1:
    text = novo
    print("[OK] Campo de fotografia removido do formulário.")
else:
    print("[INFO] Campo de fotografia já não existe no formulário.")

text = text.replace(
    "Nome, descrição, fotografia, link e nível.",
    "Nome, descrição, link e nível."
)

# ============================================================
# 3. GARANTIR 10 PERGUNTAS SEMPRE
# ============================================================

def perguntas_vazias():
    return """Array.from(
      { length: TOTAL_PERGUNTAS },
      (_, index) => ({
        id: "",
        numero: index + 1,
        question: "",
        options: ["", "", "", ""],
        correct_answer: null,
        explanation: "",
      })
    )"""

substituir(
    r'''function perguntasVazias\(\) \{.*?\n\}''',
    f'''function perguntasVazias() {{
    return {perguntas_vazias()};
  }}''',
    "estrutura das 10 perguntas"
)

# ============================================================
# 4. ABRIR O TESTE TANTO PARA NOVO CURSO COMO PARA EDIÇÃO
# ============================================================

substituir(
    r'''function abrirTeste\(curso\) \{.*?\n\s*\}''',
    '''function abrirTeste(curso = null) {
    setCursoActual(curso || null);

    if (curso && Array.isArray(curso.questions) && curso.questions.length > 0) {
      setPerguntas(normalizarPerguntas(curso.questions));
    } else if (Array.isArray(perguntas) && perguntas.length === TOTAL_PERGUNTAS) {
      setPerguntas(normalizarPerguntas(perguntas));
    } else {
      setPerguntas(perguntasVazias());
    }

    setCursoModal(false);
    setTesteModal(true);
    setErro("");
    setSucesso("");
  }''',
    "abertura do modal das perguntas"
)

# ============================================================
# 5. VALIDAR TODAS AS PERGUNTAS ANTES DE PUBLICAR
# ============================================================

substituir(
    r'''function validarTeste\(\) \{.*?(?=\n\s*async function guardarTeste\(\))''',
    '''function validarTeste() {
    if (!Array.isArray(perguntas) || perguntas.length !== TOTAL_PERGUNTAS) {
      return "O curso deve conter exactamente 10 perguntas.";
    }

    for (let index = 0; index < TOTAL_PERGUNTAS; index += 1) {
      const pergunta = perguntas[index];

      const numero = index + 1;
      const texto = String(pergunta?.question || "").trim();
      const opcoes = Array.isArray(pergunta?.options)
        ? pergunta.options.map((opcao) => String(opcao || "").trim())
        : [];

      if (!texto) {
        return `A pergunta ${numero} está vazia.`;
      }

      if (opcoes.length !== OPCOES_POR_PERGUNTA) {
        return `A pergunta ${numero} deve ter exactamente 4 opções.`;
      }

      for (let opcao = 0; opcao < OPCOES_POR_PERGUNTA; opcao += 1) {
        if (!opcoes[opcao]) {
          return `Preencha a opção ${OPCOES_LETRAS[opcao]} da pergunta ${numero}.`;
        }
      }

      if (new Set(opcoes).size !== OPCOES_POR_PERGUNTA) {
        return `As 4 opções da pergunta ${numero} devem ser diferentes.`;
      }

      const resposta = pergunta?.correct_answer;

      if (
        resposta === null ||
        resposta === undefined ||
        resposta === "" ||
        !Number.isInteger(Number(resposta)) ||
        Number(resposta) < 0 ||
        Number(resposta) >= OPCOES_POR_PERGUNTA
      ) {
        return `Marque a resposta certa da pergunta ${numero}.`;
      }

      const explicacao = String(pergunta?.explanation || "").trim();

      if (!explicacao) {
        return `Preencha a explicação da pergunta ${numero}.`;
      }
    }

    return "";
  }

''',
    "validação completa das 10 perguntas"
)

# ============================================================
# 6. GUARDAR TESTE PARA NOVO CURSO
# ============================================================

substituir(
    r'''async function guardarTeste\(\) \{.*?(?=\n\s*async function guardarCurso\()''',
    '''async function guardarTeste() {
    const erroValidacao = validarTeste();

    if (erroValidacao) {
      setErro(erroValidacao);
      setSucesso("");
      return;
    }

    if (!cursoActual?.id) {
      setTesteModal(false);
      setCursoModal(true);
      setErro("");
      setSucesso("As 10 perguntas estão preenchidas. Agora pode criar o curso.");
      return;
    }

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
          options: pergunta.options.map((opcao) => String(opcao || "").trim()),
          correct_answer: Number(pergunta.correct_answer),
          explanation: String(pergunta.explanation || "").trim(),
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

        const dados = await resposta.json().catch(() => null);

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

      setPerguntas(normalizarPerguntas(guardadas));

      await carregarCursos();

      setTesteModal(false);
      setCursoModal(true);
      setSucesso("As 10 perguntas foram guardadas com sucesso.");
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
    "gravação das perguntas"
)

# ============================================================
# 7. GUARDAR CURSO — SEM FOTOGRAFIA OBRIGATÓRIA
# ============================================================

substituir(
    r'''async function guardarCurso\(event\) \{.*?(?=\n\s*async function guardarTeste\(\))''',
    '''async function guardarCurso(event) {
    event?.preventDefault?.();

    const titulo = String(formulario.title || "").trim();
    const descricao = String(formulario.description || "").trim();
    const link = String(formulario.link || "").trim();

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
      setErro("O link do curso deve começar por http:// ou https://.");
      return;
    }

    const erroTeste = validarTeste();

    if (erroTeste) {
      setErro(erroTeste);
      setSucesso("");
      setTesteModal(true);
      setCursoModal(false);
      return;
    }

    const fotografia =
      String(formulario.image_url || "").trim() ||
      obterImagemCurso(titulo);

    const perguntasPayload = perguntas.map((pergunta) => ({
      question: String(pergunta.question || "").trim(),
      options: pergunta.options.map(
        (opcao) => String(opcao || "").trim()
      ),
      correct_answer: Number(pergunta.correct_answer),
      explanation: String(pergunta.explanation || "").trim(),
    }));

    setSaving(true);
    setErro("");
    setSucesso("");

    try {
      if (!cursoActual?.id) {
        const resposta = await fetch(
          `${API_BASE}/admin/courses`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: titulo,
              description: descricao,
              published: true,
              image_url: fotografia,
              link,
              questions: perguntasPayload,
            }),
          }
        );

        const dados = await resposta.json().catch(() => null);

        if (!resposta.ok) {
          throw new Error(
            dados?.detail ||
              "Não foi possível criar o curso."
          );
        }

        setCursoActual(normalizarCursos([dados])[0]);
        setPerguntas(perguntasVazias());
        setCursoModal(false);
        setTesteModal(false);

        await carregarCursos();

        setSucesso(
          "Curso publicado com sucesso, incluindo as 10 perguntas."
        );

        return;
      }

      const resposta = await fetch(
        `${API_BASE}/admin/courses/${cursoActual.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: titulo,
            description: descricao,
            published: Boolean(formulario.published),
            image_url: fotografia,
            link,
          }),
        }
      );

      const dados = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        throw new Error(
          dados?.detail ||
            "Não foi possível actualizar o curso."
        );
      }

      setCursoActual(normalizarCursos([dados])[0]);
      setCursoModal(false);

      await carregarCursos();

      setSucesso("Curso actualizado com sucesso.");
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
    "criação e publicação do curso"
)

# ============================================================
# 8. GARANTIR QUE O BOTÃO DE PERGUNTAS NÃO SUBMETE O FORMULÁRIO
# ============================================================

def corrigir_botao(texto):
    texto = texto.replace(
        'onClick={onAbrirTeste}',
        '''onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onAbrirTeste();
                    }}'''
    )

    if 'type="button"' not in texto:
        texto = texto.replace("<button", '<button type="button"', 1)

    return texto

padrao_botao = re.compile(
    r'<button\b.*?(?:Preencher 10 perguntas|Preencher Questões|Configurar perguntas).*?</button>',
    re.MULTILINE | re.DOTALL
)

match = padrao_botao.search(text)

if match:
    bloco = corrigir_botao(match.group(0))
    text = text[:match.start()] + bloco + text[match.end():]
    print("[OK] Botão das perguntas protegido.")
else:
    print("[INFO] Botão das perguntas não encontrado com estes textos.")

# ============================================================
# 9. LISTA — MOSTRAR TODOS OS CURSOS
# ============================================================

text = re.sub(
    r'\.slice\(\s*0\s*,\s*5\s*\)',
    '',
    text
)

text = re.sub(
    r'\.slice\(\s*0\s*,\s*5\s*\)',
    '',
    text
)

print("[OK] Removidos limites de cinco cursos, se existirem.")

# Remove limites de altura que possam esconder cursos na lista.
text = text.replace(
    "max-h-[500px] overflow-y-auto",
    "overflow-visible"
)

text = text.replace(
    "max-h-[600px] overflow-y-auto",
    "overflow-visible"
)

text = text.replace(
    "max-h-[70vh] overflow-y-auto",
    "overflow-visible"
)

path.write_text(text, encoding="utf-8")

print("")
print("==============================================")
print(" SICSI III — CORRECÇÃO DOS CURSOS CONCLUÍDA")
print("==============================================")
