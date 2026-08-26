# La Orden de las Hijas del Rey — Guía de Estudio

Aplicación web para la **Guía de Estudio Internacional** de La Orden de las Hijas del Rey® (edición 2022).

## Características

- 12 estudios con **resumen**, **lectura** y **preguntas** interactivas
- Registro e inicio de sesión con **PIN de 4 dígitos**
- Datos guardados en **Firebase Firestore** (usuarios y respuestas)
- Diseño en azul marino y dorado según la identidad de la Orden
- Instalable como PWA

## Requisitos

- Node.js 18+
- Proyecto Firebase: `hijasdelreyapp-d99b1`

## Configuración de Firebase

1. En [Firebase Console](https://console.firebase.google.com/), abra el proyecto **hijasdelreyapp-d99b1**.
2. **Firestore Database** → Crear base de datos (modo producción o prueba).
3. **Configuración del proyecto** → Cuentas de servicio → **Generar nueva clave privada**.
4. Copie el archivo JSON y péguelo en `.env.local` como una sola línea:

```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"hijasdelreyapp-d99b1",...}
```

5. Copie `.env.example` a `.env.local` y complete las variables `NEXT_PUBLIC_FIREBASE_*` (ya incluidas si usó la config de la app web).

6. Despliegue reglas de Firestore (opcional):

```bash
firebase deploy --only firestore:rules
```

## Colecciones en Firestore

| Colección | Contenido |
|-----------|-----------|
| `users` | nombre, apellido, fechaNacimiento, email, pinHash, createdAt |
| `answers` | userId, studyId, responses `{ "1": "texto..." }`, updatedAt |

## Inicio rápido

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Estructura

- `src/lib/firebase/` — configuración cliente y admin
- `src/lib/users-db.ts` — usuarios en Firestore
- `src/lib/answers-db.ts` — respuestas de estudios en Firestore
- `src/data/studies.json` — contenido de los 12 estudios

## Nota legal

El material pertenece a La Orden de las Hijas del Rey®. Uso destinado a miembros en preparación según la guía oficial.
