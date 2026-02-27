# ROADMAP — Panel de Administración IsaHouse
**Fuente de Verdad Única · Reemplaza ROADMAP_V2.md**

---

## Estado Actual del Proyecto

### Completado ✅
- Auth: Firebase Auth + session cookie httpOnly + proxy de rutas
- Rutas públicas del admin: `/admin/login`, `/admin/restablecer-contrasena`
- API Routes: `/api/auth/session`, `/api/auth/logout`
- Firebase client SDK (`src/lib/firebase/client.ts`)
- Firebase Admin SDK (`src/lib/firebase/admin.ts`) con `server-only`
- Converter Firestore (`src/lib/firebase/propiedadConverter.ts`)
- Modelo de datos: `src/types/propiedad.ts` (esquema actual: `pais` + `departamento` + `municipio`, sin `ciudad`)
- Security headers en `next.config.ts`
- Home pública con filtros, Suspense y listado de propiedades
- Filtros encadenados `departamento → municipio` en `FiltrosBusqueda.tsx` (patrón reutilizable para el admin)
- Vista pública `/propiedades/[slug]` completa: galería, mapa, breadcrumb, propiedades relacionadas, SEO dinámico
- `generateMetadata()` dinámico en `/propiedades/[slug]/page.tsx` con Open Graph, keywords y meta-tags usando campos `seo.*`
- `src/components/detalle/FormularioContacto.tsx` — formulario de contacto con React Hook Form + Server Action
- `src/lib/leads/guardarLead.ts` — Server Action de captura de leads desde el detalle (⚠️ pendiente de mover a `src/actions/` en Fase 0)
- `src/data/ubicaciones.json` — fuente de verdad estática con jerarquía País → Departamento → Municipio
- `src/components/SelectPersonalizado.tsx` — componente select custom reutilizable para formularios del admin
- Firestore Security Rules (`firestore.rules`) ajustadas al esquema actual

### Por implementar ❌
- Sidebar y shell del panel admin privado
- CRUD de inmuebles (formulario, galería, Server Actions)
- Módulo de Leads — vista admin (bandeja de contactos, cambio de estado, notas)
- Módulo de Auditoría
- Dashboard con métricas reales

---

## Decisiones Técnicas Cerradas (Innegociables)

| # | Decisión | Detalle |
|---|----------|---------|
| 1 | **Mutaciones Firestore** | Server Actions con Admin SDK (`firebase-admin/firestore`). NUNCA desde el cliente. |
| 2 | **Subida de imágenes** | SDK cliente (`firebase/storage`) con progreso por archivo. Compresión con Canvas API antes de subir (sin librerías externas). |
| 3 | **Lectura SSR en admin** | Admin SDK en Server Components del panel privado. |
| 4 | **Validación de sesión** | Helper `src/lib/admin/validarSesionAdmin.ts` en TODAS las Server Actions del admin. |
| 5 | **Respuestas de acciones** | `ResultadoAccion<T> = { ok: true; data: T } \| { ok: false; error: string }` para todas las Server Actions. |
| 6 | **Revalidación de caché** | Después de mutaciones de inmuebles: `revalidatePath('/admin')`, `revalidatePath('/admin/propiedades')`, `revalidatePath('/')`, `revalidatePath('/propiedades/[slug]')`. |
| 7 | **Unicidad de Slug** | Transacción en Firestore. Documentos de reserva en colección `slugUnicos/{slug}` y `codigoUnicos/{codigo}`. |
| 8 | **Estado inicial** | Todo inmueble inicia como `borrador`. La publicación es siempre explícita. |
| 9 | **Eliminación** | Irreversible. Se borran primero archivos de Storage, luego documento Firestore, luego reservas de slug/código. |
| 10 | **Formularios** | React Hook Form con `mode: 'onBlur'`. Prohibido `useState` para campos. |
| 11 | **Imagen principal** | Botón "Marcar como principal" por imagen en la galería. Campo `imagenPrincipal: string` (URL). |
| 12 | **Leads - origen** | Tres orígenes: `formulario_detalle` (desde `/propiedades/[slug]`, ya operativo), `formulario_contacto` (desde `/contacto`, lead sin propiedad asociada), `manual_admin` (creación manual por admin). `slugPropiedad` y `codigoPropiedad` son opcionales en el modelo para soportar leads sin propiedad. |

