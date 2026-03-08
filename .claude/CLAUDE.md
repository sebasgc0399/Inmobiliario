# AGENTS.md - Directrices del Proyecto

Este archivo define las reglas operativas canonicas del proyecto.
Aplica a toda propuesta o cambio de codigo y documentacion.

Nota de sincronizacion:
- `AGENTS.md` es la fuente canonica.
- `.claude/CLAUDE.md` debe mantenerse sincronizado 1:1 con este archivo.

## 1. Estado actual post-reset
- El proyecto esta en **Reset Nuclear**.
- El repositorio actual es un cascaron base con Next.js App Router y Firebase.
- Rutas publicas activas: `/`, `/nosotros`, `/contacto`.
- Flujo admin base activo: `/admin`, `/admin/login`, `/admin/restablecer-contrasena`.
- Aun no existe dominio inmobiliario implementado (catalogo, detalle, filtros, CRUD de propiedades).

## 2. Stack tecnologico
- Next.js (App Router estricto).
- React.
- TypeScript.
- Tailwind CSS.
- Firebase: Auth, Firestore y Admin SDK.

## 3. Filosofia operativa: simplicidad extrema
- Evitar complejidad accidental y sobreingenieria.
- Primero entender negocio real, luego modelar codigo.
- No crear abstracciones prematuras.
- No asumir datos obligatorios que el negocio no garantiza.
- Priorizar soluciones directas, verificables y mantenibles.

## 4. Modelo de negocio objetivo (aun no implementado)
- Existira una sola coleccion Firestore: `propiedades`.
- Cada propiedad tendra `lineaNegocio: 'inversion' | 'tradicional'`.
- `tradicional`: inmuebles de clientes particulares.
- `inversion`: inmuebles de oportunidad comercializados por canal bancario o de inversion, con datos potencialmente incompletos y sanitizacion estricta del lado del servidor.
- No fijar todavia rutas publicas futuras del nuevo catalogo hasta definir el modelo y el nuevo frontend.

## 5. Guardrails de seguridad
- `entidadBancaria` jamas debe llegar al cliente.
- `entidadBancaria` no debe renderizarse en HTML publico ni serializarse a Client Components.
- En exposicion publica tambien deben excluirse `referenciaEntidad` y `notasInternas`.
- Toda salida al frontend debe pasar por sanitizacion en backend, Server Components y Server Actions.

## 6. Reglas de modelado de datos
- `Propiedad` es el contrato canonico del dominio en `src/types/propiedad.ts`.
- `PropiedadStorage` existe para persistencia (puede ser alias de `Propiedad` mientras no haya diferencias reales).
- `PropiedadPublica` es DTO sanitizado para cliente/frontend.
- `PropiedadAdmin` cubre el contexto administrativo si requiere campos internos.
- Para `inversion`, no forzar campos como `habitaciones`, `banos` u otros datos fisicos no disponibles.
- Modelar primero con los minimos reales disponibles y luego extender.

## 7. Enfoque server-first
- Resolver lectura, validacion, autorizacion y sanitizacion desde servidor antes de UI compleja.
- Las decisiones de frontend no deben violar reglas de datos ni guardrails de seguridad.
- Cualquier nuevo flujo debe partir del estado real implementado, sin arrastrar supuestos del sistema anterior.
