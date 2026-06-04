"""Aplica credenciales del JSON de cuenta de servicio a .env.local."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JSON_NAME = "hijasdelreyapp-d99b1-firebase-adminsdk-fbsvc-d6f45da48a.json"


def main():
    json_path = ROOT / (sys.argv[1] if len(sys.argv) > 1 else JSON_NAME)
    if not json_path.exists():
        print(f"No encontrado: {json_path}")
        sys.exit(1)

    data = json.loads(json_path.read_text(encoding="utf-8"))
    env_path = ROOT / ".env.local"
    lines = env_path.read_text(encoding="utf-8").splitlines() if env_path.exists() else []
    keep = [
        l
        for l in lines
        if not l.startswith("FIREBASE_CLIENT_EMAIL")
        and not l.startswith("FIREBASE_PRIVATE_KEY")
        and not l.startswith("FIREBASE_SERVICE_ACCOUNT")
        and not l.startswith("FIREBASE_SERVICE_ACCOUNT_BASE64")
    ]
    while keep and not keep[-1].strip():
        keep.pop()
    email = data["client_email"]
    key = data["private_key"].replace("\n", "\\n")
    keep.extend(["", "# Firebase Admin", f"FIREBASE_CLIENT_EMAIL={email}", f'FIREBASE_PRIVATE_KEY="{key}"'])
    env_path.write_text("\n".join(keep) + "\n", encoding="utf-8")
    print("OK: .env.local actualizado.")


if __name__ == "__main__":
    main()
