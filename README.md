# Pagina Web Inmobiliaria

Plataforma inmobiliaria orientada a SEO y conversion para Colombia, construida con Next.js App Router y Firebase.
El estado actual prioriza listado publico de propiedades con filtros, seguridad en reglas y base lista para panel admin.

## 1. Features principales

- SEO-first con Server Components y renderizado dinamico en Home.
  Evidencia: `src/app/page.tsx` (`runtime = 'nodejs'`, `dynamic = 'force-dynamic'`) y `src/components/ListadoPropiedadesAsync.tsx`.
- Busqueda y filtros por query params (`negocio`, `tipo`, `ciudad`, `moneda`, `precioMin`, `precioMax`).
  Evidencia: `src/components/FiltrosBusqueda.tsx` (usa `router.replace`) y `src/app/page.tsx` (`parseMoneda`, `parseModoNegocio`, `parseTipoPropiedad`).
- Lectura de datos reales desde Firestore para el listado publico.
  Evidencia: `src/lib/propiedades/obtenerPropiedadesPublicas.ts` (`collection('propiedades')`, `where(...)`, `orderBy(...)`).
- Multi-divisa (COP, USD, EUR) para visualizacion y filtros de precio.
  Evidencia: `src/lib/currency.ts` y `src/components/CardPropiedad.tsx`.
- Skeleton/loading para mejorar UX durante carga de resultados.
  Evidencia: `src/app/loading.tsx` y `src/components/SkeletonListado.tsx`.
- Optimizacion de imagenes con `next/image` y dominios remotos permitidos.
  Evidencia: `next.config.ts` (`remotePatterns`), `src/components/CardPropiedad.tsx`, `src/components/HeroBanner.tsx`.
- Seguridad de acceso a datos con reglas e indices versionados en repo.
  Evidencia: `firestore.rules`, `storage.rules`, `firestore.indexes.json`, `firebase.json`.

## 2. Stack tecnologico

- Next.js: `16.1.6` (ver `package.json`)
- React: `19.2.3` (ver `package.json`)
- React DOM: `19.2.3` (ver `package.json`)
- Firebase Web SDK: `^12.9.0` (ver `package.json`)
- Firebase Admin SDK: `^13.6.1` (ver `package.json`)
- TypeScript: `^5` (ver `package.json`)
- Tailwind CSS: `^4` (ver `package.json`)
- Firebase CLI (`firebase-tools`): `^15.7.0` (ver `package.json`)
- Package manager del repo: `npm` (evidencia: `package-lock.json`)

## 3. Arquitectura

### Server Components vs Client Components

- Server Components (por defecto en render y datos):
  - `src/app/page.tsx`
  - `src/components/ListadoPropiedadesAsync.tsx`
  - `src/lib/propiedades/obtenerPropiedadesPublicas.ts`
- Client Components (solo interactividad):
  - `src/components/FiltrosBusqueda.tsx`
  - `src/components/Navbar.tsx`
  - `src/components/SelectPersonalizado.tsx`

### Serializacion de datos Firebase

- Conversion `Timestamp <-> Date` centralizada en:
  - `src/lib/firebase/propiedadConverter.ts` (`toFirestore`, `fromFirestore`)

### Modelo de datos canonico

- Fuente de verdad del dominio inmobiliario:
  - `src/types/propiedad.ts`
- Tipos auxiliares de filtros server:
  - `src/types/filtros.ts`
- Export central de tipos:
  - `src/types/index.ts`

Resumen de entidades principales en `src/types/propiedad.ts`:
- Tipos de dominio: `TipoPropiedad`, `ModoNegocio`, `EstadoPublicacion`, `Moneda`, `CondicionInmueble`, `Estrato`.
- Subinterfaces: `Ubicacion`, `Precio`, `Caracteristicas`, `SEOMetadata`, `Agente`.
- Entidad principal: `Propiedad`.

## 4. Estructura del proyecto

