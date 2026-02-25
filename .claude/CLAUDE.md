# AGENTS.md - Contexto y Directrices de Desarrollo Inmobiliario

Este documento define las reglas estrictas de arquitectura, filosofia de codigo y stack tecnologico para este proyecto. Cualquier asistente de IA (Claude, ChatGPT, Cursor, etc.) debe leer y acatar estas directrices antes de proponer o generar codigo.

Nota de sincronizacion:
- `AGENTS.md` es la fuente canonica de estas directrices.
- `.claude/CLAUDE.md` debe mantenerse sincronizado 1:1 con este archivo.

## 1. Contexto y Objetivo del Proyecto
* **Objetivo:** Desarrollar una plataforma web inmobiliaria de alto rendimiento orientada a la conversion y el SEO.
* **Mercado:** Los inmuebles estan ubicados en Colombia (ej. Medellin, Antioquia, etc.), pero el sistema esta disenado para un publico e inversores internacionales (soporte multidivisa, indicativos internacionales, rentabilidad ROI).
* **Foco:** Velocidad de carga, excelente experiencia de usuario (UX) en moviles y un panel de administracion agil.

## 2. Stack Tecnologico
* **Framework Core:** Next.js (App Router estricto).
* **Libreria UI:** React (Functional Components, Hooks).
* **Estilos:** Tailwind CSS (uso de clases utilitarias, evitar CSS personalizado a menos que sea estrictamente necesario).
* **Lenguaje:** TypeScript (tipado estricto, no usar `any`).
* **Backend / BaaS:** Firebase (Firestore para base de datos, Storage para imagenes).

## 3. Filosofia de Desarrollo: Complejidad Esencial vs. Accidental
* **Abrazar la Complejidad Esencial:** Si el problema de negocio es dificil (ej. cruzar filtros complejos de busqueda inmobiliaria, manejar conversiones de moneda en tiempo real o estructurar buen SEO dinamico), la solucion puede requerir codigo avanzado. No sacrifiques la robustez por hacer el codigo mas corto.
* **Eliminar la Complejidad Accidental:** Prohibido introducir herramientas, librerias o abstracciones innecesarias que compliquen el mantenimiento.
    * *Ejemplo:* No instales Redux si Zustand o el Context API nativo es suficiente.
    * *Ejemplo:* No crees abstracciones de componentes genericos prematuras si solo se van a usar una vez.
* **Regla de Oro:** La solucion mas simple y directa que resuelva el problema real de forma segura y eficiente es siempre la correcta.

## 4. Arquitectura y Buenas Practicas (Next.js & React)
* **Server vs. Client Components:**
    * Priorizar *Server Components* por defecto para consultas a Firestore (ej. listados de propiedades) para maximizar el SEO y la velocidad.
    * Usar *Client Components* (`"use client"`) unica y exclusivamente cuando se requiera interactividad (ej. barras de filtros, botones de contacto, sliders de imagenes).
* **Serializacion de Datos:** Nunca pasar objetos no planos (como `Timestamp` de Firebase) desde Server Components a Client Components. Usar siempre `withConverter` en Firestore para mapear a `Date` o strings ISO.
* **UI / UX:** Los componentes deben ser accesibles y 100% responsivos (Mobile-First).

## 5. Seguridad y Rendimiento
* **Seguridad Firestore:** La logica de validacion de base de datos se manejara mediante Reglas de Seguridad de Firestore, pero el frontend debe evitar enviar datos mal formados.
* **Variables de Entorno:** Nunca exponer claves secretas (`NEXT_PUBLIC_...` solo para llaves publicas de Firebase).
* **Imagenes:** Usar siempre el componente `<Image />` de Next.js para carga diferida (lazy loading) y optimizacion de peso, crucial para el SEO inmobiliario.

## 6. Pruebas (Testing)
* El codigo generado debe estar disenado para ser testeable (funciones puras donde sea posible, inyeccion de dependencias simple).
* Se priorizaran pruebas de integracion para los flujos criticos (busqueda de inmuebles, calculo de precios, envio de formularios).

## 7. Autenticacion y Rutas Protegidas
* **Proveedor:** Usar Firebase Authentication para el acceso al panel de administracion. Evitar librerias externas de auth de terceros para no duplicar infraestructura.
* **Seguridad de Rutas:** Proteger rutas del panel `/admin/:path*` usando el Middleware nativo de Next.js en `src/middleware.ts`.
* **Rutas Publicas Admin:** Permitir acceso sin cookie de sesion a `/admin/login` y `/admin/restablecer-contrasena`.

## 8. Convenciones de Codigo y Nomenclatura
* **Idioma del Dominio (Espanol):** Nombres de interfaces, tipos, variables propias del negocio y componentes visuales deben ir en espanol (ej. `Propiedad`, `modoNegocio`, `CardPropiedad`, `FiltrosBusqueda`).
* **Idioma Tecnico (Ingles):** Hooks de React (`useState`, `useEffect`), utilidades nativas de Next.js, metodos de Firebase y sintaxis del lenguaje mantienen su nombre oficial en ingles.
* **Casing:**
    * `PascalCase` para Componentes e Interfaces -> `CardPropiedad.tsx`, `interface Propiedad`
    * `camelCase` para variables, funciones y hooks -> `formatearPrecio.ts`, `usePropiedades.ts`
    * `kebab-case` para segmentos de URL publicos en App Router -> `propiedades/[slug]/page.tsx`
    * Excepcion para route groups de App Router: `(publico)` y `(privado)`; estos grupos no forman parte de la URL publica.

## 9. Formularios
* **Libreria obligatoria:** Usar React Hook Form para todos los formularios del proyecto (panel de administracion, filtros de busqueda, contacto).
* **Regla general:** Evitar manejar formularios campo a campo con `useState`. Solo se permite `useState` para estado UI simple (ej. toggle de un modal).
* **Excepcion temporal vigente:**
    * `src/components/FiltrosBusqueda.tsx` aun usa `useState` para filtros.
    * `src/app/contacto/page.tsx` aun no implementa formulario funcional (placeholder).
* **Cierre de excepcion:** Cuando se migren filtros y se implemente el formulario de contacto, aplicar React Hook Form en esos flujos y retirar esta excepcion temporal.

## 10. Modelo de Datos Canonico
* **Fuente de verdad:** `src/types/propiedad.ts` define el contrato de datos central del proyecto.
* Toda operacion con Firestore, todo componente que muestre o edite una propiedad, y toda funcion de utilidad deben tiparse contra la interfaz `Propiedad` y sus sub-interfaces (`Ubicacion`, `Precio`, `Caracteristicas`, etc.) definidas en ese archivo.