---

## Alcance V1

### Incluido ✅
- Módulo Inmuebles (CRUD completo + galería de imágenes)
- Módulo Leads (bandeja de contactos + gestión de estados)
- Módulo Auditoría (registro inmutable de acciones)
- Módulo SEO Operativo (meta-tags por propiedad)
- Dashboard con métricas básicas

### Fuera de alcance ❌
- Reordenamiento de imágenes por Drag & Drop
- Papelera de reciclaje / soft-delete
- Duplicación automática de inmuebles
- Integración con portales externos (Finca Raíz, Ciencuadras)
- Pagos o monetización

---

## Tipos Canónicos por Módulo

### Ya definidos (`src/types/propiedad.ts`)
`Propiedad`, `Ubicacion`, `Precio`, `Caracteristicas`, `SEOMetadata`, `Agente`,
`TipoPropiedad`, `ModoNegocio`, `EstadoPublicacion`, `CondicionInmueble`

### Por reescribir / crear

**`src/types/lead.ts`** _(existe en `src/types/lead.ts` pero incompleto — reescribir en Fase 0)_
```typescript
export type EstadoLead = 'nuevo' | 'contactado' | 'calificado' | 'cerrado' | 'descartado';
// Tres orígenes: detalle de propiedad, formulario /contacto general, creación manual por admin
export type OrigenLead = 'formulario_detalle' | 'formulario_contacto' | 'manual_admin';

export interface Lead {
  id?: string;
  nombre: string;
  telefono: string;
  email?: string;             // Opcional: el formulario público no lo pide; el admin sí puede registrarlo
  mensaje: string;
  slugPropiedad?: string;     // Opcional: undefined cuando viene del formulario /contacto general
  codigoPropiedad?: string;   // Opcional: undefined cuando viene del formulario /contacto general
  estado: EstadoLead;
  origen: OrigenLead;
  notas?: string;             // Notas internas del admin
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface CamposFormularioContacto {
  nombre: string;
  telefono: string;
  mensaje: string;
  // email no se captura en el formulario público para no afectar la conversión
}
```

**`src/types/auditoria.ts`**
```typescript
export type TipoAccionAdmin =
  | 'propiedad_creada' | 'propiedad_editada' | 'propiedad_eliminada'
  | 'propiedad_publicada' | 'propiedad_archivada'
  | 'lead_creado' | 'lead_actualizado';

export interface EventoAuditoriaAdmin {
  id?: string;
  accion: TipoAccionAdmin;
  entidadId: string;          // ID del documento afectado
  entidadTipo: 'propiedad' | 'lead';
  adminUid: string;
  descripcion: string;        // Ej: "Publicó: Casa en El Poblado (REF-045)"
  creadoEn: Date;
}
```

---

## Fases de Desarrollo

### Fase 0: Fundaciones del Servidor ← Empezar aquí

**Objetivo:** Crear los helpers de servidor que todas las Server Actions del panel usarán. Reescribir el modelo Lead al esquema consolidado. Mover `guardarLead.ts` a la carpeta `src/actions/`.

**Estado actual de los entregables:**
- `src/lib/admin/validarSesionAdmin.ts` — ❌ No existe (crear)
- `src/lib/admin/registrarAuditoria.ts` — ❌ No existe (crear)
- `src/types/lead.ts` — ⚠️ Existe pero con estructura incompleta (reescribir con modelo consolidado de la sección "Tipos Canónicos")
- `src/types/auditoria.ts` — ❌ No existe (crear)
- `src/actions/leads/crearLead.ts` — ❌ No existe; reemplazará a `src/lib/leads/guardarLead.ts` soportando los tres orígenes de lead

