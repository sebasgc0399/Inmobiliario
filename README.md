# Pagina Web Inmobiliaria

Plataforma inmobiliaria orientada a SEO y conversion para Colombia, construida con Next.js App Router y Firebase.

Estado actual del proyecto:
- Listado publico de propiedades con filtros por query params.
- Render server-first para Home y consulta de datos con Admin SDK.
- Autenticacion de admin con Firebase Auth + cookie de sesion `__session`.
- Proteccion de rutas `/admin/*` via proxy.
- CI en GitHub Actions con jobs de lint y build.

## 1. Features principales (estado real)

- Home SEO-first con Server Components y render dinamico.
  Evidencia: `src/app/page.tsx`, `src/components/ListadoPropiedadesAsync.tsx`.
- Filtros por URL: `negocio`, `tipo`, `ciudad`, `moneda`, `precioMin`, `precioMax`.
  Evidencia: `src/components/FiltrosBusqueda.tsx`, `src/app/page.tsx`.
- Lectura de propiedades publicas desde Firestore (`propiedades`) usando converter tipado.
  Evidencia: `src/lib/propiedades/obtenerPropiedadesPublicas.ts`, `src/lib/firebase/propiedadConverter.ts`.
- Soporte de visualizacion multi-moneda (COP, USD, EUR).
  Evidencia: `src/lib/currency.ts`, `src/components/CardPropiedad.tsx`.
- Carga visual con skeleton y loading route-level.
  Evidencia: `src/components/SkeletonListado.tsx`, `src/app/loading.tsx`.
- Imagenes optimizadas con `next/image` y dominios permitidos en config.
  Evidencia: `src/components/CardPropiedad.tsx`, `src/components/HeroBanner.tsx`, `next.config.ts`.
- Seguridad de reglas e indices de Firebase versionada en repo.
  Evidencia: `firestore.rules`, `storage.rules`, `firestore.indexes.json`, `firebase.json`.
- Login admin, cierre de sesion y restablecimiento de contrasena.
  Evidencia: `src/app/admin/(publico)/login/page.tsx`, `src/app/api/auth/session/route.ts`, `src/app/api/auth/logout/route.ts`, `src/app/admin/(publico)/restablecer-contrasena/page.tsx`.

## 2. Stack tecnologico

Versiones segun `package.json`:

- Next.js: `16.1.6`
- React: `19.2.3`
- React DOM: `19.2.3`
- Firebase Web SDK: `^12.9.0`
- Firebase Admin SDK: `^13.6.1`
- React Hook Form: `^7.71.2`
- TypeScript: `^5`
- Tailwind CSS: `^4`
- Firebase CLI (`firebase-tools`): `^15.7.0`
- Package manager: `npm` (`package-lock.json` presente)

## 3. Arquitectura y patrones

### 3.1 Server Components vs Client Components

- Server Components por defecto para render y datos:
  - `src/app/page.tsx`
  - `src/components/ListadoPropiedadesAsync.tsx`
  - `src/lib/propiedades/obtenerPropiedadesPublicas.ts`
- Client Components para interactividad:
  - `src/components/FiltrosBusqueda.tsx`
  - `src/components/Navbar.tsx`
  - `src/components/SelectPersonalizado.tsx`
  - `src/app/admin/(publico)/login/page.tsx`
  - `src/app/admin/(publico)/restablecer-contrasena/page.tsx`

### 3.2 Modelo de datos canonico

Fuente de verdad del dominio:
- `src/types/propiedad.ts`

Tipos auxiliares y export:
- `src/types/filtros.ts`
- `src/types/index.ts`

### 3.3 Serializacion Firebase

Conversion `Timestamp <-> Date` centralizada en:
- `src/lib/firebase/propiedadConverter.ts`

### 3.4 Auth admin y seguridad de rutas

- Proxy protege `matcher: ['/admin/:path*']`.
  Evidencia: `src/proxy.ts`.
- Rutas publicas admin permitidas sin cookie:
  - `/admin/login`
  - `/admin/restablecer-contrasena`
- Sesion admin por cookie `__session` creada en API.
  Evidencia: `src/app/api/auth/session/route.ts`.
- Layout privado valida cookie y claim `admin` antes de renderizar.
  Evidencia: `src/app/admin/(privado)/layout.tsx`.

## 4. Rutas disponibles

Mapeo de rutas fisicas con route groups (no visibles en URL):

- `src/app/page.tsx` -> `/`
- `src/app/nosotros/page.tsx` -> `/nosotros`
- `src/app/contacto/page.tsx` -> `/contacto`
- `src/app/admin/(publico)/login/page.tsx` -> `/admin/login`
- `src/app/admin/(publico)/restablecer-contrasena/page.tsx` -> `/admin/restablecer-contrasena`
- `src/app/admin/(privado)/page.tsx` -> `/admin`
- `src/app/api/auth/session/route.ts` -> `POST /api/auth/session`
- `src/app/api/auth/logout/route.ts` -> `POST /api/auth/logout`

