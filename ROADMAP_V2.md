# ROADMAP_V2 - Panel Admin IsaHouse (Fuente de Verdad)

## 1. Proposito y Alcance del Documento

Este documento define, de forma cerrada y ejecutable, el plan de desarrollo del panel de administracion de IsaHouse.
Su objetivo es eliminar ambiguedades tecnicas y de producto para que la implementacion se ejecute sin decisiones abiertas.

Alcance de esta version:

- Modulo de inmuebles (CRUD operativo completo).
- Modulo de leads (captura y gestion).
- Modulo de auditoria (trazabilidad de acciones admin).
- Modulo SEO operativo por inmueble.
- Dashboard consolidado para operacion diaria.

No incluye tiempos ni estimaciones por fase.

---

## 2. Decisiones Cerradas

### 2.1 Arquitectura base

- Framework: Next.js App Router.
- Dominio y tipado canonico: `src/types/propiedad.ts`.
- Seguridad de acceso admin: Firebase Auth + custom claim `admin` + `middleware.ts`.
- Rutas admin protegidas: `/admin/*` salvo rutas publicas de login/restablecimiento.

### 2.2 Estrategia de mutaciones (resuelve contradiccion del roadmap anterior)

- Subida de imagenes: SDK cliente (`firebase/storage`) para progreso por archivo en UI.
- Mutaciones de Firestore: Server Actions con Admin SDK (`firebase-admin/firestore`).
- Eliminaciones: primero archivos en Storage con Admin SDK, luego documento Firestore.

### 2.3 Flujo editorial

- Todo inmueble nuevo inicia como `borrador`.
- Publicacion es manual por accion explicita del admin.
- `publicadoEn` solo se define al pasar a `activo`.

### 2.4 Alcance V1 confirmado

- V1 incluye: Inmuebles + Leads + Auditoria + SEO.
- Sin integraciones automaticas a portales externos en esta etapa.

### 2.5 Complejidad y gobernanza

- Un solo rol admin por ahora.
- Riesgos y bloqueantes son obligatorios por fase.
- Este roadmap es decision-complete.

---

## 3. Estado Actual del Proyecto

Estado actual (base verificada en repo):

- Auth admin implementado con cookie `__session`.
- Login admin y restablecimiento de contrasena implementados.
- `middleware.ts` protegiendo rutas `/admin/*`.
- Modelo `Propiedad` establecido en `src/types/propiedad.ts`.
- Reglas Firestore y Storage existentes.
- Conversor Firestore con `propiedadConverter` ya presente.
- Panel privado actual aun sin shell de navegacion definitivo.
- No existe aun CRUD admin de propiedades.
- No existen modulos de Leads, Auditoria ni SEO admin.

Brecha principal:

- Existe base tecnica de seguridad y datos, pero no existe capa operativa admin completa.

---

## 4. Arquitectura Objetivo del Admin

### 4.1 Estructura de rutas

- `src/app/admin/(publico)/...` para login y recuperacion.
- `src/app/admin/(privado)/...` para panel autenticado.
- El layout privado no debe renderizar Navbar/Footer publicos.

### 4.2 Separacion de responsabilidades

- Server Components para lectura y render inicial de datos admin.
- Client Components solo para interaccion (formularios, filtros, modales, progresos).
- Server Actions para mutaciones de negocio en Firestore.

### 4.3 Seguridad de mutaciones

- Cada Server Action valida sesion admin antes de operar.
- Las validaciones de entrada se ejecutan en servidor antes de persistir.
- Firestore Rules se mantienen como capa de defensa adicional.

### 4.4 Caching y revalidacion

Despues de mutaciones de inmuebles:

- `revalidatePath('/admin')`
- `revalidatePath('/admin/propiedades')`
- `revalidatePath('/')`
- `revalidatePath('/propiedades/[slug]')` cuando aplique

Despues de mutaciones de leads:

- `revalidatePath('/admin')`
- `revalidatePath('/admin/leads')`

Despues de mutaciones SEO:

- `revalidatePath('/admin/seo')`
- `revalidatePath('/propiedades/[slug]')` cuando aplique

---

## 5. Contratos de Datos y Tipos Canonicos

### 5.1 Fuente de verdad del dominio inmobiliario