**Archivos a crear / modificar:**
- `src/lib/admin/validarSesionAdmin.ts` — helper de autenticación
- `src/lib/admin/registrarAuditoria.ts` — helper de auditoría
- `src/types/lead.ts` — reescribir con modelo consolidado
- `src/types/auditoria.ts` — crear
- `src/actions/leads/crearLead.ts` — nueva Server Action unificada para todos los orígenes
- Actualizar `src/components/detalle/FormularioContacto.tsx` para usar `crearLead` en lugar de `guardarLead`
- Actualizar `src/app/contacto/page.tsx` para preparar la integración del formulario (Fase 6)

**Criterios de aceptación:**
- [ ] `validarSesionAdmin()` verifica sesión + claim admin, lanza error si falla
- [ ] `registrarAuditoria()` escribe en colección `auditoria` (fire-and-forget)
- [ ] `src/types/lead.ts` reescrito con 5 estados, 3 orígenes, `email?`, `slugPropiedad?`, `codigoPropiedad?`
- [ ] `src/types/auditoria.ts` y `src/types/lead.ts` compilan sin errores TypeScript
- [ ] `crearLead.ts` soporta `formulario_detalle`, `formulario_contacto` y `manual_admin`
- [ ] `FormularioContacto.tsx` del detalle usa `crearLead` en lugar de `guardarLead`

---

### Fase 1: Shell y Navegación del Panel

**Objetivo:** Construir el layout del panel admin con Sidebar navegable.

**Archivos a crear/modificar:**
- `src/app/admin/(privado)/layout.tsx` — Añadir Sidebar al layout existente
- `src/components/admin/Sidebar.tsx`
- `src/components/admin/SidebarLink.tsx` — Con estado activo por `usePathname()`

**Estructura del Sidebar:**
```
IsaHouse Admin
├── Dashboard              /admin
├── Propiedades           /admin/propiedades
├── Leads                 /admin/leads
├── Auditoría             /admin/auditoria
└── [Cerrar sesión]
```

**Criterios de aceptación:**
- [ ] El link activo se resalta con `usePathname()`
- [ ] Responsivo: sidebar colapsable en mobile
- [ ] Botón "Cerrar sesión" llama `/api/auth/logout` y redirige a `/admin/login`
- [ ] Nombre/email del admin visible en el Sidebar

---

### Fase 2: Listado de Inmuebles

**Objetivo:** Tabla de propiedades leída desde Firestore con Admin SDK.

**Archivos a crear:**
- `src/app/admin/(privado)/propiedades/page.tsx` — Server Component
- `src/lib/propiedades/obtenerPropiedadesAdmin.ts`

**Columnas de la tabla:**

| Columna | Origen | Notas |
|---------|--------|-------|
| Imagen | `imagenPrincipal` | Thumbnail 60×60 con `<Image />` |
| Código | `codigoPropiedad` | REF-XXX |
| Título | `titulo` | Truncado a 40 chars |
| Tipo | `tipo` | Badge |
| Precio | `precio.valor` | Formateado con `formatearPrecio()` |
| Estado | `estadoPublicacion` | Badge con color |
| Actualizado | `actualizadoEn` | Fecha relativa |
| Acciones | — | Ver, Editar, Eliminar |

**Badges de estado:** `borrador`→gris · `activo`→verde · `inactivo`→amarillo · `vendido`→azul · `arrendado`→morado

**Criterios de aceptación:**
- [ ] Server Component (sin `"use client"`)
- [ ] Sin propiedades: muestra estado vacío con CTA para crear
- [ ] Tabla usable en mobile
- [ ] Botón "Nueva propiedad" navega a `/admin/propiedades/nueva`

---

### Fase 3: Creación de Inmueble

**Objetivo:** Formulario completo de alta de propiedad con subida de imágenes y Server Action transaccional.

