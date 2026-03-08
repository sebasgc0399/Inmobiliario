# AGENTS.md - Directrices del Proyecto

Este documento define las reglas activas del proyecto. Cualquier asistente de IA debe leerlo y seguirlo antes de proponer, escribir o modificar codigo.

Nota de sincronizacion:
- `AGENTS.md` es la fuente canonica.
- `.claude/CLAUDE.md` debe mantenerse sincronizado 1:1 con este archivo.

## 1. Contexto Actual (El Cascaron Limpio)
- El proyecto acaba de pasar por un **Reset Nuclear**.
- El estado actual es un boilerplate ultra-limpio de Next.js con App Router y Firebase.
- Hoy solo existen estas rutas publicas estaticas: `/`, `/nosotros`, `/contacto`.
- Hoy solo existe este flujo administrativo activo: `/admin`, `/admin/login`, `/admin/restablecer-contrasena`.
- Todo el codigo anterior relacionado con propiedades, listados, filtros y flujos publicos inmobiliarios fue eliminado.
- Aun no existe un modelo de datos definitivo implementado para `propiedades`.

## 2. Stack Tecnologico
- Next.js con App Router estricto.
- React.
- Tailwind CSS.
- TypeScript.
- Firebase: Firestore, Auth y Admin SDK.

## 3. Filosofia de Desarrollo: Cero Complejidad Accidental
- La regla principal es la simplicidad extrema.
- Primero entender la realidad del negocio; despues modelar codigo.
- Prohibido asumir campos obligatorios que no existan en la realidad fisica del negocio.
- Prohibido crear abstracciones prematuras.
- Preferir soluciones directas, verificables y faciles de mantener.
- Primero descubrir que datos existen de verdad; despues disenar tipos, validaciones, formularios y UI.

## 4. Nuevo Modelo de Negocio Dual (Reglas Estrictas)
- El sistema trabajara con una sola coleccion de Firestore: `propiedades`.
- Cada documento se clasificara con `lineaNegocio: 'inversion' | 'tradicional'`.
- `inversion`: inmuebles embargados provenientes de entidades bancarias.
- `tradicional`: inmuebles de clientes particulares.
- Regla de oro de seguridad: `entidadBancaria` nunca debe llegar al navegador.
- El backend, los Server Components y las Server Actions deben sanitizar ese dato antes de enviar cualquier payload al frontend.
- `entidadBancaria` no debe renderizarse en HTML publico, serializarse a Client Components ni incluirse en respuestas expuestas al cliente.
- Regla de flexibilidad: a un inmueble de `inversion` nunca se le forzaran campos como `habitaciones`, `banos` u otros datos fisicos que el banco no entregue.
- Para `inversion`, asumir que el minimo real disponible puede ser `area`, `precio` y `ubicacion`.
- Cualquier formulario, tipo, filtro, validacion o UI futura debe respetar esa asimetria de datos entre `inversion` y `tradicional`.
- No fijar todavia rutas publicas futuras del modelo dual hasta que el nuevo frontend y el nuevo modelo de datos esten definidos.