- `src/types/propiedad.ts` se mantiene como contrato canonico para inmuebles.
- Toda lectura/escritura/render de inmuebles se tipa contra `Propiedad`.

### 5.2 Nuevos tipos a introducir

- `src/types/lead.ts`
  - `interface Lead`
  - `type EstadoLead = 'nuevo' | 'contactado' | 'calificado' | 'cerrado' | 'descartado'`
  - `type OrigenLead = 'formulario_web' | 'whatsapp' | 'telefono' | 'manual'`
- `src/types/auditoria.ts`
  - `interface EventoAuditoriaAdmin`
  - `type TipoAccionAdmin`
  - `type EntidadAuditada = 'propiedad' | 'lead' | 'seo' | 'sesion'`
- `src/types/seo-admin.ts`
  - `interface DiagnosticoSEOPropiedad`

Todos exportados desde `src/types/index.ts`.

### 5.3 Contratos de entrada/salida para acciones

Se definen DTOs de formulario y respuestas estandar:

```ts
type ResultadoAccion<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
```

### 5.4 Politica de unicidad

- `slug` unico global en coleccion `propiedades`.
- `codigoPropiedad` unico global en coleccion `propiedades`.
- La unicidad se asegura en servidor con transaccion.
- Se reservan documentos de unicidad en:
  - `slugUnicos/{slug}`
  - `codigoUnicos/{codigoPropiedad}`

---

## 6. Roadmap por Fases (Ejecutable Completo)

## Fase 0 - Fundaciones de Arquitectura

### Objetivo de negocio

Definir una base estable para implementar el resto del panel sin retrabajo.

### Entregables funcionales

- Contrato tecnico del admin cerrado.
- Layout privado desacoplado de UI publica.
- Convencion de Server Actions y validacion uniforme.

### Archivos/rutas esperadas

- `src/app/admin/(privado)/layout.tsx` (actualizado).
- `src/app/admin/(privado)/page.tsx` (dashboard base limpio).
- `src/lib/admin/auth/validarSesionAdmin.ts` (nuevo).
- `src/lib/admin/actions/tipos.ts` (nuevo, `ResultadoAccion`).

### Contratos/API/tipos involucrados

- Uso de `Propiedad` como contrato base.
- Firma comun para respuestas de acciones.

### Reglas de negocio

- Toda mutacion admin requiere sesion valida con claim `admin`.
- Ninguna accion admin depende del SDK cliente para escritura Firestore.

### Criterios de aceptacion

- Shell admin sin Navbar/Footer publicos.
- Patron uniforme de respuesta de acciones definido.
- Validacion de sesion reusable lista.

### Pruebas minimas requeridas

- Prueba de acceso no autorizado a rutas privadas.
- Prueba de rechazo de accion sin sesion admin.

### Riesgos y mitigaciones

- Riesgo: duplicar validaciones en varias acciones.
- Mitigacion: helper comun `validarSesionAdmin`.

### Bloqueantes explicitos

- Ninguno.

---

## Fase 1 - Shell de Panel y Navegacion Admin

### Objetivo de negocio

Dar al admin una interfaz clara y rapida para operar modulos.

### Entregables funcionales

- Sidebar con navegacion principal.
- Topbar con sesion y logout.
- Responsive mobile-first.

### Archivos/rutas esperadas

- `src/components/admin/SidebarAdmin.tsx`
- `src/components/admin/TopbarAdmin.tsx`
- `src/app/admin/(privado)/layout.tsx`

### Contratos/API/tipos involucrados

- Sin cambios de contrato de datos.

### Reglas de negocio

- Links minimos:
  - `/admin`
  - `/admin/propiedades`
  - `/admin/propiedades/nueva`
  - `/admin/leads`
  - `/admin/auditoria`
  - `/admin/seo`

### Criterios de aceptacion

- Link activo resaltado con `usePathname`.
- Navegacion funcional en desktop y mobile.
- Logout accesible y visible.

### Pruebas minimas requeridas

- Prueba visual de navegacion mobile.
- Prueba de logout exitoso.

### Riesgos y mitigaciones

- Riesgo: exceso de complejidad visual inicial.
- Mitigacion: priorizar claridad y jerarquia simple.

### Bloqueantes explicitos

- Ninguno.

---

## Fase 2 - Listado Admin de Inmuebles

### Objetivo de negocio

Permitir control operativo de todo el inventario (no solo activos).