**Archivos a crear:**
- `src/app/admin/(privado)/propiedades/nueva/page.tsx`
- `src/actions/propiedades/crearPropiedad.ts`
- `src/components/admin/formulario-propiedad/FormularioPropiedad.tsx`
- `src/components/admin/formulario-propiedad/SeccionBasica.tsx`
- `src/components/admin/formulario-propiedad/SeccionUbicacion.tsx` _(ver nota abajo)_
- `src/components/admin/formulario-propiedad/SeccionCaracteristicas.tsx`
- `src/components/admin/formulario-propiedad/SeccionPrecio.tsx`
- `src/components/admin/formulario-propiedad/GaleriaImagenes.tsx`
- `src/lib/utils/generarSlug.ts` — Normalización NFKD del título

**Flujo de guardado:**
```
1. React Hook Form valida (mode: 'onBlur')
2. GaleriaImagenes sube imágenes con SDK cliente → devuelve URLs
   - Compresión con Canvas API antes de subir
   - Progreso individual por archivo
   - Botón "Marcar como principal" por imagen
3. Client Component llama crearPropiedad(data) Server Action
4. crearPropiedad():
   a. validarSesionAdmin() — lanza si no autorizado
   b. Genera slug con generarSlug(titulo)
   c. Transacción Firestore:
      · Verifica slugUnicos/{slug} no existe
      · Verifica codigoUnicos/{codigo} no existe
      · Escribe propiedades/{id} con estadoPublicacion: 'borrador'
      · Reserva slugUnicos/{slug} y codigoUnicos/{codigo}
   d. registrarAuditoria('propiedad_creada', ...)
   e. revalidatePath(...)
   f. Devuelve ResultadoAccion<{ id, slug }>
5. Toast de éxito → redirige a /admin/propiedades
```

**Restricciones de galería:**
- Formatos: `image/jpeg`, `image/png`, `image/webp`
- Límite: 40 imágenes por propiedad
- Path Storage: `propiedades/{codigoPropiedad}/{timestamp}-{nombreSanitizado}`

**Criterios de aceptación:**
- [ ] `estadoPublicacion` inicia en `'borrador'`
- [ ] Errores visibles por campo
- [ ] Slug auto-generado desde título, editable, único
- [ ] Progreso de subida de imágenes individual
- [ ] Errores de Server Action visibles en UI (no solo consola)
- [ ] Transacción garantiza unicidad de slug y código

**Nota — `SeccionUbicacion.tsx` (selectores encadenados):**

El esquema de `Propiedad` usa la jerarquía estricta **País → Departamento → Municipio** (el campo `ciudad` fue eliminado). `SeccionUbicacion.tsx` debe implementar:
- Selector de `pais` (por ahora solo "Colombia", mantenido en el modelo para expansión futura)
- Selector de `departamento`, condicionado al país
- Selector de `municipio`, condicionado al departamento seleccionado
- Fuente de datos: `src/data/ubicaciones.json` — la misma fuente que ya usa `FiltrosBusqueda.tsx`
- Componente base: reutilizar `SelectPersonalizado.tsx` (ya implementado en `src/components/`)
- El patrón de selección encadenada ya está probado en `FiltrosBusqueda.tsx` y puede servir de referencia

---

### Fase 4: Edición de Inmueble

**Objetivo:** Edición de todos los campos + gestión de galería de imágenes existentes.

**Archivos a crear:**
- `src/app/admin/(privado)/propiedades/[id]/editar/page.tsx` — Server Component
- `src/actions/propiedades/actualizarPropiedad.ts`
- `src/lib/propiedades/obtenerPropiedadAdmin.ts`

**Diferencias vs. Creación:**
- Formulario pre-rellado desde Server Component
- Galería muestra imágenes existentes + permite agregar/eliminar
- Eliminar imagen: borra de Storage primero → actualiza array en Firestore
- Si el slug cambia: actualiza `slugUnicos` (borra viejo, crea nuevo en transacción)

