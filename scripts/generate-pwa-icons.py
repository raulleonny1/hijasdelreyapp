"""Generate square PWA icons from logo.jpeg on navy background."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "public" / "logo.jpeg"
OUT = ROOT / "public" / "icons"
NAVY = (0, 45, 98)  # #002d62
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
MASKABLE_SIZES = [192, 512]


def make_icon(size: int, padding_ratio: float) -> Image.Image:
    canvas = Image.new("RGB", (size, size), NAVY)
    logo = Image.open(LOGO).convert("RGBA")
    pad = int(size * padding_ratio)
    inner = size - pad * 2
    logo.thumbnail((inner, inner), Image.Resampling.LANCZOS)
    x = (size - logo.width) // 2
    y = (size - logo.height) // 2
    if logo.mode == "RGBA":
        canvas.paste(logo, (x, y), logo)
    else:
        canvas.paste(logo, (x, y))
    return canvas


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for s in SIZES:
        img = make_icon(s, 0.12)
        img.save(OUT / f"icon-{s}.png", optimize=True)
        print(f"icon-{s}.png")
    for s in MASKABLE_SIZES:
        img = make_icon(s, 0.22)
        img.save(OUT / f"icon-maskable-{s}.png", optimize=True)
        print(f"icon-maskable-{s}.png")
    make_icon(180, 0.12).save(ROOT / "public" / "apple-touch-icon.png", optimize=True)
    print("apple-touch-icon.png")
    make_icon(32, 0.1).save(ROOT / "public" / "favicon.png", optimize=True)
    print("favicon.png")


if __name__ == "__main__":
    main()