### Entregables funcionales

- Tabla/lista admin de propiedades.
- Filtro por estado, buscador por titulo/codigo.
- Acciones rapidas por fila.

### Archivos/rutas esperadas

- `src/app/admin/(privado)/propiedades/page.tsx`
- `src/lib/propiedades/obtenerTodasLasPropiedadesAdmin.ts`
- `src/components/admin/TablaPropiedadesAdmin.tsx`

### Contratos/API/tipos involucrados

- `Propiedad`
- `EstadoPublicacion`

### Reglas de negocio

- Orden por defecto: `actualizadoEn desc`.
- Mostrar todos los estados.
- Click en fila abre edicion.

### Criterios de aceptacion

- Tabla usable en mobile y desktop.
- Filtros y busqueda estables.
- Estado y destacado visibles por fila.

### Pruebas minimas requeridas

- Consulta admin de todos los estados.
- Filtro por estado y busqueda por codigo.

### Riesgos y mitigaciones

- Riesgo: consulta pesada al crecer inventario.
- Mitigacion: paginacion y limites server-side.

### Bloqueantes explicitos

- Ajuste de indices Firestore para consultas admin.

---

## Fase 3 - Creacion de Inmuebles (Flujo Hibrido)

### Objetivo de negocio

Publicar inmuebles de forma segura y rapida, con validacion completa.

### Entregables funcionales

- Formulario completo en React Hook Form.
- Subida multiple de imagenes con progreso.
- Server Action de creacion en Firestore.

### Archivos/rutas esperadas

- `src/app/admin/(privado)/propiedades/nueva/page.tsx`
- `src/components/admin/FormularioPropiedad.tsx`
- `src/lib/propiedades/crearPropiedadAccion.ts`
- `src/lib/propiedades/generarSlug.ts`
- `src/lib/propiedades/unicidad.ts`

### Contratos/API/tipos involucrados

- `Propiedad`
- `PropiedadFormularioInput` (nuevo DTO)
- `ResultadoAccion`

### Reglas de negocio

- Estado por defecto: `borrador`.
- `slug` autogenerado editable antes de guardar.
- Validacion de unicidad en servidor (`slug`, `codigoPropiedad`).

### Criterios de aceptacion

- Errores por campo.
- Carga de imagenes antes de guardar documento.
- Redireccion con feedback de exito.

### Pruebas minimas requeridas

- Creacion valida con imagenes.
- Rechazo por slug/codigo duplicado.

### Riesgos y mitigaciones

- Riesgo: documento guardado sin imagenes por fallo parcial.
- Mitigacion: flujo transaccional y manejo de rollback.

### Bloqueantes explicitos

- Definir formato final de `codigoPropiedad`.

---

## Fase 4 - Edicion de Inmuebles

### Objetivo de negocio

Editar cualquier inmueble sin perder consistencia ni SEO.

### Entregables funcionales

- Reutilizacion de formulario con datos iniciales.
- Manejo de imagenes existentes y nuevas.
- Server Action de actualizacion.

### Archivos/rutas esperadas

- `src/app/admin/(privado)/propiedades/[id]/editar/page.tsx`
- `src/lib/propiedades/obtenerPropiedadPorId.ts`
- `src/lib/propiedades/actualizarPropiedadAccion.ts`

### Contratos/API/tipos involucrados

- `Propiedad`
- `PropiedadFormularioInput`

### Reglas de negocio

- `slug` visible pero no editable en edicion.
- `actualizadoEn` siempre se refresca.

### Criterios de aceptacion

- Pre-carga completa y estable.
- Imagenes no tocadas no se re-suben.
- Estado editable desde formulario.

### Pruebas minimas requeridas

- Edicion sin cambios de imagen.
- Edicion con nuevas imagenes y eliminacion de existentes.

### Riesgos y mitigaciones

- Riesgo: perdida accidental de `imagenPrincipal`.
- Mitigacion: regla de seleccion obligatoria de principal.

### Bloqueantes explicitos

- Ninguno.

---

## Fase 5 - Estado, Destacado y Eliminacion Segura

### Objetivo de negocio

Ejecutar acciones operativas rapidas sin abrir formulario completo.

### Entregables funcionales

- Cambio de estado por fila.
- Toggle de destacado por fila.
- Eliminacion irreversible con confirmacion.