**Criterios de aceptación:**
- [ ] Formulario pre-rellado con todos los campos actuales
- [ ] Cambio de slug valida unicidad con debounce 500ms
- [ ] Eliminar imagen individual requiere confirmación + borra de Storage
- [ ] Auditoría registra `propiedad_editada`

---

### Fase 5: Estado, Destacado y Eliminación

**Objetivo:** Acciones de ciclo de vida de una propiedad.

**Archivos a crear:**
- `src/actions/propiedades/cambiarEstadoPropiedad.ts`
- `src/actions/propiedades/toggleDestacado.ts`
- `src/actions/propiedades/eliminarPropiedad.ts`
- `src/components/admin/ModalConfirmacion.tsx`

**Transiciones de estado válidas:**
- `borrador` → `activo` (publicar) | `inactivo` (archivar)
- `activo` → `inactivo` | `vendido` | `arrendado`
- `inactivo` → `activo`
- `vendido` / `arrendado` → `inactivo`

**Flujo de eliminación irreversible:**
```
1. Admin clic "Eliminar" → Modal pide confirmar escribiendo "ELIMINAR"
2. eliminarPropiedad():
   a. validarSesionAdmin()
   b. Listar y borrar archivos Storage en propiedades/{codigo}/*
      → Si falla: abortar, NO tocar Firestore
   c. Transacción Firestore:
      · Borra propiedades/{id}
      · Borra slugUnicos/{slug}
      · Borra codigoUnicos/{codigo}
   d. registrarAuditoria('propiedad_eliminada', ...)
   e. revalidatePath(...) → redirige a /admin/propiedades
```

**Criterios de aceptación:**
- [ ] Cambio de estado: badge actualizado en UI sin recarga
- [ ] Eliminación: si Storage falla, Firestore NO se toca
- [ ] Modal exige escribir "ELIMINAR" para confirmar
- [ ] Toggle destacado actualiza campo `destacado` en Firestore

---

### Fase 6: Leads (Bandeja de Contactos)

**Objetivo:** CRM básico para gestionar contactos capturados desde dos fuentes web ya existentes + leads manuales del admin.

**Contexto previo (ya implementado antes de esta fase):**
- `src/actions/leads/crearLead.ts` — creado en Fase 0; ya usado por `FormularioContacto.tsx` del detalle con `origen: 'formulario_detalle'`
- `src/components/detalle/FormularioContacto.tsx` — formulario funcional en `/propiedades/[slug]` (captura nombre, teléfono, mensaje)

**Archivos a crear:**
- `src/app/admin/(privado)/leads/page.tsx` — Server Component (bandeja principal)
- `src/app/admin/(privado)/leads/nueva/page.tsx` — formulario de creación manual
- `src/actions/leads/actualizarLead.ts`
- `src/lib/leads/obtenerLeads.ts`
- Modificar `src/app/contacto/page.tsx` — Implementar formulario funcional que llama `crearLead` con `origen: 'formulario_contacto'`

**Integración formulario `/contacto`:**
- El formulario implementa la interfaz `CamposFormularioContacto` (nombre, teléfono, mensaje — sin email)
- Llama a `crearLead` con `origen: 'formulario_contacto'`, `slugPropiedad: undefined`, `estado: 'nuevo'`
- La Server Action pública solo valida los datos del formulario (sin sesión admin)

**Vista admin:**
- Columnas: Nombre, Teléfono, Propiedad de interés (slug/código o "General"), Estado, Origen, Fecha, Acciones
- Filtros por estado y origen
- Cambio de estado inline (5 estados: nuevo → contactado → calificado → cerrado / descartado)
- Campo de notas internas (textarea) editable por admin
- Creación manual con `origen: 'manual_admin'` (incluye campo `email?` opcional)

