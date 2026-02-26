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
- Modelo de datos: `src/types/propiedad.ts`
- Security headers en `next.config.ts`
- Home pública con filtros, Suspense y listado de propiedades

### Por implementar ❌
- Sidebar y shell del panel admin privado
- CRUD de inmuebles (formulario, galería, Server Actions)
- Módulo de Leads (bandeja de contactos)
- Módulo de Auditoría
- SEO operativo por propiedad
- Firestore Security Rules

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
| 12 | **Leads - origen** | Híbrido: formulario `/contacto` crea leads automáticamente (`origen: 'formulario_web'`) + admin puede crear manualmente (`origen: 'manual_admin'`). |

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

### Por crear

**`src/types/lead.ts`**
```typescript
export type EstadoLead = 'nuevo' | 'contactado' | 'calificado' | 'cerrado' | 'descartado';
export type OrigenLead = 'formulario_web' | 'manual_admin';

export interface Lead {
  id?: string;
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
  propiedadSlug?: string;    // Propiedad de interés (opcional)
  estado: EstadoLead;
  origen: OrigenLead;
  notas?: string;            // Notas internas del admin
  creadoEn: Date;
  actualizadoEn: Date;
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

**Objetivo:** Crear los helpers de servidor que todas las Server Actions del panel usarán.

**Archivos a crear:**
- `src/lib/admin/validarSesionAdmin.ts`
- `src/lib/admin/registrarAuditoria.ts`
- `src/types/lead.ts`
- `src/types/auditoria.ts`

**Criterios de aceptación:**
- [ ] `validarSesionAdmin()` verifica sesión + claim admin, lanza error si falla
- [ ] `registrarAuditoria()` escribe en colección `auditoria` (fire-and-forget)
- [ ] Tipos de Lead y Auditoría compilan sin errores TypeScript

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
- `src/components/admin/formulario-propiedad/SeccionUbicacion.tsx`
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

**Objetivo:** CRM básico para gestionar contactos del sitio web y leads manuales.

**Archivos a crear:**
- `src/app/admin/(privado)/leads/page.tsx` — Server Component
- `src/app/admin/(privado)/leads/nueva/page.tsx`
- `src/actions/leads/crearLead.ts` — Usada por formulario web Y admin
- `src/actions/leads/actualizarLead.ts`
- `src/lib/leads/obtenerLeads.ts`
- Modificar `src/app/contacto/page.tsx` — Para llamar `crearLead`

**Integración formulario web:**
- El formulario `/contacto` llama a `crearLead` Server Action (sin validación de sesión admin)
- Se crea con `origen: 'formulario_web'`, `estado: 'nuevo'` automáticamente
- La Server Action pública solo valida los datos del formulario

**Vista admin:**
- Columnas: Nombre, Email, Teléfono, Propiedad de interés, Estado, Fecha, Acciones
- Filtros por estado y origen
- Cambio de estado inline
- Campo de notas internas (textarea)
- Creación manual con `origen: 'manual_admin'`

**Criterios de aceptación:**
- [ ] Formulario web → Lead creado en Firestore (sin sesión admin requerida)
- [ ] Admin puede crear lead manualmente
- [ ] Admin puede cambiar estado y agregar notas
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

```
src/
├── actions/
│   ├── propiedades/
│   │   ├── crearPropiedad.ts
│   │   ├── actualizarPropiedad.ts
│   │   ├── eliminarPropiedad.ts
│   │   ├── cambiarEstadoPropiedad.ts
│   │   └── toggleDestacado.ts
│   └── leads/
│       ├── crearLead.ts
│       └── actualizarLead.ts
├── app/
│   └── admin/
│       └── (privado)/
│           ├── page.tsx                    Dashboard
│           ├── layout.tsx                  Con Sidebar
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
│   └── admin/
│       ├── Sidebar.tsx
│       ├── SidebarLink.tsx
│       ├── ModalConfirmacion.tsx
│       └── formulario-propiedad/
│           ├── FormularioPropiedad.tsx
│           ├── SeccionBasica.tsx
│           ├── SeccionUbicacion.tsx
│           ├── SeccionCaracteristicas.tsx
│           ├── SeccionPrecio.tsx
│           ├── SeccionSEO.tsx
│           └── GaleriaImagenes.tsx
├── lib/
│   ├── admin/
│   │   ├── validarSesionAdmin.ts
│   │   └── registrarAuditoria.ts
│   ├── propiedades/
│   │   ├── obtenerPropiedadesAdmin.ts
│   │   └── obtenerPropiedadAdmin.ts
│   ├── leads/
│   │   └── obtenerLeads.ts
│   └── utils/
│       └── generarSlug.ts
└── types/
    ├── propiedad.ts      (ya existe)
    ├── lead.ts           (por crear en Fase 0)
    ├── auditoria.ts      (por crear en Fase 0)
    └── index.ts
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
| 6 | Formulario `/contacto` → Verificar Lead en admin → Cambiar estado → Agregar nota |
| 7 | Ver `/admin/auditoria` → Historial con acciones de pruebas anteriores |
| 8 | Editar SEO de una propiedad → Inspeccionar `<head>` en ruta pública → Dashboard con métricas |

---

*Última actualización: Fase 0 por comenzar.*