### Archivos/rutas esperadas

- `src/lib/propiedades/cambiarEstadoPropiedadAccion.ts`
- `src/lib/propiedades/toggleDestacadoPropiedadAccion.ts`
- `src/lib/propiedades/eliminarPropiedadAccion.ts`
- `src/components/admin/BotonCambiarEstado.tsx`
- `src/components/admin/BotonEliminar.tsx`

### Contratos/API/tipos involucrados

- `EstadoPublicacion`
- `ResultadoAccion`

### Reglas de negocio

- Si pasa a `activo` desde `borrador`, setear `publicadoEn`.
- Eliminar primero assets Storage y luego documento Firestore.

### Criterios de aceptacion

- Refresco sin recarga completa de pagina.
- Confirmacion explicita de irreversibilidad.
- Sin archivos huerfanos en Storage tras eliminar.

### Pruebas minimas requeridas

- Cambio de estado con transicion `borrador -> activo`.
- Eliminacion completa de documento + assets.

### Riesgos y mitigaciones

- Riesgo: fallo parcial en borrado de archivos.
- Mitigacion: registrar errores y abortar borrado de documento si quedan assets.

### Bloqueantes explicitos

- Estandar para parsear path de Storage desde URL.

---

## Fase 6 - Leads (CRM Basico)

### Objetivo de negocio

Gestionar demanda comercial desde contacto inicial hasta cierre.

### Entregables funcionales

- Captura de lead desde formulario publico.
- Bandeja admin de leads con pipeline de estados.
- Asignacion simple y notas operativas.

### Archivos/rutas esperadas

- `src/types/lead.ts`
- `src/app/contacto/page.tsx` (formulario RHF real)
- `src/lib/leads/crearLeadAccion.ts`
- `src/app/admin/(privado)/leads/page.tsx`
- `src/lib/leads/obtenerLeadsAdmin.ts`
- `src/lib/leads/actualizarEstadoLeadAccion.ts`

### Contratos/API/tipos involucrados

- `Lead`
- `EstadoLead`
- `ResultadoAccion`

### Reglas de negocio

- Estado inicial lead: `nuevo`.
- Historial basico de cambios de estado.
- Referencia opcional a `propiedadId` o `slug`.

### Criterios de aceptacion

- Lead visible en admin tras envio publico.
- Cambio de estado inmediato y persistente.
- Filtros por estado y busqueda por contacto.

### Pruebas minimas requeridas

- Alta de lead desde publico.
- Cambio de estado en panel admin.

### Riesgos y mitigaciones

- Riesgo: spam de formulario publico.
- Mitigacion: rate limiting basico y validaciones server-side.

### Bloqueantes explicitos

- Definir estrategia anti-spam definitiva.

---

## Fase 7 - Auditoria de Acciones Admin

### Objetivo de negocio

Tener trazabilidad completa para control operativo y soporte.

### Entregables funcionales

- Registro de eventos de auditoria en mutaciones criticas.
- Vista admin de auditoria con filtros.

### Archivos/rutas esperadas

- `src/types/auditoria.ts`
- `src/lib/auditoria/registrarEventoAuditoria.ts`
- `src/lib/auditoria/obtenerEventosAuditoria.ts`
- `src/app/admin/(privado)/auditoria/page.tsx`

### Contratos/API/tipos involucrados

- `EventoAuditoriaAdmin`
- `TipoAccionAdmin`

### Reglas de negocio

- Toda accion critica crea evento:
  - crear/editar/eliminar propiedad
  - cambiar estado de propiedad
  - cambiar estado de lead
  - cambios SEO manuales

### Criterios de aceptacion

- Eventos consultables por entidad, accion y fecha.
- Registro contiene actor, entidad, id, timestamp, resultado.

### Pruebas minimas requeridas

- Verificar registro automatico en mutaciones de propiedades y leads.
- Verificar filtros de consulta en vista de auditoria.

### Riesgos y mitigaciones

- Riesgo: volumen alto de logs.
- Mitigacion: politicas de retencion y paginacion.

### Bloqueantes explicitos

- Definir politica de retencion de eventos.

---

## Fase 8 - SEO Operativo + Dashboard Consolidado

### Objetivo de negocio

Aumentar calidad SEO de inventario y visibilidad ejecutiva del estado operativo.

### Entregables funcionales