```text
.
|- src/
|  |- app/
|  |  |- layout.tsx
|  |  |- loading.tsx
|  |  |- page.tsx
|  |- components/
|  |- lib/
|  |  |- firebase/
|  |  |- propiedades/
|  |- types/
|- scripts/
|  |- asignar-claim-admin.mjs
|- .env.example
|- firebase.json
|- firestore.rules
|- storage.rules
|- firestore.indexes.json
```

Nota: en `src/app` actualmente solo existe la ruta `/` (home), ademas de `layout` y `loading`.

## 5. Requisitos

- Node.js: TODO (no hay `engines` en `package.json` ni `.nvmrc`).
- npm.
- Proyecto Firebase configurado (Firestore + Storage + Auth).
- Firebase CLI autenticado para desplegar reglas/indices.

## 6. Setup local

1. Clona el repositorio.

```bash
git clone <URL_DEL_REPOSITORIO>
cd inmobiliario
```

TODO: definir URL oficial del repositorio en este README cuando se publique externamente.

2. Instala dependencias.

```bash
npm install
```

3. Crea variables locales.

```bash
cp .env.example .env.local
```

4. Ejecuta en desarrollo.

```bash
npm run dev
```

5. Abre `http://localhost:3000`.

Nota operativa: el script `auth:set-admin` usa variables del shell/entorno y no carga `.env` automaticamente (`scripts/asignar-claim-admin.mjs`).

## 7. Variables de entorno

| Variable | Tipo | Uso | Donde se usa |
|---|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Publica | Config cliente Firebase | `src/lib/firebase/client.ts` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Publica | Auth domain del proyecto | `src/lib/firebase/client.ts` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Publica | Project ID cliente | `src/lib/firebase/client.ts` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Publica | Bucket para SDK cliente | `src/lib/firebase/client.ts` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Publica | Sender ID de Firebase | `src/lib/firebase/client.ts` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Publica | App ID web de Firebase | `src/lib/firebase/client.ts` |
| `FIREBASE_PROJECT_ID` | Privada | Credencial Admin SDK | `src/lib/firebase/admin.ts`, `scripts/asignar-claim-admin.mjs` |
| `FIREBASE_CLIENT_EMAIL` | Privada | Credencial Admin SDK | `src/lib/firebase/admin.ts`, `scripts/asignar-claim-admin.mjs` |
| `FIREBASE_PRIVATE_KEY` | Privada | Llave privada para Admin SDK | `src/lib/firebase/admin.ts`, `scripts/asignar-claim-admin.mjs` |
| `FIREBASE_STORAGE_BUCKET` | Privada | Bucket en Admin SDK | `src/lib/firebase/admin.ts` |

Plantilla base: `.env.example`.

## 8. Firebase

### Productos usados

- Auth:
  - Inicializacion base cliente disponible en `src/lib/firebase/client.ts`.
  - Script de custom claims admin en `scripts/asignar-claim-admin.mjs`.
- Firestore:
  - Lectura de propiedades publicas en `src/lib/propiedades/obtenerPropiedadesPublicas.ts`.
- Storage:
  - Inicializacion en cliente y admin (`src/lib/firebase/client.ts`, `src/lib/firebase/admin.ts`).

### Colecciones y convenciones

- Coleccion confirmada en codigo: `propiedades` (`src/lib/propiedades/obtenerPropiedadesPublicas.ts`).
- Convencion de Storage (segun reglas): `propiedades/{propiedadId}/{archivo=**}` (`storage.rules`).
- TODO: documentar/implementar colecciones adicionales (ej. `leads`) cuando existan en codigo.

### Reglas e indices

- Reglas Firestore: `firestore.rules`
- Reglas Storage: `storage.rules`
- Indices Firestore: `firestore.indexes.json`
- Config Firebase CLI: `firebase.json`

## 9. Scripts disponibles

Scripts exactos de `package.json`:

- `npm run dev`: inicia entorno de desarrollo Next.js.
- `npm run build`: genera build de produccion.
- `npm run start`: levanta servidor sobre build de produccion.
- `npm run lint`: ejecuta ESLint.
- `npm run firebase:deploy:rules`: despliega reglas de Firestore y Storage.
- `npm run firebase:deploy:indexes`: despliega indices de Firestore.
- `npm run firebase:deploy:seguridad`: despliega reglas + indices.
- `npm run auth:set-admin -- <UID>`: asigna claim `admin=true` a un usuario Firebase Auth.

## 10. Deploy

Estado actual documentado por evidencia en repo:

- Config de Firebase para reglas/indices: `firebase.json`.
- Comandos de despliegue disponibles en scripts npm.
- No existe `.firebaserc` en el repo (proyecto no fijado en codigo).
- No existe `vercel.json` en el repo.
- No existe carpeta `.github/workflows` para CI/CD.

Flujo real disponible hoy:

1. Configurar variables de entorno en el entorno de despliegue.
2. Desplegar reglas e indices:

```bash
npm run firebase:deploy:seguridad
```

Vercel: recomendado para desplegar la app Next.js, pero no esta configurado de forma explicita en el repositorio.

TODO:
- definir proveedor oficial de deploy.
- definir pipeline CI/CD y versionarlo.

## 11. Troubleshooting

### FIREBASE_PRIVATE_KEY y saltos de linea

Problema: error de credenciales por formato incorrecto de llave privada.

Este proyecto espera `FIREBASE_PRIVATE_KEY` con saltos escapados (`\\n`) y luego los transforma internamente a saltos reales:

- `src/lib/firebase/admin.ts` usa `replace(/\\n/g, '\n')`.
- `scripts/asignar-claim-admin.mjs` usa `replace(/\\n/g, '\n')`.

Si ves errores de parseo de llave:
- revisa que la variable no haya perdido comillas ni caracteres.
- valida que incluya `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`.

### Error de `next/image` por dominio no permitido

Problema: imagen remota bloqueada por configuracion de Next.js.

Verifica `remotePatterns` en `next.config.ts`. Dominios permitidos actualmente:

- `images.unsplash.com`
- `firebasestorage.googleapis.com`
- `storage.googleapis.com`

Si usas otro dominio de imagen, debes agregarlo en `next.config.ts`.

## 12. Convenciones del repo

Basado en `AGENTS.md`:

- Dominio de negocio en espanol para tipos/componentes (`Propiedad`, `CardPropiedad`, etc.).
- Server Components por defecto; Client Components solo cuando hay interactividad.
- TypeScript estricto y evitar `any`.
- Seguridad Firebase con reglas y validaciones de entrada.
- Uso de `<Image />` de Next.js para optimizacion de imagenes.

React Hook Form:

- Es obligatorio por convencion para formularios (segun `AGENTS.md`).
- TODO detectado: `src/components/FiltrosBusqueda.tsx` maneja filtros con `useState` y no usa React Hook Form.

## 13. Roadmap / TODOs

- Implementar rutas enlazadas en UI pero no presentes en `src/app`:
  - `/nosotros`, `/contacto`, `/admin`, `/admin/login` (enlaces en `src/components/Navbar.tsx` y `src/components/Footer.tsx`).
  - `/propiedades/[slug]` (enlace en `src/components/CardPropiedad.tsx`).
- Implementar proteccion de rutas admin con `middleware.ts`.
- Implementar formularios con React Hook Form en componentes interactivos.
- Agregar script `test` y pruebas de integracion para flujos criticos.
- Agregar capturas/GIF y metricas Lighthouse verificadas.
- Definir version de Node.js en `package.json` (`engines`) o `.nvmrc`.

## 14. Casos de prueba de esta documentacion

1. Todo archivo referenciado existe en el repo.
2. Cada feature en la seccion de features tiene evidencia de archivo/comportamiento.
3. Versiones de stack coinciden literalmente con `package.json`.
4. Deploy documenta solo lo existente (`firebase.json`, reglas, indices, scripts).
5. Troubleshooting cubre `FIREBASE_PRIVATE_KEY` y `next/image`.
6. Convenciones incluyen obligatoriedad de React Hook Form y el TODO detectado.
