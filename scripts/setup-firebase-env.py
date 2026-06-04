"""
Lee el JSON de cuenta de servicio de Firebase y muestra variables para .env.local o Vercel.

Uso:
  python scripts/setup-firebase-env.py ruta/al/archivo.json
"""
import base64
import json
import sys
from pathlib import Path


def main():
    if len(sys.argv) < 2:
        print("Uso: python scripts/setup-firebase-env.py RUTA_AL_ARCHIVO.json")
        print("\nDescargue la clave en:")
        print("Firebase Console → Configuración → Cuentas de servicio → Generar nueva clave privada")
        sys.exit(1)

    path = Path(sys.argv[1])
    if not path.exists():
        print(f"No existe el archivo: {path}")
        sys.exit(1)

    data = json.loads(path.read_text(encoding="utf-8"))
    email = data["client_email"]
    key = data["private_key"]
    project = data.get("project_id", "hijasdelreyapp-d99b1")
    one_line = json.dumps(data, ensure_ascii=False)
    b64 = base64.b64encode(one_line.encode("utf-8")).decode("ascii")

    print("=" * 60)
    print("OPCIÓN A — Recomendada para Vercel (3 variables separadas)")
    print("=" * 60)
    print(f"\nFIREBASE_CLIENT_EMAIL={email}\n")
    print("FIREBASE_PRIVATE_KEY=")
    print(key)
    print("\n(Copie FIREBASE_PRIVATE_KEY incluyendo -----BEGIN PRIVATE KEY----- ...)\n")

    print("=" * 60)
    print("OPCIÓN B — Una sola variable (JSON en una línea)")
    print("=" * 60)
    print("\nFIREBASE_SERVICE_ACCOUNT_JSON=")
    print(one_line[:120] + "... [archivo completo en una línea]")
    print(f"\n(Longitud total: {len(one_line)} caracteres)\n")

    print("=" * 60)
    print("OPCIÓN C — Base64 (fácil de pegar en Vercel)")
    print("=" * 60)
    print("\nFIREBASE_SERVICE_ACCOUNT_BASE64=")
    print(b64[:80] + "...")
    print(f"\n(Longitud total: {len(b64)} caracteres)")
    print("\nGuarde la línea completa en un archivo si es muy larga.\n")

    out = Path(__file__).resolve().parents[1] / "firebase-env-snippet.txt"
    out.write_text(
        f"FIREBASE_CLIENT_EMAIL={email}\n\n"
        f"FIREBASE_PRIVATE_KEY={key}\n\n"
        f"FIREBASE_SERVICE_ACCOUNT_BASE64={b64}\n",
        encoding="utf-8",
    )
    print(f"Snippet guardado en: {out}")
    print("(No suba este archivo a GitHub — está en .gitignore)")


if __name__ == "__main__":
    main()
