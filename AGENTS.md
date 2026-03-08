# AGENTS.md - Contexto y Directrices de Desarrollo Inmobiliario

Este documento define las reglas estrictas de arquitectura, filosofia de codigo y stack tecnologico para este proyecto. Cualquier asistente de IA (Claude, ChatGPT, Cursor, etc.) debe leer y acatar estas directrices antes de proponer o generar codigo.

Nota de sincronizacion:
- `AGENTS.md` es la fuente canonica de estas directrices.
- `.claude/CLAUDE.md` debe mantenerse sincronizado 1:1 con este archivo.

## 1. Contexto y Objetivo del Proyecto
* **Objetivo:** Desarrollar una plataforma web inmobiliaria de alto rendimiento orientada a la conversion y el SEO.
* **Mercado:** Los inmuebles estan ubicados en Colombia (ej. Medellin, Antioquia, etc.), pero el sistema esta disenado para un publico e inversores internacionales (soporte multidivisa, indicativos internacionales, rentabilidad ROI).
* **Foco:** Velocidad de carga, excelente experiencia de usuario (UX) en moviles y un panel de administracion agil.

### 1.1 Modelo de Negocio Dual (Solo Venta)
La plataforma opera bajo dos lineas de negocio estrictamente separadas, clasificadas por el campo `lineaNegocio` en cada propiedad:

1. **Inversion de Oportunidad** (`lineaNegocio: 'inversion'`): Inmuebles embargados provenientes de entidades bancarias. El flujo de compra es manual: el usuario publico propone un monto de oferta a traves del formulario dedicado, y la administradora negocia directamente con el comite del banco. La identidad de la entidad bancaria propietaria es informacion **estrictamente confidencial** (ver Seccion 5).

2. **Corretaje Tradicional** (`lineaNegocio: 'tradicional'`): Propiedades de clientes particulares gestionadas bajo el modelo inmobiliario estandar. Flujo de contacto clasico mediante formulario de consulta y WhatsApp.

* **Restriccion innegociable:** El negocio es **exclusivamente de ventas**. El tipo `ModoNegocio` solo admite el valor `'venta'`. Queda **estrictamente prohibido** implementar logica, tipos, componentes de UI o rutas para "alquileres", "arriendos" o cualquier modalidad de negocio distinta a la venta.

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

### 4.1 Enrutamiento por Linea de Negocio
Las dos lineas de negocio exigen **rutas publicas separadas** para mantener un SEO diferenciado y una experiencia de usuario clara. Queda prohibido unificar ambas lineas en una ruta unica con renderizado condicional masivo.

| Linea | Ruta de detalle | Ruta de listado |
|-------|----------------|-----------------|
| Inversion de Oportunidad | `/inversiones/[slug]` | `/inversiones` |
| Corretaje Tradicional | `/propiedades/[slug]` | `/` (Home con filtros) |

* **Redireccion cruzada:** Si un usuario accede a `/propiedades/[slug]` y la propiedad es de inversion, el Server Component debe ejecutar `redirect('/inversiones/[slug]')`. Lo mismo aplica a la inversa.
* **`CardPropiedad`:** El componente genera su `href` de forma condicional segun `propiedad.lineaNegocio` (`/inversiones/${slug}` o `/propiedades/${slug}`).
* **Pagina estatica `/inversiones/como-funciona`:** Contenido fijo en codigo que explica el proceso de compra de inmuebles embargados. No es editable desde el panel de administracion.

## 5. Seguridad y Rendimiento
* **Seguridad Firestore:** La logica de validacion de base de datos se manejara mediante Reglas de Seguridad de Firestore, pero el frontend debe evitar enviar datos mal formados.
* **Variables de Entorno:** Nunca exponer claves secretas (`NEXT_PUBLIC_...` solo para llaves publicas de Firebase).
* **Imagenes:** Usar siempre el componente `<Image />` de Next.js para carga diferida (lazy loading) y optimizacion de peso, crucial para el SEO inmobiliario.

### 5.1 Regla de Oro de Privacidad — Datos de Inversion
Para las propiedades de la linea de inversion, el campo `entidadBancaria` (nombre del banco propietario del inmueble embargado) es **informacion estrictamente confidencial**. Esta regla es **innegociable** y aplica sin excepciones:

* `entidadBancaria` **NUNCA** debe renderizarse en el HTML publico de ninguna pagina.
* **NUNCA** debe pasarse como prop a un Client Component.
* Solo debe ser accesible en Firestore y visible en el panel de administracion (`/admin`).
* Los demas campos de `DatosInversion` (como `documentosRequeridos` o `aceptaContraoferta`) **si** pueden exponerse al publico, ya que son informacion util para el comprador potencial.
* **Verificacion obligatoria:** Al modificar la pagina `/inversiones/[slug]`, inspeccionar el HTML fuente renderizado para confirmar la ausencia total del nombre de la entidad bancaria.

## 6. Pruebas (Testing)
* El codigo generado debe estar disenado para ser testeable (funciones puras donde sea posible, inyeccion de dependencias simple).
* Se priorizaran pruebas de integracion para los flujos criticos (busqueda de inmuebles, calculo de precios, envio de formularios).

## 7. Autenticacion y Rutas Protegidas
* **Proveedor:** Usar Firebase Authentication para el acceso al panel de administracion. Evitar librerias externas de auth de terceros para no duplicar infraestructura.
* **Seguridad de Rutas:** Proteger rutas del panel `/admin/:path*` usando el Proxy nativo de Next.js en `src/proxy.ts`.
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
* **Fuente de verdad:** `src/types/propiedad.ts` define el contrato de datos central del proyecto. Toda operacion con Firestore, todo componente que muestre o edite una propiedad, y toda funcion de utilidad deben tiparse contra la interfaz `Propiedad` y sus sub-interfaces (`Ubicacion`, `Precio`, `Caracteristicas`, etc.) definidas en ese archivo.
* **Clasificacion del inventario:** El campo `lineaNegocio: LineaNegocio` (`'inversion' | 'tradicional'`) actua como discriminador principal. Determina la ruta publica, el formulario de contacto/oferta, los badges visuales y la logica de filtrado.
* **Datos de inversion aislados:** La sub-interfaz `DatosInversion` encapsula los campos exclusivos de la linea de inversion (`entidadBancaria`, `referenciaEntidad`, `precioListadoBanco`, `documentosRequeridos`, `notasInternas`, `aceptaContraoferta`). Se almacena en `propiedad.inversion?` y solo se popula cuando `lineaNegocio === 'inversion'`.
* **Modo de negocio congelado:** `ModoNegocio` queda reducido al valor unico `'venta'`. Existe por compatibilidad de esquema pero no debe usarse como criterio de logica o filtrado. El discriminador real es `lineaNegocio`.
* **Contrato de leads:** `src/types/lead.ts` define el contrato complementario para leads y ofertas. Incluye `CamposFormularioOferta` para el flujo de inversion y `DatosOferta` para el seguimiento del proceso de negociacion con el banco.