Ruta enlazada desde UI pero aun no implementada en `src/app`:
- `/propiedades/[slug]` (enlace desde `src/components/CardPropiedad.tsx`).

## 5. Estructura del proyecto

```text
.
|- .github/
|  |- workflows/
|     |- ci.yml
|- scripts/
|  |- asignar-claim-admin.mjs
|- src/
|  |- app/
|  |  |- admin/
|  |  |  |- (privado)/
|  |  |  |- (publico)/
|  |  |- api/auth/
|  |  |- contacto/
|  |  |- nosotros/
|  |  |- layout.tsx
|  |  |- loading.tsx
|  |  |- page.tsx
|  |- components/
|  |- lib/
|  |  |- firebase/
|  |  |- propiedades/
|  |- types/
|  |- proxy.ts
|- .env.example
|- .firebaserc
|- firebase.json
|- firestore.indexes.json
|- firestore.rules
|- next.config.ts
|- package.json
|- storage.rules
|- vercel.json
```

## 6. Requisitos

- Node.js 20 recomendado (validado en CI con `actions/setup-node@v4` y `node-version: "20"`).
- npm.
- Proyecto Firebase con Auth, Firestore y Storage configurados.
- Firebase CLI autenticado para despliegue de reglas/indices.

Nota: aun no hay `engines` en `package.json` ni `.nvmrc`.

## 7. Setup local

1. Clonar el repositorio.

```bash
git clone <URL_DEL_REPOSITORIO>
cd inmobiliario
```

2. Instalar dependencias.

```bash
npm install
```

3. Crear variables locales.

```bash
cp .env.example .env.local
```

4. Levantar desarrollo.

```bash
npm run dev
```

5. Abrir `http://localhost:3000`.

Nota operativa:
- `scripts/asignar-claim-admin.mjs` usa variables del entorno de shell y no carga `.env` automaticamente.

## 8. Variables de entorno

| Variable | Tipo | Uso | Donde se usa |
|---|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Publica | Config cliente Firebase | `src/lib/firebase/client.ts` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Publica | Auth domain del proyecto | `src/lib/firebase/client.ts` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Publica | Project ID cliente | `src/lib/firebase/client.ts` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Publica | Bucket cliente | `src/lib/firebase/client.ts` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Publica | Sender ID | `src/lib/firebase/client.ts` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Publica | App ID web | `src/lib/firebase/client.ts` |
| `FIREBASE_PROJECT_ID` | Privada | Credenciales Admin SDK | `src/lib/firebase/admin.ts`, `scripts/asignar-claim-admin.mjs` |
| `FIREBASE_CLIENT_EMAIL` | Privada | Credenciales Admin SDK | `src/lib/firebase/admin.ts`, `scripts/asignar-claim-admin.mjs` |
| `FIREBASE_PRIVATE_KEY` | Privada | Llave privada Admin SDK | `src/lib/firebase/admin.ts`, `scripts/asignar-claim-admin.mjs` |
| `FIREBASE_STORAGE_BUCKET` | Privada | Bucket Admin SDK | `src/lib/firebase/admin.ts` |
| `FUENTE_DATOS_PROPIEDADES_PUBLICAS` | Servidor | Fuente de datos para Home publica (`firestore` o `mock`) | `src/lib/propiedades/obtenerPropiedadesPublicas.ts` |
| `CI_NEXT_PUBLIC_ENV` | CI secret | Contenido para generar `.env.local` en pipeline CI | `.github/workflows/ci.yml` |

Plantilla base: `.env.example`.

Importante:
- `CI_NEXT_PUBLIC_ENV` es un secreto de CI para build, no una variable runtime obligatoria del server en produccion.
- `FUENTE_DATOS_PROPIEDADES_PUBLICAS` usa `firestore` por defecto. Para pruebas locales del listado publico puedes usar `FUENTE_DATOS_PROPIEDADES_PUBLICAS=mock`.

## 9. Firebase

### 9.1 Productos usados

- Auth:
  - Cliente inicializado en `src/lib/firebase/client.ts`.
  - Flujos admin en `src/app/admin/(publico)/login/page.tsx`.
  - Session cookie admin en `src/app/api/auth/session/route.ts`.
- Firestore:
  - Lectura de listados en `src/lib/propiedades/obtenerPropiedadesPublicas.ts`.
- Storage:
  - Cliente/Admin en `src/lib/firebase/client.ts` y `src/lib/firebase/admin.ts`.

### 9.2 Colecciones y convenciones

- Coleccion confirmada en codigo: `propiedades`.
- Convencion de Storage segun reglas: `propiedades/{propiedadId}/{archivo=**}`.

### 9.3 Reglas, indices y config

- Reglas Firestore: `firestore.rules`
- Reglas Storage: `storage.rules`
- Indices Firestore: `firestore.indexes.json`
- Config Firebase CLI: `firebase.json`
- Proyecto por defecto versionado: `.firebaserc` (sin exponer ID en este README)

