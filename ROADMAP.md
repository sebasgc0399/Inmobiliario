# ROADMAP — Panel de Administración IsaHouse

> Documento vivo de planificación del desarrollo del panel de administración.
> Cada fase es independiente y entregable. El orden es el de prioridad recomendada.

---

## Estado actual

- [x] Autenticación Firebase (email/contraseña + custom claim `admin`)
- [x] Protección de rutas con Middleware de Next.js
- [x] Session cookies HTTP-only (5 días)
- [x] Página de login con recuperación de contraseña
- [x] Página personalizada de restablecimiento de contraseña con validación de política
- [x] Modelo de datos canónico (`src/types/propiedad.ts`)
- [x] Reglas de seguridad Firestore (validación en 3 capas)
- [x] Consulta pública de propiedades activas con filtros y conversión de moneda
- [ ] Layout del panel con navegación
- [ ] CRUD de propiedades
- [ ] Carga de imágenes a Firebase Storage
- [ ] Dashboard con métricas

---

## Fase 1 — Layout y Shell del Panel

**Objetivo:** Crear la estructura visual permanente del panel: navegación lateral, encabezado y área de contenido. Esta fase es el **prerequisito de todo lo demás**.

### Archivos a crear/modificar

| Acción | Archivo | Descripción |
|--------|---------|-------------|
| MODIFICAR | `src/app/admin/(privado)/layout.tsx` | Agregar el shell visual conservando la validación de sesión |
| CREAR | `src/components/admin/SidebarAdmin.tsx` | Navegación lateral (Client Component) |
| CREAR | `src/components/admin/TopbarAdmin.tsx` | Encabezado con info de sesión y logout |
| MODIFICAR | `src/app/admin/(privado)/page.tsx` | Dashboard inicial con placeholders |

### Diseño del layout

```
┌──────────────────────────────────────────────────┐
│  IsaHouse Admin              usuario@email  [×]  │  ← Topbar
├─────────────┬────────────────────────────────────┤
│             │                                    │
│  Dashboard  │                                    │
│  Inmuebles  │         CONTENIDO DE PÁGINA        │
│  + Nuevo    │                                    │
│             │                                    │
└─────────────┴────────────────────────────────────┘
     Sidebar                  Main
```

### Links de navegación del Sidebar

| Ícono | Etiqueta | Ruta |
|-------|----------|------|
| Grid 2×2 | Dashboard | `/admin` |
| Casa | Inmuebles | `/admin/propiedades` |
| Más (+) | Nuevo Inmueble | `/admin/propiedades/nueva` |

### Comportamiento responsive

- **Desktop (≥ md):** Sidebar fijo de 240px a la izquierda, contenido ocupa el resto
- **Mobile (< md):** Sidebar oculto, accesible con botón hamburguesa en el Topbar

### Criterios de aceptación

- [ ] El Sidebar resalta el link activo con `usePathname()`
- [ ] El layout envuelve correctamente todas las páginas bajo `(privado)`
- [ ] El botón de cerrar sesión está en el Topbar (reutilizar `BotonCerrarSesion`)
- [ ] El contenido tiene padding consistente (`max-w-7xl` o `max-w-5xl`)
- [ ] En mobile el menú es funcional y se cierra al navegar

---

## Fase 2 — Listado de Propiedades (Admin)

**Objetivo:** Página `/admin/propiedades` que muestre **todas** las propiedades (todos los `estadoPublicacion`), no solo las activas. Con acciones rápidas por fila.

### Archivos a crear

| Archivo | Descripción |
|---------|-------------|
| `src/app/admin/(privado)/propiedades/page.tsx` | Página del listado (Server Component) |
| `src/lib/propiedades/obtenerTodasLasPropiedadesAdmin.ts` | Consulta Admin SDK sin filtro de estado |

### Columnas de la tabla

| Columna | Origen en `Propiedad` | Notas |
|---------|-----------------------|-------|
| Imagen | `imagenPrincipal` \|\| `imagenes[0]` | Thumbnail 60×60 |
| Título | `titulo` | Truncado a 1 línea |
| Tipo / Modo | `tipo` + `modoNegocio` | "Casa · Venta" |
| Ciudad | `ubicacion.ciudad` | — |
| Precio | `precio.valor` + `precio.moneda` | Formateado: "$350.000.000 COP" |
| Estado | `estadoPublicacion` | Badge de color (ver abajo) |
| Actualizado | `actualizadoEn` | Fecha relativa: "Hace 2 días" |
| Acciones | — | Editar / Eliminar |

### Badges de estado

| Valor | Color | |
|-------|-------|-|
| `borrador` | Gris | No visible públicamente |
| `activo` | Verde | Visible públicamente |
| `inactivo` | Amarillo | Publicación pausada |
| `vendido` | Azul | Cerrado |
| `arrendado` | Púrpura | Cerrado |

