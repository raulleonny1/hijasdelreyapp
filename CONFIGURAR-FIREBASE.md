# Configurar Firebase para registro y login

El error **"Firebase no está configurado en el servidor"** significa que falta la **cuenta de servicio** (Admin SDK), no solo las variables `NEXT_PUBLIC_*`.

## Paso 1 — Descargar la clave

1. Abra [Firebase Console](https://console.firebase.google.com/) → proyecto **hijasdelreyapp-d99b1**
2. ⚙️ **Configuración del proyecto** → pestaña **Cuentas de servicio**
3. **Generar nueva clave privada** → se descarga un archivo `.json`

## Paso 2 — Generar variables (en su PC)

En la carpeta del proyecto, con PowerShell:

```powershell
python scripts/setup-firebase-env.py "C:\Users\SU_USUARIO\Downloads\hijasdelreyapp-d99b1-xxxx.json"
```

Se crea `firebase-env-snippet.txt` con los valores listos para copiar.

## Paso 3 — Vercel (recomendado: variables separadas)

En [Vercel](https://vercel.com) → su proyecto → **Settings** → **Environment Variables**:

| Variable | Valor |
|----------|--------|
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-xxxxx@hijasdelreyapp-d99b1.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Todo el bloque `-----BEGIN PRIVATE KEY-----` … `-----END PRIVATE KEY-----` (con saltos de línea) |

También debe tener las otras variables (`NEXT_PUBLIC_FIREBASE_*`, `AUTH_SECRET`).

**Importante:** En Vercel, al pegar `FIREBASE_PRIVATE_KEY`, pegue la clave **completa** en varias líneas; Vercel la guarda bien.

Después: **Deployments** → **Redeploy** (obligatorio tras cambiar variables).

## Paso 3 alternativo — Local (`.env.local`)

Copie del snippet a `.env.local`:

```env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@hijasdelreyapp-d99b1.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----"
```

Reinicie: `npm run dev`

## Paso 4 — Firestore

En Firebase Console → **Firestore Database** → **Crear base de datos** (si aún no existe).

## Verificar

Tras redeploy, pruebe **Registrarse** de nuevo. Si falla, revise **Vercel → Logs** del deployment.
