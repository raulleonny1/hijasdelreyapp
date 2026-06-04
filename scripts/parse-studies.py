"""Parse extracted PDF text into structured study JSON."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEXT = ROOT / "_extracted.txt"
OUT = ROOT / "src" / "data" / "studies.json"

STUDY_META = [
    {"id": 1, "num": "UNO", "title": "¿Qué es un cristiano?", "part": "Las Hijas en un viaje", "subtitle": "El viaje de fe con Jesús"},
    {"id": 2, "num": "DOS", "title": "¿Qué es una Orden?", "part": "Las Hijas en un viaje", "subtitle": "Historia y misión de La Orden"},
    {"id": 3, "num": "TRES", "title": "¿Qué espera Cristo de sus Hijas?", "part": "Nuestro compromiso", "subtitle": "Deberes y responsabilidades"},
    {"id": 4, "num": "CUATRO", "title": "¿Cuál es el propósito primordial de la Orden?", "part": "Nuestro compromiso", "subtitle": "Oración, servicio y evangelización"},
    {"id": 5, "num": "CINCO", "title": "¿Cuál es el propósito de un capítulo?", "part": "Nuestro compromiso", "subtitle": "Comunidad y fraternidad"},
    {"id": 6, "num": "SEIS", "title": "Los fondos de La Orden", "part": "Nuestro compromiso", "subtitle": "Ministerios y recursos"},
    {"id": 7, "num": "SIETE", "title": "Oración y estudio", "part": "¿Quiénes somos? Martas y Marías", "subtitle": "La Regla de Oración"},
    {"id": 8, "num": "OCHO", "title": "Servicio y evangelización", "part": "¿Quiénes somos? Martas y Marías", "subtitle": "La Regla de Servicio"},
    {"id": 9, "num": "NUEVE", "title": "¿Cuál es una Regla de Vida?", "part": "¿Quiénes somos? Martas y Marías", "subtitle": "Tu compromiso personal"},
    {"id": 10, "num": "DIEZ", "title": "¿Cómo están las Hijas facultadas para servir?", "part": "Alcanzar para servir", "subtitle": "Dones espirituales"},
    {"id": 11, "num": "ONCE", "title": "Llamado a la humildad", "part": "Alcanzar para servir", "subtitle": "Servir con el corazón de Cristo"},
    {"id": 12, "num": "DOCE", "title": "¿Cuál es el siguiente paso?", "part": "¿Ha sido usted llamada?", "subtitle": "Discernimiento y admisión"},
]

NUMS = [m["num"] for m in STUDY_META]
NUM_WORD = {
    "UNO": "uno", "DOS": "dos", "TRES": "tres", "CUATRO": "cuatro", "CINCO": "cinco",
    "SEIS": "seis", "SIETE": "siete", "OCHO": "ocho", "NUEVE": "nueve", "DIEZ": "diez",
    "ONCE": "once", "DOCE": "doce",
}


def clean(text: str) -> str:
    text = re.sub(r"===== PAGE \d+ =====", "", text)
    text = re.sub(r"^\s*\d+\s*$", "", text, flags=re.M)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def split_paragraphs(text: str) -> list[str]:
    paras = [p.strip() for p in re.split(r"\n\s*\n+", text) if p.strip()]
    filtered = []
    for p in paras:
        if len(p) < 25:
            continue
        if re.match(r"^(ESTUDIO|PREGUNTAS|SEGUNDA PARTE|TERCERA PARTE|CUARTA PARTE|QUINTA PARTE|SEXTA PARTE)\b", p, re.I):
            continue
        if re.match(r"^PRIMERA PARTE", p, re.I):
            continue
        filtered.append(p)
    return filtered


def extract_questions(block: str) -> list[dict]:
    block = re.sub(r"\(Por favor prepárese.*?\)", "", block, flags=re.I)
    questions = []
    parts = re.split(r"\n\s*(\d+)\.\s+", block)
    # parts[0] is intro text; then pairs of (num, text)
    if len(parts) > 1:
        intro = parts[0].strip()
        i = 1
        while i < len(parts) - 1:
            qid = int(parts[i])
            qtext = parts[i + 1].strip()
            qtext = re.split(r"\n\s*\d+\.\s+", qtext)[0]
            qtext = re.sub(r"\s+", " ", qtext).strip()
            if qtext and len(qtext) > 5:
                questions.append({"id": qid, "text": qtext, "type": "open"})
            i += 2

    deep = re.search(r"LLEGANDO MÁS PROFUNDO\s*(.+)", block, re.I | re.S)
    if deep:
        questions.append({
            "id": len(questions) + 1,
            "text": "LLEGANDO MÁS PROFUNDO: " + re.sub(r"\s+", " ", deep.group(1).strip())[:500],
            "type": "reflection",
        })

    return questions


def make_summary(paragraphs: list[str], max_len: int = 520) -> str:
    if not paragraphs:
        return ""
    combined = " ".join(paragraphs[:4])
    combined = re.sub(r"\s+", " ", combined)
    if len(combined) <= max_len:
        return combined
    return combined[:max_len].rsplit(" ", 1)[0] + "…"


def split_studies_body(raw: str) -> dict[str, str]:
    """Split main guide body starting at first real ESTUDIO UNO on page 12."""
    start = raw.find("===== PAGE 12 =====")
    if start < 0:
        start = 0
    body = raw[start:]

    chunks = {}
    markers = []
    for num in NUMS:
        w = NUM_WORD.get(num, num.lower())
        patterns = [
            (rf"\nESTUDIO {num}\s", "content"),
            (rf"\nPREGUNTAS PARA EL ESTUDIO {num}\s", "questions"),
            (rf"\nPreguntas para el estudio {w}\s", "questions"),
            (rf"\npreguntas para el estudio {w}\s", "questions"),
        ]
        for pat, kind in patterns:
            m = re.search(pat, body, re.I)
            if m:
                markers.append((m.start(), kind, num))

    markers.sort(key=lambda x: x[0])
    for i, (pos, kind, num) in enumerate(markers):
        end = markers[i + 1][0] if i + 1 < len(markers) else len(body)
        chunk = body[pos:end]
        chunks.setdefault(num, {})
        if kind == "content" and "content" not in chunks[num]:
            chunks[num]["content"] = chunk
        elif kind == "questions":
            chunks[num]["questions"] = chunk

    # Estudio 2: contenido bajo "SEGUNDA PARTE / ¿Qué es una Orden?" sin encabezado ESTUDIO DOS
    if "DOS" in chunks and not chunks["DOS"].get("content"):
        m = re.search(r"SEGUNDA PARTE\s*\n¿Qué es una Orden\?(.*?)(?=PREGUNTAS PARA EL ESTUDIO DOS)", body, re.I | re.S)
        if m:
            chunks["DOS"]["content"] = "¿Qué es una Orden?\n" + m.group(1)

    return chunks


def main():
    raw = TEXT.read_text(encoding="utf-8")
    chunks = split_studies_body(raw)
    studies_out = []

    for meta in STUDY_META:
        num = meta["num"]
        data = chunks.get(num, {})
        content_raw = clean(data.get("content", ""))
        content_raw = re.sub(rf"^ESTUDIO {num}\s*", "", content_raw, flags=re.I)
        content_raw = re.sub(rf"^{re.escape(meta['title'])}\s*", "", content_raw, flags=re.I)
        # Cortar antes de bloque de preguntas si quedó mezclado
        content_raw = re.split(
            rf"(?:Preguntas para el estudio|PREGUNTAS PARA EL ESTUDIO)\s+{NUM_WORD.get(num, num.lower())}",
            content_raw,
            maxsplit=1,
            flags=re.I,
        )[0].strip()

        paragraphs = split_paragraphs(content_raw)
        # Filtrar párrafos que son preguntas numeradas
        paragraphs = [
            p for p in paragraphs
            if not re.match(r"^\d+\.\s+¿", p) and not re.match(r"^Ahora tome tiempo para reflexionar", p, re.I)
        ]

        q_block = clean(data.get("questions", ""))
        q_block = re.sub(
            rf"^(?:PREGUNTAS PARA EL ESTUDIO|Preguntas para el estudio)\s+{num}\s*",
            "",
            q_block,
            flags=re.I,
        )
        q_block = re.sub(rf"^{NUM_WORD.get(num, num.lower())}\s*", "", q_block, flags=re.I)
        # Cortar enriquecimiento o siguiente estudio
        q_block = re.split(r"(?:PARA SU ENRIQUECIMIENTO|ESTUDIO \w+|SEGUNDA PARTE|TERCERA PARTE)", q_block, maxsplit=1, flags=re.I)[0]
        questions = extract_questions(q_block)

        studies_out.append({
            **meta,
            "summary": make_summary(paragraphs),
            "content": paragraphs,
            "questions": questions,
        })

    intro = {
        "title": "Guía de Estudio Nacional",
        "subtitle": "Preparación para la admisión en La Orden de las Hijas del Rey®",
        "edition": "2020",
        "description": "Doce sesiones de reflexión, oración y estudio para conocer la filosofía, historia y compromiso de La Orden. Se recomienda un período de doce semanas de preparación.",
        "purposes": [
            "Servir como preparación oficial para las miembros prospectivas",
            "Establecer una comprensión de La Orden",
            "Introducir la Regla de Vida de La Orden",
            "Servir como revisión para las miembros actuales",
            "Ser una fuente de información",
        ],
        "motto": "MAGNANIMITER CRUCEM SUSTINE",
        "mottoTranslation": "Con noble espíritu, sostén la cruz",
        "initials": "FHS — For His Sake (Por su amor)",
        "scripture": "Tu palabra es una lámpara para mis pies y una luz para mi camino. — Salmo 119:105",
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps({"intro": intro, "studies": studies_out}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {len(studies_out)} studies to {OUT}")
    for s in studies_out:
        print(f"  {s['id']}: {len(s['content'])} paras, {len(s['questions'])} questions")


if __name__ == "__main__":
    main()