### Funcionalidades de la página

- **Filtro por estado:** Tabs en la parte superior (Todos / Activos / Borradores / Inactivos / Cerrados)
- **Buscador:** Búsqueda client-side por `titulo` o `codigoPropiedad`
- **Contador:** "Mostrando X de Y inmuebles"
- **Botón principal:** "Nuevo Inmueble" (prominente, esquina superior derecha)
- **Orden por defecto:** `actualizadoEn` descendente

### Criterios de aceptación

- [ ] Muestra propiedades en borrador (invisibles al público)
- [ ] Click en título o fila lleva a la edición
- [ ] Cambio de estado desde la tabla con confirmación inline (sin modal complejo)
- [ ] Eliminar con diálogo de confirmación
- [ ] La tabla es responsive (en mobile muestra menos columnas)

---

## Fase 3 — Formulario de Creación de Propiedades

**Objetivo:** Formulario completo para crear una nueva propiedad cubriendo todos los campos de la interfaz `Propiedad` de `src/types/propiedad.ts`.

### Archivos a crear

| Archivo | Descripción |
|---------|-------------|
| `src/app/admin/(privado)/propiedades/nueva/page.tsx` | Página contenedora (Server Component) |
| `src/components/admin/FormularioPropiedad.tsx` | Formulario principal (Client, React Hook Form) |
| `src/lib/propiedades/crearPropiedad.ts` | Server Action de escritura en Firestore |
| `src/lib/propiedades/generarSlug.ts` | Genera slug único desde el título |

### Secciones del formulario (tabs o acordeón)

```
┌─ 1. Información Básica ──────────────────────────┐
│  titulo*          codigoPropiedad*               │
│  tipo*            modoNegocio*                   │
│  condicion*       estadoPublicacion*             │
│  descripcion* (textarea)                         │
└──────────────────────────────────────────────────┘

┌─ 2. Precio ──────────────────────────────────────┐
│  precio.valor*    precio.moneda*                 │
│  precio.negociable (checkbox)                    │
│  precio.adminMensual    precio.impuestoPredial   │
└──────────────────────────────────────────────────┘

┌─ 3. Ubicación ───────────────────────────────────┐
│  ubicacion.pais (default: Colombia)              │
│  ubicacion.departamento*  ubicacion.ciudad*      │
│  ubicacion.barrio         ubicacion.direccion*   │
│  ubicacion.codigoPostal                          │
│  coordenadas.latitud   coordenadas.longitud      │
└──────────────────────────────────────────────────┘

┌─ 4. Características ─────────────────────────────┐
│  habitaciones*  banos*  parqueaderos*            │
│  metrosCuadrados*  metrosConstruidos             │
│  pisos  piso  estrato (1-6)  antiguedad (años)   │
│  permiteRentaCorta (checkbox)                    │
│  amenidades (chips: piscina, gimnasio, ascensor…)│
└──────────────────────────────────────────────────┘

┌─ 5. Imágenes y Media ────────────────────────────┐
│  Subida múltiple → Firebase Storage              │
│  Preview de imágenes + selección de principal    │
│  videoUrl (YouTube, opcional)                    │
│  tourVirtual (URL 360°, opcional)                │
└──────────────────────────────────────────────────┘

┌─ 6. Agente ──────────────────────────────────────┐
│  agente.nombre    agente.telefono (+57…)         │
│  agente.email     agente.whatsapp                │
└──────────────────────────────────────────────────┘

┌─ 7. SEO y Extras (colapsado por defecto) ────────┐
│  seo.metaTitle (max 60 chars + contador)         │
│  seo.metaDescription (max 160 chars + contador)  │
│  seo.keywords (tags)                             │
│  destacado (checkbox)   tags (chips libres)      │
└──────────────────────────────────────────────────┘
```

### Generación automática del slug

- Se genera desde `titulo` al salir del campo (onBlur)
- Elimina tildes, caracteres especiales, convierte a kebab-case
- Ejemplo: `"Casa en El Poblado"` → `"casa-en-el-poblado"`
- Editable manualmente
- Se verifica unicidad en Firestore antes de guardar

### Flujo de guardado

1. Usuario completa el formulario (puede guardar como borrador parcial)
2. React Hook Form valida todos los campos requeridos
3. Se suben las imágenes nuevas a Firebase Storage → se obtienen las URLs
4. Se escribe el documento en Firestore con `propiedadConverter`
5. Redirección a `/admin/propiedades` con toast de éxito

### Criterios de aceptación