**Criterios de aceptación:**
- [ ] Formulario `/contacto` → Lead creado en Firestore con `origen: 'formulario_contacto'` (sin sesión admin requerida)
- [ ] Leads de `/propiedades/[slug]` visibles en la bandeja admin con `origen: 'formulario_detalle'`
- [ ] Admin puede crear lead manualmente (`origen: 'manual_admin'`) incluyendo `email` si lo tiene
- [ ] Admin puede cambiar estado entre los 5 opciones y agregar notas
- [ ] Tabla ordenada por `creadoEn DESC`
- [ ] Auditoría registra `lead_creado` y `lead_actualizado`

---

### Fase 7: Auditoría

**Objetivo:** Vista de solo lectura del historial de acciones del admin.

**Archivos a crear:**
- `src/app/admin/(privado)/auditoria/page.tsx` — Server Component

**Vista:**
- Columnas: Fecha, Acción, Tipo entidad, Descripción, Admin UID
- Ordenada por `creadoEn DESC`
- Últimos 100 eventos (paginación simple)
- Solo lectura

**Criterios de aceptación:**
- [ ] Eventos de Fases 3, 4, 5 y 6 aparecen correctamente
- [ ] Ordenados del más reciente al más antiguo
- [ ] Sin acciones de edición o eliminación

---

### Fase 8: SEO Operativo + Dashboard

**Objetivo:** Edición de meta-tags por propiedad y dashboard con métricas básicas.

**Archivos a crear/modificar:**
- `src/components/admin/formulario-propiedad/SeccionSEO.tsx` — Añadir a FormularioPropiedad
- `src/app/admin/(privado)/page.tsx` — Reescribir con métricas reales

**SEO por propiedad (en el formulario de creación/edición):**
- `seo.metaTitle` (max 60 chars con contador)
- `seo.metaDescription` (max 160 chars con contador)
- `seo.keywords` (input de tags)
- Preview estimado del snippet de Google

**Dashboard:**
- Total propiedades activas
- Leads nuevos (últimos 7 días)
- Total vistas (suma de campo `vistas`)
- Cards de acceso rápido: Nueva propiedad, Ver leads, Ver auditoría

**Criterios de aceptación:**
- [ ] Meta-tags se guardan y se usan en `generateMetadata()` de la ruta pública de la propiedad
- [ ] Dashboard muestra datos reales de Firestore
- [ ] Contadores del dashboard se actualizan con revalidación

---

## Mapa de Dependencias

```
Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5
                                               ↓
                                      Fase 6 → Fase 7 → Fase 8
```

Fase 6 puede iniciarse en paralelo con Fase 5 si el formulario de creación (Fase 3) está estable.

---

## Estructura de Archivos Objetivo

_Los ítems marcados con ✅ ya existen en el repositorio._

