"""Parse PDFs from 'Nueva carpeta' into structured course JSON files."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXTRACTED = ROOT / "_extracted_nueva"
OUT_DIR = ROOT / "src" / "data" / "courses"
CATALOG_PATH = ROOT / "src" / "data" / "course-catalog.json"


def clean(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r" +", " ", text)
    return text.strip()


def split_paragraphs(text: str, min_len: int = 80) -> list[str]:
    chunks = re.split(r"\n\s*\n+", text)
    out: list[str] = []
    for c in chunks:
        c = c.strip()
        if len(c) < min_len:
            continue
        if re.match(r"^\d+$", c):
            continue
        if re.match(r"^[A-ZÁÉÍÓÚÑ\s]{2,15}$", c) and len(c) < 20:
            continue
        out.append(c)
    return out


def make_summary(paragraphs: list[str], max_len: int = 520) -> str:
    if not paragraphs:
        return ""
    combined = clean(" ".join(paragraphs[:3]))
    if len(combined) <= max_len:
        return combined
    return combined[:max_len].rsplit(" ", 1)[0] + "…"


def generate_questions(title: str, part: str) -> list[dict]:
    base = [
        {"id": 1, "text": f"¿Cuál es la idea central de «{title}»?", "type": "open"},
        {"id": 2, "text": "¿Qué concepto o pasaje de esta lección le resultó más significativo? Explique por qué.", "type": "open"},
        {"id": 3, "text": "¿Cómo puede aplicar lo aprendido en su vida personal o en su servicio en la iglesia?", "type": "open"},
        {"id": 4, "text": "¿Qué preguntas le quedan después de esta lectura? ¿Qué le gustaría profundizar?", "type": "reflection"},
        {"id": 5, "text": f"Prepárese para compartir con su grupo: un aprendizaje clave de «{part}».", "type": "open"},
    ]
    return base


def build_lessons(sections: list[tuple[str, str, str, str]], raw: str, min_para: int = 80) -> list[dict]:
    lessons: list[dict] = []
    for i, (marker, title, part, subtitle) in enumerate(sections):
        start = raw.find(marker)
        if start < 0:
            continue
        end = len(raw)
        if i + 1 < len(sections):
            next_marker = sections[i + 1][0]
            npos = raw.find(next_marker, start + len(marker))
            if npos > start:
                end = npos
        body = raw[start:end]
        body = re.sub(re.escape(marker), "", body, count=1, flags=re.I).strip()
        body = re.sub(rf"^{re.escape(title)}\s*", "", body, flags=re.I).strip()
        paragraphs = split_paragraphs(body, min_len=min_para)
        if not paragraphs:
            continue
        lessons.append({
            "id": len(lessons) + 1,
            "title": title,
            "part": part,
            "subtitle": subtitle,
            "summary": make_summary(paragraphs),
            "content": paragraphs[:40],
            "questions": generate_questions(title, part),
        })
    return lessons


def read_txt(name: str) -> str:
    path = EXTRACTED / name
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def save_course(course: dict) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    slug = course["slug"]
    path = OUT_DIR / f"{slug}.json"
    path.write_text(json.dumps(course, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  -> {path.name}: {len(course['lessons'])} lecciones")


def parse_matrimonio() -> dict:
    raw = read_txt("Matrimonio en la Comunión anglicana, IERE.txt")
    sections = [
        ("1. Introducción", "Introducción", "Matrimonio anglicano en España", "Contexto de la IERE y la Comunión Anglicana"),
        ("2. El concepto de matrimonio", "El concepto de matrimonio", "Doctrina y sacramento", "Definición canónica y rito sacramental"),
        ("3. Requisitos para la validez", "Requisitos para la validez", "Marco legal y eclesiástico", "Requisitos civiles y de la Iglesia"),
        ("3.1 Requisitos civiles", "Requisitos civiles", "Validez del matrimonio", "Edad, vínculos anteriores y parentesco"),
        ("3.2 Requisitos eclesiásticos", "Requisitos eclesiásticos", "Preparación de los contrayentes", "Bautismo e instrucción"),
        ("3.3 La forma de celebración", "Forma de celebración anglicana", "Liturgia matrimonial", "Rito y solemnización"),
        ("3.4 El expediente matrimonial", "Expediente matrimonial", "Documentación", "Trámites previos a la boda"),
        ("3.5 Exigencias de la Comunión Anglicana", "Exigencias previas a la celebración", "Disciplina eclesiástica", "Publicación de banas y permisos"),
        ("3.6 Celebración y posterior inscripción", "Celebración e inscripción civil", "Después de la ceremonia", "Registro en el Estado"),
        ("4. Conclusiones", "Conclusiones", "Síntesis del estudio", "Reflexión final"),
    ]
    return {
        "slug": "matrimonio-iere",
        "title": "Matrimonio en la Comunión Anglicana",
        "subtitle": "Celebración religiosa anglicana en España (IERE)",
        "author": "Catalina Pons - Estel Tugores",
        "description": "Estudio sobre el matrimonio sacramental en la Iglesia Española Reformada Episcopal: doctrina, requisitos civiles y eclesiásticos, y celebración litúrgica.",
        "category": "Doctrina y vida sacramental",
        "estimatedWeeks": 5,
        "available": True,
        "lessons": build_lessons(sections, raw),
    }


def parse_idiomas_biblia() -> dict:
    raw = read_txt("Los idiomas en que fue escrita la Santa Biblia. Juan María Tellería Larrañaga.txt")
    sections = [
        ("INTRODUCCIÓN GENERAL", "Introducción", "Lenguas de la Biblia", "Por qué importan los idiomas originales"),
        ("LA LENGUA HEBREA", "La lengua hebrea", "Antiguo Testamento", "Origen, clasificación y escritura"),
        ("LA LENGUA ARAMEA", "La lengua aramea", "Textos bíblicos en arameo", "Uso en Daniel, Esdras y el NT"),
        ("LA LENGUA GRIEGA", "La lengua griega", "Nuevo Testamento", "Koiné y traducción de las Escrituras"),
    ]
    return {
        "slug": "idiomas-biblia",
        "title": "Los idiomas de la Santa Biblia",
        "subtitle": "Hebreo, arameo y griego en las Escrituras",
        "author": "Juan María Tellería Larrañaga",
        "description": "Introducción pedagógica a las lenguas en que fue escrita la Biblia, para enriquecer la lectura y el estudio de las Sagradas Escrituras.",
        "category": "Estudio bíblico",
        "estimatedWeeks": 4,
        "available": True,
        "lessons": build_lessons(sections, raw),
    }


def parse_calvino() -> dict:
    raw = read_txt("Meditaciones cristianas de Juan Calvino.txt")
    body_start = raw.find("LOS E DITORES")
    body = raw[body_start:] if body_start > 0 else raw
    sections = [
        ("CAPÍTULO 1: LA OBEDIENCIA HUMILDE", "La obediencia humilde", "Vida cristiana", "Imitación de Cristo y la Escritura como regla"),
        ("CAPITULO 2: AUTO NEGACIÓN", "Auto negación", "Vida cristiana", "No nos pertenecemos; somos del Señor"),
        ("CAPITULO 3: PACIENTES Y LLEVANDO LA CRUZ", "Pacientes y llevando la cruz", "Vida cristiana", "La cruz y el progreso espiritual"),
        ("CAPITULO 4: LA DESESPERANZA EN EL MUNDO VENIDERO", "La desesperanza en el mundo venidero", "Vida cristiana", "Esperanza más allá de este mundo"),
        ("CAPITULO 5: EL USO CORRECTO DE LA VIDA PRESENTE", "El uso correcto de la vida presente", "Vida cristiana", "Vivir con sobriedad y devoción"),
    ]
    return {
        "slug": "calvino-vida-cristiana",
        "title": "Meditaciones cristianas",
        "subtitle": "El Libro de Oro de la verdadera vida cristiana",
        "author": "Juan Calvino",
        "description": "Cinco capítulos devocionales de Calvino sobre obediencia, auto negación, la cruz y el uso cristiano de la vida presente.",
        "category": "Espiritualidad reformada",
        "estimatedWeeks": 5,
        "available": True,
        "lessons": build_lessons(sections, body, min_para=25),
    }


def parse_lewis() -> dict:
    raw = read_txt("Pastoral, consuelo el-problema-del-dolor CSLewis.txt")
    sections = [
        ("I. INTRODUCCIÓN", "Introducción", "El problema del dolor", "Fe, dolor y la pregunta del ateísmo"),
        ("II. LA OMNIPOTENCIA DIVINA", "La omnipotencia divina", "Teología del sufrimiento", "¿Qué puede y no puede hacer Dios?"),
        ("II. LA BONDAD DIVINA", "La bondad divina", "Amor de Dios", "Bondad, amor y el sufrimiento"),
        ("IV. LA MALDAD HUMANA", "La maldad humana", "Pecado y responsabilidad", "La condición humana caída"),
        ("V. LA CAÍDA DEL HOMBRE", "La caída del hombre", "Origen del mal", "Libertad y rebelión"),
        ("VI. EL DOLOR HUMANO", "El dolor humano (I)", "Sufrimiento personal", "Purificación y disciplina"),
        ("VII. EL DOLOR HUMANO", "El dolor humano (II)", "Compasión y comunidad", "Cómo Dios usa el dolor"),
        ("VIII. EL INFIERNO", "El infierno", "Juicio eterno", "Separación y justicia divina"),
        ("IX. EL DOLOR ANIMAL", "El dolor animal", "Creación y sufrimiento", "El dolor en el mundo no humano"),
        ("X. EL CIELO", "El cielo", "Esperanza eterna", "Gozo y restauración final"),
    ]
    return {
        "slug": "lewis-problema-dolor",
        "title": "El problema del dolor",
        "subtitle": "Una respuesta cristiana al sufrimiento",
        "author": "C. S. Lewis",
        "description": "Clásico de apologética cristiana que explora por qué existe el dolor si Dios es bueno y todopoderoso, y qué respuesta ofrece la fe.",
        "category": "Apologética y pastoral",
        "estimatedWeeks": 10,
        "available": True,
        "lessons": build_lessons(sections, raw),
    }


def parse_libros_biblia() -> dict:
    raw = read_txt("Los libros de la Biblia. José Manuel Díaz Yanes - Juan María Tellería Larrañaga.txt")
    sections = [
        ("ANTIGUO TESTAMENTO", "Introducción al Antiguo Testamento", "Panorama bíblico", "La Historia de la Salvación en Israel"),
        ("EL PENTATEUCO", "El Pentateuco", "Torá — La Ley", "Génesis a Deuteronomio"),
        ("LOS LIBROS HISTÓRICOS", "Los libros históricos", "Antiguo Testamento", "De Josué a Ester"),
        ("LITERATURA POÉTICO-SAPIENCIAL", "Literatura poético-sapiencial", "Sabiduría y poesía", "Job, Salmos, Proverbios y más"),
        ("LOS LIBROS PROFÉTICOS", "Los libros proféticos", "Profetas mayores y menores", "Oráculos de justicia y esperanza"),
        ("LOS LLAMADOS", "Los libros apócrifos", "Literatura intertestamentaria", "Deuterocanónicos y contexto"),
        ("NUEVO TESTAMENTO", "Introducción al Nuevo Testamento", "Panorama del NT", "Cumplimiento en Cristo"),
        ("EL APÓSTOL", "Los Evangelios y Hechos", "Evangelios sinópticos y Juan", "Vida, muerte y resurrección de Jesús"),
        ("LOS OTROS ESCRITOS DEL NUEVO TESTAMENTO", "Cartas y Apocalipsis", "Epístolas y revelación", "Doctrina y esperanza de la Iglesia"),
    ]
    lessons = build_lessons(sections, raw)
    for les in lessons:
        if len(les["content"]) > 35:
            les["content"] = les["content"][:35]
    return {
        "slug": "libros-biblia",
        "title": "Los libros de la Biblia",
        "subtitle": "Panorama del Antiguo y Nuevo Testamento",
        "author": "José Manuel Díaz Yanes – Juan María Tellería Larrañaga",
        "description": "Curso introductorio que recorre cada gran sección de la Biblia: su mensaje, contexto y lugar en la Historia de la Salvación.",
        "category": "Estudio bíblico",
        "estimatedWeeks": 9,
        "available": True,
        "lessons": lessons,
    }


def parse_pulpito() -> dict:
    raw = read_txt("Púlpito cristiano. Samuel Vila.txt")
    toc = re.findall(
        r"^([IVX]+)\.\s+(.+?)\s*…+",
        raw[:8000],
        re.M,
    )
    markers: list[tuple[str, str, str, str]] = []
    for roman, title in toc:
        title = clean(re.sub(r"\s+\d.*", "", title))
        if len(title) < 4:
            continue
        pat = f"SERM"
        # find sermon block
        m = re.search(rf"SERM[îiÌÍ]N\s+{roman}\s*\n\s*{re.escape(title.upper()[:15])}", raw, re.I)
        if not m:
            m = re.search(rf"SERM[îiÌÍ]N\s+{roman}", raw, re.I)
        marker = m.group(0).split("\n")[0] if m else f"{roman}. {title}"
        markers.append((marker, title, "Púlpito cristiano", f"Sermón {roman}"))
    if not markers:
        markers = [(f"{r}. {t}", t, "Púlpito cristiano", f"Sermón {r}") for r, t in toc[:15]]
    lessons = build_lessons(markers, raw)
    for les in lessons:
        if len(les["content"]) > 25:
            les["content"] = les["content"][:25]
    return {
        "slug": "pulpito-cristiano",
        "title": "Púlpito cristiano",
        "subtitle": "Sermones para la predicación y el estudio grupal",
        "author": "Samuel Vila",
        "description": "Colección de sermones evangélicos con estructura clara: ideal para reflexión personal, grupos pequeños o preparación homilética.",
        "category": "Homilética y predicación",
        "estimatedWeeks": len(lessons),
        "available": len(lessons) > 0,
        "lessons": lessons,
    }


def main():
    courses = [
        parse_matrimonio(),
        parse_idiomas_biblia(),
        parse_calvino(),
        parse_lewis(),
        parse_libros_biblia(),
        parse_pulpito(),
    ]
    catalog = []
    guia_item = {
        "slug": "guia-nacional",
        "title": "Guía de Estudio Nacional",
        "subtitle": "Preparación para La Orden de las Hijas del Rey®",
        "author": "La Orden de las Hijas del Rey",
        "description": "Doce estudios oficiales de preparación para la admisión en La Orden.",
        "category": "Formación en La Orden",
        "lessonCount": 12,
        "estimatedWeeks": 12,
        "available": True,
    }
    catalog.append(guia_item)
    for c in courses:
        c["lessonCount"] = len(c["lessons"])
        save_course(c)
        catalog.append({
            "slug": c["slug"],
            "title": c["title"],
            "subtitle": c["subtitle"],
            "author": c["author"],
            "description": c["description"],
            "category": c["category"],
            "lessonCount": c["lessonCount"],
            "estimatedWeeks": c.get("estimatedWeeks"),
            "available": c["available"] and c["lessonCount"] > 0,
        })
    catalog.append({
        "slug": "moltmann-dios-crucificado",
        "title": "El Dios crucificado",
        "subtitle": "La cruz de Cristo como fundamento y crítica de la teología cristiana",
        "author": "Jürgen Moltmann",
        "description": "Este libro está en formato escaneado sin texto extraíble. Se añadirá cuando dispongamos de una versión digital legible.",
        "category": "Teología sistemática",
        "lessonCount": 0,
        "available": False,
    })
    CATALOG_PATH.write_text(json.dumps({"courses": catalog}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Catálogo: {CATALOG_PATH} ({len(catalog)} cursos)")


if __name__ == "__main__":
    main()
