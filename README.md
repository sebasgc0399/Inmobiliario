# Inmobiliario - Cascaron Base Post-Reset

Repositorio Next.js con App Router, TypeScript, Tailwind y Firebase.
El proyecto esta en Reset Nuclear: hoy solo existe la base tecnica y el flujo admin inicial.

## Estado real del repo

- El dominio inmobiliario aun no esta implementado.
- No existen catalogo publico, detalle de propiedad, filtros de busqueda ni CRUD de propiedades.
- El codigo activo cubre rutas publicas estaticas y autenticacion/sesion admin.

## Rutas implementadas

| Ruta | Tipo | Estado |
|---|---|---|
| `/` | Publica | Activa |
| `/nosotros` | Publica | Activa |
| `/contacto` | Publica | Activa |
| `/admin/login` | Admin publica | Activa |
| `/admin/restablecer-contrasena` | Admin publica | Activa |
| `/admin` | Admin privada | Activa (requiere sesion) |
| `/api/auth/session` | API | Activa |
| `/api/auth/logout` | API | Activa |

## Setup local

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Crea `.env` a partir de `.env.example` y completa variables de Firebase.
3. Inicia en desarrollo:
   ```bash
   npm run dev
   ```
4. Verifica calidad y build:
   ```bash
   npm run lint
   npm run build
   ```

## Variables de entorno

Publicas:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `CI_NEXT_PUBLIC_ENV`

Privadas:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## Auth admin base

- Login cliente con Firebase Auth desde `/admin/login`.
- Creacion de cookie `__session` via `POST /api/auth/session`.
- Cierre de sesion via `POST /api/auth/logout`.
- Proteccion de `/admin/*` por `src/proxy.ts` y validacion de sesion en layout privado.
- Asignacion de claim admin:
  ```bash
  npm run auth:set-admin -- <UID>
  ```

## Direccion funcional definida (aun no implementada)

- Habra una sola coleccion Firestore: `propiedades`.
- Cada propiedad se clasificara con `lineaNegocio: 'inversion' | 'tradicional'`.
- `inversion` se define como oportunidad comercial con datos potencialmente incompletos.
- `entidadBancaria` nunca debe exponerse al cliente.
- No se fijan aun rutas publicas futuras del catalogo hasta definir modelo y frontend.

## Documentacion canonica

- Reglas operativas: `AGENTS.md`
- Contexto funcional/comercial: `docs/brief-negocio-post-reset.md`