```
src/
├── actions/                              ← Carpeta nueva; todas las mutaciones van aquí
│   ├── propiedades/
│   │   ├── crearPropiedad.ts
│   │   ├── actualizarPropiedad.ts
│   │   ├── eliminarPropiedad.ts
│   │   ├── cambiarEstadoPropiedad.ts
│   │   └── toggleDestacado.ts
│   └── leads/
│       ├── crearLead.ts                  ← Reemplaza src/lib/leads/guardarLead.ts (Fase 0)
│       └── actualizarLead.ts
├── app/
│   ├── contacto/
│   │   └── page.tsx                     ✅ (formulario funcional se añade en Fase 6)
│   ├── propiedades/
│   │   └── [slug]/
│   │       └── page.tsx                 ✅ Vista pública completa con SEO y formulario de contacto
│   └── admin/
│       └── (privado)/
│           ├── page.tsx                  Dashboard (métricas reales en Fase 8)
│           ├── layout.tsx                Con Sidebar (Fase 1)
│           ├── propiedades/
│           │   ├── page.tsx
│           │   ├── nueva/page.tsx
│           │   └── [id]/editar/page.tsx
│           ├── leads/
│           │   ├── page.tsx
│           │   └── nueva/page.tsx
│           └── auditoria/
│               └── page.tsx
├── components/
│   ├── SelectPersonalizado.tsx           ✅ Reutilizar en formularios admin
│   ├── detalle/
│   │   ├── FormularioContacto.tsx        ✅ (actualizarse para usar crearLead en Fase 0)
│   │   ├── GaleriaPropiedad.tsx          ✅
│   │   └── MapaUbicacion.tsx             ✅
│   └── admin/
│       ├── Sidebar.tsx
│       ├── SidebarLink.tsx
│       ├── ModalConfirmacion.tsx
│       └── formulario-propiedad/
│           ├── FormularioPropiedad.tsx
│           ├── SeccionBasica.tsx
│           ├── SeccionUbicacion.tsx       ← Usa ubicaciones.json + SelectPersonalizado (jerarquía País→Dpto→Municipio)
│           ├── SeccionCaracteristicas.tsx
│           ├── SeccionPrecio.tsx
│           ├── SeccionSEO.tsx
│           └── GaleriaImagenes.tsx
├── data/
│   └── ubicaciones.json                  ✅ Fuente de verdad País → Departamento → Municipio
├── lib/
│   ├── admin/
│   │   ├── validarSesionAdmin.ts
│   │   └── registrarAuditoria.ts
│   ├── firebase/
│   │   ├── client.ts                     ✅
│   │   ├── admin.ts                      ✅
│   │   └── propiedadConverter.ts         ✅
│   ├── propiedades/
│   │   ├── obtenerPropiedadesPublicas.ts  ✅
│   │   ├── obtenerPropiedadPorSlug.ts     ✅
│   │   ├── obtenerPropiedadesAdmin.ts
│   │   └── obtenerPropiedadAdmin.ts
│   ├── leads/
│   │   └── obtenerLeads.ts               ← guardarLead.ts se elimina aquí (migrado a actions/ en Fase 0)
│   └── utils/
│       └── generarSlug.ts
└── types/
    ├── propiedad.ts                       ✅
    ├── lead.ts                            ⚠️ Existe; reescribir en Fase 0 con modelo consolidado
    ├── filtros.ts                         ✅
    ├── auditoria.ts                       ← Crear en Fase 0
    └── index.ts                           ✅
```

---

## Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Fallo en borrado de Storage antes de Firestore | Alto | Storage primero; si falla, no se toca Firestore |
| Race condition en unicidad de slug | Alto | Transacción con colección `slugUnicos` |
| Server Actions admin sin autenticación | Crítico | `validarSesionAdmin()` en TODAS las Server Actions del admin |
| Fugas de módulos servidor al cliente | Alto | `'server-only'` en todos los módulos de Admin SDK |
| Timeout en subida de imágenes grandes | Medio | Compresión Canvas API + límite 40 imágenes |

---

## Verificación End-to-End por Fase

| Fase | Test de verificación |
|------|---------------------|
| 0 | TypeScript compila sin errores. `validarSesionAdmin` rechaza sesión inválida. |
| 1 | Login → Dashboard → Sidebar con links activos → Logout redirige a login |
| 2 | Admin → `/admin/propiedades` → Tabla vacía con CTA visible |
| 3 | Crear inmueble → Subir 3 imágenes → Marcar principal → Guardar → Aparece en tabla con estado borrador |
| 4 | Editar inmueble → Cambiar título → Verificar slug actualizado → Eliminar imagen → Verificar Storage |
| 5 | Publicar inmueble → Aparece en home pública. Eliminar → No existe en Firestore ni Storage |
| 6 | Formulario `/contacto` (sin propiedad) → Lead con `origen:'formulario_contacto'` en Firestore → Visible en admin → Cambiar estado → Agregar nota. Verificar también que leads de detalle (`origen:'formulario_detalle'`) aparecen correctamente. |
| 7 | Ver `/admin/auditoria` → Historial con acciones de pruebas anteriores |
| 8 | Editar SEO de una propiedad → Inspeccionar `<head>` en ruta pública → Dashboard con métricas |

---

*Última actualización: Diagnóstico y sincronización completados. Vista pública del detalle y captura de leads (formulario_detalle) ya operativos. Fase 0 lista para iniciar.*