- Modulo SEO con checklist por inmueble.
- Dashboard con metricas de inmuebles, leads y SEO.
- Accesos rapidos a pendientes.

### Archivos/rutas esperadas

- `src/types/seo-admin.ts`
- `src/lib/seo/diagnosticarSEOPropiedad.ts`
- `src/app/admin/(privado)/seo/page.tsx`
- `src/lib/propiedades/obtenerMetricasAdmin.ts`
- `src/lib/leads/obtenerMetricasLeadsAdmin.ts`
- `src/app/admin/(privado)/page.tsx`

### Contratos/API/tipos involucrados

- `DiagnosticoSEOPropiedad`
- DTOs de metricas admin

### Reglas de negocio

- Checklist SEO minimo:
  - titulo SEO presente y longitud recomendada
  - meta descripcion presente y longitud recomendada
  - imagen principal valida
  - slug valido
- Dashboard prioriza pendientes accionables.

### Criterios de aceptacion

- SEO score visible por inmueble.
- Dashboard con accesos filtrados a pendientes.
- Metricas consistentes con datos reales.

### Pruebas minimas requeridas

- Validacion de score SEO en inmuebles completos e incompletos.
- Verificacion de metricas cruzadas (inmuebles/leads/SEO).

### Riesgos y mitigaciones

- Riesgo: score SEO poco util si reglas son demasiado laxas.
- Mitigacion: checklist basado en criterios minimos claros y revisables.

### Bloqueantes explicitos

- Definir umbrales oficiales de score SEO.

---

## 7. Riesgos y Bloqueantes por Fase (Resumen Consolidado)

| Fase | Riesgo principal | Mitigacion | Bloqueante |
|---|---|---|---|
| 0 | Validaciones dispersas | Helper comun de sesion y resultado | Ninguno |
| 1 | Shell sobrecargado | Priorizar claridad y jerarquia | Ninguno |
| 2 | Consultas costosas | Paginacion + indices | Ajustes de indices |
| 3 | Guardado parcial | Flujo transaccional y rollback | Formato final de codigo |
| 4 | Perdida de imagen principal | Regla de seleccion obligatoria | Ninguno |
| 5 | Borrado parcial de assets | Abort y registro de error | Parseo robusto de path Storage |
| 6 | Spam de leads | Rate limit + validacion server | Estrategia anti-spam definitiva |
| 7 | Alto volumen de auditoria | Retencion + paginacion | Politica de retencion |
| 8 | SEO score no accionable | Criterios claros y medibles | Umbrales oficiales SEO |

---

## 8. Criterios Globales de Calidad

- TypeScript estricto sin `any`.
- React Hook Form en todos los formularios.
- Separacion clara Server/Client Components.
- Uso de `next/image` en vistas publicas y admin cuando aplique.
- Validaciones de entrada en servidor para toda mutacion.
- Firestore/Storage Rules alineadas a contratos.
- Accesibilidad minima:
  - labels en campos
  - foco visible
  - mensajes de error claros

---

## 9. Fuera de Alcance (Actualizado)

Funcionalidades que quedan fuera de esta etapa:

- Integraciones automaticas con portales externos (MLS, Finca Raiz, etc.).
- Multi-rol avanzado (editor, supervisor, legal, etc.).
- Workflow de aprobacion multinivel.
- Sistema completo de citas/reservas.
- Firma digital y gestion documental legal.
- Automatizaciones avanzadas de marketing.

Nota:

- Se deja la arquitectura preparada para agregar integraciones externas en una fase futura.

---

## 10. Definicion de "Listo para Implementar"

El roadmap se considera listo cuando:

- No hay contradicciones tecnicas abiertas.
- Cada fase tiene objetivo, entregables y criterios de cierre verificables.
- Cada fase define riesgos, mitigaciones y bloqueantes.
- Contratos de datos y acciones estan especificados.
- Casos de prueba minimos estan explicitados.
- No quedan decisiones de arquitectura pendientes para el implementador.

Checklist final de preparacion:

- [x] Estrategia hibrida de mutaciones cerrada.
- [x] Alcance V1 completo cerrado.
- [x] Flujo editorial cerrado (`borrador` por defecto).
- [x] Politica de unicidad definida.
- [x] Riesgos y bloqueantes por fase documentados.
- [x] Fuera de alcance actualizado.

