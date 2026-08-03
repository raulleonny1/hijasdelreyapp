"""Extract Anglicanismo.docx as a full reading document (no questions)."""
from __future__ import annotations

import json
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "anglicanismo" / "anglicanismo.docx"
OUT_DIR = ROOT / "src" / "data" / "courses"
MEDIA_OUT = ROOT / "public" / "courses" / "anglicanismo"
CATALOG = ROOT / "src" / "data" / "course-catalog.json"

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"


def local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def paragraph_text(p: ET.Element) -> str:
    parts: list[str] = []
    for node in p.iter():
        tag = local(node.tag)
        if tag == "t" and node.text:
            parts.append(node.text)
        elif tag == "tab":
            parts.append("\t")
        elif tag == "br":
            parts.append("\n")
    text = "".join(parts).replace("\xa0", " ")
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n[ \t]+", "\n", text)
    return text.strip()


def heading_level(p: ET.Element, text: str) -> int | None:
    """Return 1..3 if heading, else None. Prefer Word outline levels."""
    ppr = p.find(f"{W}pPr")
    if ppr is not None:
        style = ppr.find(f"{W}pStyle")
        if style is not None:
            val = (style.get(f"{W}val") or "").lower()
            if "heading1" in val or val in {"1", "title", "título", "titulo"}:
                return 1
            if "heading2" in val or val == "2":
                return 2
            if "heading3" in val or val == "3":
                return 3
            if val.startswith("heading"):
                return 2
        outline = ppr.find(f"{W}outlineLvl")
        if outline is not None:
            try:
                lvl = int(outline.get(f"{W}val") or "0")
            except ValueError:
                lvl = 0
            if lvl <= 0:
                return 1
            if lvl == 1:
                return 2
            return 3
    if text and len(text) < 80 and text == text.upper() and any(c.isalpha() for c in text):
        return 1
    return None


def find_blips(el: ET.Element) -> list[str]:
    ids: list[str] = []
    for blip in el.iter(f"{A}blip"):
        rid = blip.get(f"{R}embed") or blip.get(f"{R}link")
        if rid:
            ids.append(rid)
    if not ids:
        for node in el.iter():
            rid = node.get(f"{R}embed")
            if rid:
                ids.append(rid)
    return ids


def load_rels(zf: zipfile.ZipFile) -> dict[str, str]:
    root = ET.fromstring(zf.read("word/_rels/document.xml.rels"))
    mapping: dict[str, str] = {}
    for rel in root:
        rid = rel.get("Id")
        target = rel.get("Target")
        if rid and target:
            mapping[rid] = target.replace("\\", "/")
    return mapping


def extract_blocks() -> tuple[list[dict], list[str]]:
    MEDIA_OUT.mkdir(parents=True, exist_ok=True)
    copied: list[str] = []
    blocks: list[dict] = []

    with zipfile.ZipFile(DOCX, "r") as zf:
        rels = load_rels(zf)
        for name in zf.namelist():
            if name.startswith("word/media/"):
                fname = Path(name).name
                (MEDIA_OUT / fname).write_bytes(zf.read(name))
                copied.append(fname)

        body = ET.fromstring(zf.read("word/document.xml")).find(f"{W}body")
        assert body is not None

        for child in list(body):
            tag = local(child.tag)
            if tag == "p":
                text = paragraph_text(child)
                rids = find_blips(child)
                if text:
                    level = heading_level(child, text)
                    if level is not None:
                        blocks.append({"type": "heading", "level": level, "text": text})
                    else:
                        blocks.append({"type": "paragraph", "text": text})
                for rid in rids:
                    fname = Path(rels.get(rid, "")).name
                    if fname:
                        blocks.append(
                            {
                                "type": "image",
                                "src": f"/courses/anglicanismo/{fname}",
                                "alt": "Ilustración del documento Anglicanismo",
                            }
                        )
            elif tag == "tbl":
                rows: list[str] = []
                for tr in child.findall(f"{W}tr"):
                    cells: list[str] = []
                    for tc in tr.findall(f"{W}tc"):
                        cell_parts = [
                            paragraph_text(p)
                            for p in tc.findall(f"{W}p")
                            if paragraph_text(p)
                        ]
                        if cell_parts:
                            cells.append(" | ".join(cell_parts))
                    if cells:
                        rows.append(" — ".join(cells))
                if rows:
                    blocks.append({"type": "paragraph", "text": "\n".join(rows)})
                for rid in find_blips(child):
                    fname = Path(rels.get(rid, "")).name
                    if fname:
                        blocks.append(
                            {
                                "type": "image",
                                "src": f"/courses/anglicanismo/{fname}",
                                "alt": "Ilustración del documento Anglicanismo",
                            }
                        )

    return blocks, copied


def blocks_to_content(blocks: list[dict]) -> list[dict | str]:
    out: list[dict | str] = []
    for b in blocks:
        if b["type"] == "image":
            out.append({"type": "image", "src": b["src"], "alt": b.get("alt", "Imagen")})
        elif b["type"] == "heading":
            out.append({"type": "heading", "level": b.get("level", 2), "text": b["text"]})
        else:
            out.append(b["text"])
    return out


def update_catalog() -> None:
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    courses = data["courses"]
    item = {
        "slug": "anglicanismo",
        "title": "Anglicanismo",
        "subtitle": "Identidad, historia y fe de la Comunión Anglicana",
        "author": "Material de formación",
        "description": "Documento completo de lectura sobre el Anglicanismo, con todo el texto e imágenes del material original.",
        "category": "Biblioteca de formación",
        "lessonCount": 1,
        "available": True,
        "format": "reading",
    }
    existing = next((i for i, c in enumerate(courses) if c["slug"] == "anglicanismo"), None)
    if existing is not None:
        courses[existing] = item
    else:
        insert_at = next(
            (i for i, c in enumerate(courses) if c["slug"] == "matrimonio-iere"),
            len(courses),
        )
        courses.insert(insert_at, item)
    CATALOG.write_text(json.dumps({"courses": courses}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    blocks, media = extract_blocks()
    content = blocks_to_content(blocks)
    text_n = sum(1 for b in blocks if b["type"] in {"paragraph", "heading"})
    img_n = sum(1 for b in blocks if b["type"] == "image")

    course = {
        "slug": "anglicanismo",
        "title": "Anglicanismo",
        "subtitle": "Identidad, historia y fe de la Comunión Anglicana",
        "author": "Material de formación",
        "description": "Documento completo de lectura sobre el Anglicanismo, con todo el texto e imágenes del material original.",
        "category": "Biblioteca de formación",
        "available": True,
        "format": "reading",
        "lessonCount": 1,
        "lessons": [
            {
                "id": 1,
                "title": "Anglicanismo",
                "part": "Biblioteca de formación",
                "subtitle": "Documento completo",
                "summary": "",
                "content": content,
                "questions": [],
            }
        ],
    }

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / "anglicanismo.json"
    out.write_text(json.dumps(course, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    update_catalog()
    print(f"Bloques: {len(blocks)} | texto: {text_n} | imágenes: {img_n} (archivos: {len(media)})")
    print(f"Curso lectura: {out}")


if __name__ == "__main__":
    main()
