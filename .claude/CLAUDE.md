# AGENTS.md - Contexto y Directrices de Desarrollo Inmobiliario

Este documento define las reglas estrictas de arquitectura, filosofía de código y stack tecnológico para este proyecto. Cualquier asistente de IA (Claude, ChatGPT, Cursor, etc.) debe leer y acatar estas directrices antes de proponer o generar código.

## 1. Contexto y Objetivo del Proyecto
* **Objetivo:** Desarrollar una plataforma web inmobiliaria de alto rendimiento orientada a la conversión y el SEO.
* **Mercado:** Los inmuebles están ubicados en Colombia (ej. Medellín, Antioquia, etc.), pero el sistema está diseñado para un público e inversores internacionales (soporte multidivisa, indicativos internacionales, rentabilidad ROI).
* **Foco:** Velocidad de carga, excelente experiencia de usuario (UX) en móviles y un panel de administración ágil.

## 2. Stack Tecnológico
* **Framework Core:** Next.js (App Router estricto).
* **Librería UI:** React (Functional Components, Hooks).
* **Estilos:** Tailwind CSS (Uso de clases utilitarias, evitar CSS personalizado a menos que sea estrictamente necesario).
* **Lenguaje:** TypeScript (Tipado estricto, no usar `any`).
* **Backend / BaaS:** Firebase (Firestore para base de datos, Storage para imágenes).

## 3. Filosofía de Desarrollo: Complejidad Esencial vs. Accidental
* **Abrazar la Complejidad Esencial:** Si el problema de negocio es difícil (ej. cruzar filtros complejos de búsqueda inmobiliaria, manejar conversiones de moneda en tiempo real o estructurar buen SEO dinámico), la solución puede requerir código avanzado. No sacrifiques la robustez por hacer el código más corto.
* **Eliminar la Complejidad Accidental:** Prohibido introducir herramientas, librerías o abstracciones innecesarias que compliquen el mantenimiento.
    * *Ejemplo:* No instales Redux si Zustand o el Context API nativo es suficiente.
    * *Ejemplo:* No crees abstracciones de componentes genéricos prematuras si solo se van a usar una vez.
* **Regla de Oro:** La solución más simple y directa que resuelva el problema real de forma segura y eficiente es siempre la correcta.

## 4. Arquitectura y Buenas Prácticas (Next.js & React)
* **Server vs. Client Components:**
    * Priorizar *Server Components* por defecto para consultas a Firestore (ej. listados de propiedades) para maximizar el SEO y la velocidad.
    * Usar *Client Components* (`"use client"`) única y exclusivamente cuando se requiera interactividad (ej. barras de filtros, botones de contacto, sliders de imágenes).
* **Serialización de Datos:** Nunca pasar objetos no planos (como `Timestamp` de Firebase) desde Server Components a Client Components. Usar siempre `withConverter` en Firestore para mapear a `Date` o strings ISO.
* **UI / UX:** Los componentes deben ser accesibles y 100% responsivos (Mobile-First).

## 5. Seguridad y Rendimiento
* **Seguridad Firestore:** La lógica de validación de base de datos se manejará mediante Reglas de Seguridad de Firestore, pero el frontend debe evitar enviar datos mal formados.
* **Variables de Entorno:** Nunca exponer claves secretas (`NEXT_PUBLIC_...` solo para llaves públicas de Firebase).
* **Imágenes:** Usar siempre el componente `<Image />` de Next.js para carga diferida (lazy loading) y optimización de peso, crucial para el SEO inmobiliario.

## 6. Pruebas (Testing)
* El código generado debe estar diseñado para ser testeable (funciones puras donde sea posible, inyección de dependencias simple).
* Se priorizarán pruebas de integración para los flujos críticos (búsqueda de inmuebles, cálculo de precios, envío de formularios).

## 7. Autenticación y Rutas Protegidas
* **Proveedor:** Usar Firebase Authentication para el acceso al panel de administración. Evitar librerías externas de auth de terceros para no duplicar infraestructura.
* **Seguridad de Rutas:** Proteger las rutas del panel de control (ej. `/admin/*`) utilizando el Middleware nativo de Next.js (`middleware.ts`).

## 8. Convenciones de Código y Nomenclatura
* **Idioma del Dominio (Español):** Nombres de interfaces, tipos, variables propias del negocio y componentes visuales deben ir en español (ej. `Propiedad`, `modoNegocio`, `CardPropiedad`, `FiltrosBusqueda`).
* **Idioma Técnico (Inglés):** Hooks de React (`useState`, `useEffect`), utilidades nativas de Next.js, métodos de Firebase y sintaxis del lenguaje mantienen su nombre oficial en inglés.
* **Casing:**
    * `PascalCase` para Componentes e Interfaces → `CardPropiedad.tsx`, `interface Propiedad`
    * `camelCase` para variables, funciones y hooks → `formatearPrecio.ts`, `usePropiedades.ts`
    * `kebab-case` para carpetas de rutas de Next.js App Router → `propiedades/[slug]/page.tsx`

## 9. Formularios
* **Librería obligatoria:** Usar React Hook Form para todos los formularios del proyecto (panel de administración, filtros de búsqueda, contacto).
* **Prohibido** manejar formularios campo a campo con `useState`. Solo se permite `useState` para estado UI simple (ej. toggle de un modal).

## 10. Modelo de Datos Canónico
* **Fuente de verdad:** `src/types/propiedad.ts` define el contrato de datos central del proyecto.
* Toda operación con Firestore, todo componente que muestre o edite una propiedad, y toda función de utilidad deben tiparse contra la interfaz `Propiedad` y sus sub-interfaces (`Ubicacion`, `Precio`, `Caracteristicas`, etc.) definidas en ese archivo.
