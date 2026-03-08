# Brief de Negocio Post-Reset

> Documento canonico funcional/comercial del nuevo ciclo post-reset.
> Fecha: 2026-03-08

---

## 1. Resumen del negocio

El proyecto se encuentra en Reset Nuclear y actualmente opera como un cascaron base tecnico.
La meta es reconstruir el dominio inmobiliario desde cero, con reglas claras de datos, seguridad y simplicidad.

El sistema objetivo tendra una sola coleccion Firestore (`propiedades`) y dos lineas de negocio:
- `tradicional`
- `inversion`

El sitio no cierra transacciones. Su funcion principal es captar interes comercial calificado para gestion posterior.

---

## 2. Dos lineas de negocio

### 2.1 `tradicional`

Inmuebles de clientes particulares.
Normalmente llegan con mayor completitud de datos fisicos y comerciales.

### 2.2 `inversion`

Inmuebles de oportunidad comercializados por canal bancario o de inversion, con datos potencialmente incompletos y sanitizacion estricta del lado del servidor.

---

## 3. Que es y que no es `inversion`

### Que si es

- Una vitrina de oportunidades inmobiliarias.
- Un canal de captacion de interesados para gestion comercial posterior.
- Un flujo asesorado, sin exposicion de informacion interna de terceros.

### Que no es

- No es subasta publica.
- No es sistema de pujas.
- No es marketplace de embargos o remates.
- No automatiza presentacion de ofertas al originador del inmueble.

---

## 4. Implicaciones de UX

- No fijar todavia rutas publicas futuras del catalogo mientras no exista el nuevo modelo y frontend.
- El lenguaje de `inversion` debe ser neutral y profesional; evitar copy de remates, embargos o pujas.
- Si en el futuro hay filtros por linea de negocio, `inversion` no debe forzar `habitaciones`, `banos` u otros campos que pueden no existir.
- La experiencia debe enfocarse en descubrimiento y contacto, no en cierre transaccional en linea.

---

## 5. Implicaciones de datos

- Coleccion unica: `propiedades`.
- Campo obligatorio de clasificacion: `lineaNegocio: 'inversion' | 'tradicional'`.
- Modelado asimetrico: `inversion` puede operar con dataset incompleto.
- Seguridad obligatoria: `entidadBancaria` nunca debe llegar al cliente.
- En exposicion publica tambien deben excluirse `referenciaEntidad` y `notasInternas`.
- Sanitizacion obligatoria en backend, Server Components y Server Actions antes de exponer datos.
- El contrato canonico del dominio debe centralizarse en `src/types/propiedad.ts` con `Propiedad` como tipo principal.

---

## 6. Estado actual del repositorio

Actualmente solo estan implementados:
- Rutas publicas estaticas: `/`, `/nosotros`, `/contacto`.
- Flujo admin base: `/admin`, `/admin/login`, `/admin/restablecer-contrasena`.
- Base de autenticacion/sesion administrativa con Firebase.

El dominio inmobiliario (catalogo, detalle, filtros, CRUD de propiedades y contacto de oportunidades) aun no esta implementado.