- [ ] Guarda como `borrador` por defecto (nunca publica automáticamente)
- [ ] Las imágenes se suben **antes** de guardar el documento Firestore
- [ ] Errores de validación se muestran campo por campo
- [ ] `codigoPropiedad` tiene sugerencia automática pero es editable
- [ ] El slug se auto-genera pero es editable
- [ ] El formulario es usable en mobile (cada sección se expande/colapsa)

---

## Fase 4 — Edición de Propiedades

**Objetivo:** Reutilizar `FormularioPropiedad` para editar una propiedad existente, pre-poblando todos sus campos.

### Archivos a crear

| Archivo | Descripción |
|---------|-------------|
| `src/app/admin/(privado)/propiedades/[id]/editar/page.tsx` | Server Component que carga la propiedad |
| `src/lib/propiedades/obtenerPropiedadPorId.ts` | `getDoc()` por ID con `propiedadConverter` |
| `src/lib/propiedades/actualizarPropiedad.ts` | Server Action de actualización en Firestore |

### Diferencias respecto a creación

| Aspecto | Creación | Edición |
|---------|----------|---------|
| Datos iniciales | Vacío / defaults | Pre-populados desde Firestore |
| `slug` | Auto-generado, editable | **No editable** (evita romper URLs indexadas) |
| `codigoPropiedad` | Sugerido, editable | Editable |
| Imágenes | Solo subida | Subida + eliminación individual |
| `creadoEn` | `serverTimestamp()` | Sin cambios |
| `actualizadoEn` | `serverTimestamp()` | `serverTimestamp()` |

### Gestión de imágenes en edición

- Las imágenes existentes muestran su thumbnail con botón ✕
- Al eliminar: se borra de Firebase Storage **y** se remueve de la lista en memoria
- Imágenes nuevas: se suben al Storage y se agregan a la lista
- Las imágenes no tocadas no se re-suben

### Criterios de aceptación

- [ ] Todos los campos se pre-populan correctamente
- [ ] El `slug` es visible pero no editable (campo deshabilitado)
- [ ] `actualizadoEn` se actualiza con `serverTimestamp()` en cada guardado
- [ ] Se puede cambiar `estadoPublicacion` desde el formulario
- [ ] La navegación de vuelta es a `/admin/propiedades`

---

## Fase 5 — Cambio de Estado y Eliminación

**Objetivo:** Acciones rápidas desde la tabla del listado sin necesidad de abrir el formulario completo.

### Acciones implementadas

| Acción | Disparador | Comportamiento |
|--------|-----------|----------------|
| Cambiar estado | Dropdown en la fila | Actualiza `estadoPublicacion` + `publicadoEn` si aplica |
| Eliminar | Botón en la fila | Modal de confirmación con título de la propiedad |
| Destacar / quitar | Toggle en la fila | Cambia `destacado` sin abrir formulario |

### Archivos a crear

| Archivo | Descripción |
|---------|-------------|
| `src/lib/propiedades/cambiarEstadoPropiedad.ts` | Server Action: actualiza `estadoPublicacion` |
| `src/lib/propiedades/eliminarPropiedad.ts` | Server Action: borra Storage + Firestore |
| `src/components/admin/BotonCambiarEstado.tsx` | Client Component con dropdown |
| `src/components/admin/BotonEliminar.tsx` | Client Component con modal de confirmación |

### Lógica de eliminación (importante)

Al eliminar una propiedad se deben eliminar sus imágenes de Firebase Storage para evitar archivos huérfanos:

```
1. getDoc(id)  →  obtener URLs de imagenes[]
2. Extraer path del Storage de cada URL
3. deleteObject(ref)  →  eliminar cada archivo
4. deleteDoc(id)  →  eliminar documento Firestore
5. revalidatePath('/')
6. revalidatePath('/admin/propiedades')
```

### Criterios de aceptación

- [ ] La eliminación es **irreversible** y el modal lo advierte explícitamente
- [ ] El cambio de estado actualiza el badge en la tabla sin recargar la página completa
- [ ] Si se activa un borrador (`borrador → activo`), se setea `publicadoEn` con la fecha actual
- [ ] Si se cambia a `vendido` o `arrendado`, la propiedad deja de ser visible públicamente

---

## Fase 6 — Dashboard con Métricas

**Objetivo:** Página `/admin` con tarjetas de métricas que den visibilidad inmediata del estado del portal.

### Tarjetas de métricas

| Métrica | Fuente | Color |
|---------|--------|-------|
| Total de inmuebles | `count()` de todos | Gris |
| Inmuebles activos | `estadoPublicacion == 'activo'` | Verde |
| En borrador | `estadoPublicacion == 'borrador'` | Amarillo |
| Inactivos | `estadoPublicacion == 'inactivo'` | Naranja |
| Vendidos / Arrendados | `estadoPublicacion in ['vendido','arrendado']` | Azul |
| Destacados | `destacado == true` | Púrpura |