## 10. APIs de autenticacion admin

### 10.1 `POST /api/auth/session`

Archivo: `src/app/api/auth/session/route.ts`

- Request JSON:

```json
{ "idToken": "<firebase-id-token>" }
```

- Comportamiento:
  - Valida body.
  - Verifica `idToken` y claim `admin`.
  - Crea cookie `__session` (`httpOnly`, `sameSite=lax`, `path=/`).

- Estados documentados en codigo:
  - `200`: sesion creada (`{ ok: true }`)
  - `400`: body invalido o `idToken` ausente
  - `401`: token invalido/revocado o error auth al crear sesion
  - `403`: usuario sin claim admin
  - `500`: error interno no tipificado de auth

### 10.2 `POST /api/auth/logout`

Archivo: `src/app/api/auth/logout/route.ts`

- Comportamiento:
  - Responde `{ ok: true }`.
  - Invalida cookie `__session` con `maxAge: 0`.

## 11. Scripts disponibles

Scripts exactos en `package.json`:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run firebase:deploy:rules`
- `npm run firebase:deploy:indexes`
- `npm run firebase:deploy:seguridad`
- `npm run auth:set-admin -- <UID>`

## 12. Deploy y CI/CD

Estado real del repositorio:

- Existe `vercel.json` con framework `nextjs`.
- Existe `.firebaserc` con proyecto por defecto para Firebase CLI.
- Existe `.github/workflows/ci.yml`.

Flujo disponible hoy:

1. App Next.js: despliegue compatible con Vercel (config minima presente en `vercel.json`).
2. Seguridad Firebase (reglas + indices):

```bash
npm run firebase:deploy:seguridad
```

3. CI de GitHub Actions (`.github/workflows/ci.yml`):
- Trigger: `push` y `pull_request`.
- Job `lint`: `npm ci` + `npm run lint`.
- Job `build`: depende de `lint`, usa Node 20, crea `.env.local` desde `secrets.CI_NEXT_PUBLIC_ENV`, y ejecuta `npm run build`.

## 13. Convenciones del repo

Basado en `AGENTS.md`:

- Dominio de negocio en espanol para tipos/componentes (`Propiedad`, `CardPropiedad`, etc.).
- Server Components por defecto; Client Components solo para interactividad.
- TypeScript estricto y evitar `any`.
- Seguridad Firebase por reglas y validacion de entrada.
- Uso de `<Image />` de Next.js para optimizacion de imagenes.

Estado actual de formularios:
- React Hook Form ya se usa en:
  - `src/app/admin/(publico)/login/page.tsx`
  - `src/app/admin/(publico)/restablecer-contrasena/page.tsx`
- `src/components/FiltrosBusqueda.tsx` aun usa `useState` para manejo de filtros.

## 14. Roadmap tecnico pendiente (solo gaps reales)

- Implementar ruta de detalle publica `/propiedades/[slug]` enlazada desde `CardPropiedad`.
- Implementar formulario real en `/contacto` (hoy es placeholder visual).
- Agregar script `test` en `package.json` y pruebas de integracion para flujos criticos.
- Fijar version de Node en `package.json` (`engines`) o agregar `.nvmrc`.
- Revisar si filtros de Home deben migrar a React Hook Form segun convencion global.

## 15. Troubleshooting

### 15.1 `FIREBASE_PRIVATE_KEY` y saltos de linea

El proyecto espera `FIREBASE_PRIVATE_KEY` con `\\n` escapados y lo transforma internamente con `replace(/\\n/g, '\n')` en:
- `src/lib/firebase/admin.ts`
- `scripts/asignar-claim-admin.mjs`

Si hay error de parseo:
- Verifica delimitadores `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`.
- Verifica que la variable no perdio comillas ni caracteres.

### 15.2 Error de `next/image` por dominio remoto

Si una imagen remota falla, revisar `images.remotePatterns` en `next.config.ts`.
Dominios actualmente permitidos:
- `images.unsplash.com`
- `firebasestorage.googleapis.com`
- `storage.googleapis.com`

### 15.3 Errores por variables faltantes

- Cliente Firebase falla si falta alguna `NEXT_PUBLIC_FIREBASE_*` requerida en `src/lib/firebase/client.ts`.
- Admin SDK falla si faltan `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_STORAGE_BUCKET` en `src/lib/firebase/admin.ts`.

## 16. Checklist de validacion documental

1. No hay afirmaciones de inexistencia para `.firebaserc`, `vercel.json` o `.github/workflows/ci.yml`.
2. Toda ruta documentada existe en `src/app` o `src/app/api`.
3. Todo archivo referenciado existe en el repo.
4. Versiones y scripts coinciden con `package.json`.
5. Seccion Deploy refleja Firebase + Vercel + CI actuales.
6. Seccion Roadmap solo lista pendientes no implementados.
