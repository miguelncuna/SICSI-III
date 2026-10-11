from pathlib import Path
import re

path = Path("src/pages/admin/AdminCoursesPage.jsx")
text = path.read_text(encoding="utf-8")

padrao = re.compile(
    r'<button\b.*?\{curso\s*\?\s*"Configurar perguntas"\s*:\s*"Preencher 10 perguntas"\}.*?</button>',
    re.S
)

match = padrao.search(text)

if not match:
    padrao = re.compile(
        r'<button\b.*?\{curso\s*\?\s*"Configurar perguntas"\s*:\s*"Preencher Questões"\}.*?</button>',
        re.S
    )
    match = padrao.search(text)

if not match:
    raise RuntimeError(
        "Não encontrei o botão 'Preencher 10 perguntas'/'Preencher Questões'."
    )

bloco = match.group(0)

# Garante que nunca seja submit.
if not re.search(r'\btype\s*=\s*["\']button["\']', bloco):
    bloco = re.sub(
        r'<button\b',
        '<button type="button"',
        bloco,
        count=1
    )

# Evita propagação/submissão do formulário.
bloco = bloco.replace(
    'onClick={onAbrirTeste}',
    '''onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onAbrirTeste();
                    }}''',
    1
)

text = text[:match.start()] + bloco + text[match.end():]

path.write_text(text, encoding="utf-8")

print("OK - botão 'Preencher Questões' protegido contra submissão do formulário.")