### Secciones adicionales del Dashboard

- **Inmuebles recientes:** Últimos 5 modificados (con link de edición)
- **Borradores pendientes:** Hasta 5 borradores sin publicar
- **Acceso rápido:** Botón prominente "Publicar nuevo inmueble"

### Archivos a crear

| Archivo | Descripción |
|---------|-------------|
| `src/lib/propiedades/obtenerMetricasAdmin.ts` | `Promise.all` de consultas paralelas |
| `src/components/admin/TarjetaMetrica.tsx` | Componente reutilizable (número + etiqueta + color) |

### Criterios de aceptación

- [ ] Todas las métricas se calculan en una sola llamada paralela (`Promise.all`)
- [ ] El Dashboard es un Server Component (sin estado en cliente)
- [ ] Cada sección tiene su propio `Suspense` con skeleton de carga
- [ ] Los números son clicables y llevan al listado con el filtro aplicado

---

## Mapa de dependencias entre fases

```
Fase 1 — Layout y Shell (PREREQUISITO)
    │
    ▼
Fase 2 — Listado de Propiedades
    │
    ▼
Fase 3 — Formulario de Creación
    │                    ↑
    ▼                    │ (reutiliza FormularioPropiedad)
Fase 4 — Edición ────────┘
    │
    ▼
Fase 5 — Cambio de Estado / Eliminación
    │
    ▼
Fase 6 — Dashboard con Métricas
```

Las fases 3, 4 y 5 comparten `FormularioPropiedad` y las funciones de escritura en Firestore/Storage.

---

## Decisiones técnicas transversales

### Mutaciones en Firestore (Fases 3, 4, 5)

- Usar **Server Actions** de Next.js (`'use server'`) para todas las escrituras
- Las Server Actions se llaman directamente desde los Client Components del formulario
- Después de cada mutación: `revalidatePath('/admin/propiedades')` y `revalidatePath('/')`
- **No** usar Firebase Admin SDK para escrituras (Admin SDK es solo para lectura SSR y auth)
- Las escrituras del admin usan el SDK de cliente (`firebase/firestore`) autenticado

### Carga de imágenes (Fases 3, 4)

- SDK cliente de Firebase Storage (`firebase/storage`)
- Path: `propiedades/{codigoPropiedad}/{timestamp}-{nombreSanitizado}`
- Límite: máximo 40 imágenes por propiedad (validado en Firestore Rules)
- Formatos: `image/jpeg`, `image/png`, `image/webp`
- El componente de subida mostrará barra de progreso por archivo
- Las imágenes se redimensionan/comprimen en el cliente antes de subir (Canvas API, sin librerías)

### Generación de slug (`src/lib/propiedades/generarSlug.ts`)

```typescript
// Ejemplo de transformaciones:
// "Casa en El Poblado, Medellín (150 m²)" → "casa-en-el-poblado-medellin-150-m2"
// Pasos: normalizar NFKD → quitar diacríticos → lowercase → reemplazar no-alfanumérico por "-" → trim "-"
```

### Formulario multi-sección

- React Hook Form con `useForm` y `Controller` para selects y campos complejos
- Secciones implementadas como acordeón (un `useState` con el id de la sección activa)
- Validación: `mode: 'onBlur'` para no mostrar errores mientras se escribe
- Los campos opcionales nunca muestran error si están vacíos

### Revalidación de caché de Next.js

Después de crear / editar / eliminar / cambiar estado:
```typescript
revalidatePath('/');                     // Listado público de propiedades
revalidatePath('/admin/propiedades');    // Listado admin
revalidatePath(`/propiedades/${slug}`);  // Detalle de la propiedad (cuando exista)
```

---

## Fuera del alcance de estas 6 fases

Las siguientes funcionalidades quedan deliberadamente fuera para mantener el foco:

| Feature | Razón |
|---------|-------|
| Múltiples roles / usuarios | Solo hay un tipo de admin. Añadir roles es complejidad accidental por ahora. |
| Módulo de mensajes de clientes | Requiere diseño de UX propio. Se puede agregar como Fase 7. |
| Analytics avanzados | Google Analytics / Firebase Analytics cubre esto sin código adicional. |
| Blog / contenido editorial | Fuera del dominio de la plataforma inmobiliaria. |
| Sistema de reservas o citas | Requiere notificaciones, calendario. Alcance muy amplio. |
| Integración con portales externos | MLS, Finca Raíz, etc. Requiere acuerdos comerciales. |
| Módulo de documentos y contratos | Requiere almacenamiento y firma digital. |

---

*Última actualización: Fase 1 por comenzar.*
