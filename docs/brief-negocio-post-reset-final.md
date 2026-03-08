# Brief Funcional — Dominio Inmobiliario Post-Reset

> Especificacion funcional derivada de contexto validado por cliente.
> Version final consolidada.
> Fecha: 2026-03-08

---

## 1. Objetivo del producto

Definir el dominio post-reset del portal inmobiliario desde una base simple, mantenible y server-first.

El producto gestiona una sola coleccion Firestore (`propiedades`) con dos lineas de negocio: `tradicional` e `inversion`. La web publica presenta inventario, filtra por linea de negocio y capta interes comercial cualificado.

**Lo que el sitio NO es:**

- No es marketplace ni plataforma de compraventa directa.
- No es motor de subastas ni sistema de pujas.
- No cierra transacciones. Solo genera contacto cualificado.
- No muestra mecanicas internas de entidades bancarias.

---

## 2. Lineas de negocio

### 2.1 Linea Tradicional (`tradicional`)

Inmuebles de clientes particulares que contratan a Isabel para la comercializacion.

- **Origen de datos:** el propietario provee la informacion del inmueble.
- **Completitud:** usualmente alta. Se esperan fotos, descripcion, habitaciones, banos, area, direccion.
- **Flujo:** cliente visita la web, ve el inmueble, contacta a Isabel, agenda visita.

### 2.2 Linea Inversion (`inversion`)

Inmuebles de origen bancario comercializados directamente por Isabel.

**Que SI es:**

- Una linea de inversion inmobiliaria con potencial de rentabilidad.
- Una vitrina de oportunidades inmobiliarias seleccionadas.
- Un canal de captacion de interes para gestion comercial posterior.

**Que NO es:**

- No es subasta publica.
- No hay pujas en linea.
- No hay marketplace de subastas ni de embargos.
- No hay motor de ofertas automaticas.
- No se muestran mecanicas internas del banco.
- No debe comunicarse con lenguaje agresivo de descuento ni con foco en el banco.

**Proceso real:**

1. Isabel obtiene informacion del inmueble desde la entidad bancaria.
2. Publica la informacion basica en la web (sin revelar el banco).
3. El cliente se interesa y contacta a Isabel.
4. Isabel recoge documentos del cliente.
5. Isabel prepara una comunicacion/oferta formal.
6. Isabel presenta la oferta al banco **por fuera de la web**.

**Completitud de datos:**

- Puede llegar con informacion muy basica e incompleta.
- Minimo realista: tipo de inmueble, precio, municipio.
- Puede tener solo 1-2 fotos, o ninguna.
- Campos como habitaciones, banos, area, estrato pueden no existir.

**Tipos de inmueble posibles:** apartamentos, casas, locales, bodegas, lotes, otros.

---

## 3. Reglas de negocio y seguridad

### 3.1 Dato sensible — Regla de oro

`entidadBancaria` es informacion confidencial. Jamas debe:

- Llegar al navegador del cliente.
- Renderizarse en HTML publico.
- Serializarse hacia Client Components.
- Incluirse en respuestas de API expuestas al cliente.

El backend, los Server Components y las Server Actions deben sanitizar este dato antes de enviar cualquier payload al frontend.

### 3.2 Regla de flexibilidad

A un inmueble de `inversion` nunca se le fuerzan campos como `habitaciones`, `banos`, `area` u otros datos fisicos que el banco no entregue. El sistema debe funcionar correctamente con datos minimos.

### 3.3 Financiacion y documentos

Debe existir un bloque o seccion informativa sobre financiacion, requisitos y documentos necesarios. En esta fase se define como contenido editorial fijo (estatico), no como modulo administrable ni CRUD.

### 3.4 Enfoque server-first

Resolver la lectura de datos, sanitizacion y catalogo desde el servidor antes de pensar en UI compleja o interacciones de cliente.

---

## 4. Vocabulario UI recomendado

### 4.1 Nombres permitidos

| Contexto | Opciones recomendadas |
|---|---|
| Tab/pestana de inversion | "Oportunidades de Inversion", "Inversion Inmobiliaria", "Propiedades para Inversion" |
| Descripcion de seccion | "Oportunidades inmobiliarias seleccionadas", "Inmuebles de inversion con potencial de rentabilidad" |
| CTA para inversion | "Me interesa esta oportunidad", "Solicitar asesoria", "Quiero conocer esta oportunidad", "Recibir requisitos y documentos" |
| CTA para tradicional | "Me interesa este inmueble", "Contactar asesora", "Agendar visita", "Hablar con Isabel" |
| Etiqueta de precio (inversion) | "Precio de referencia", "Valor de oportunidad" |
| Seccion informativa | "Como funciona", "Proceso de inversion", "Invierte con respaldo" |

### 4.2 Nombres prohibidos

| Contexto | Nunca usar |
|---|---|
| Tab/pestana | "Embargos", "Remates", "Subastas", "Del banco", "Oportunidades de banco" |
| Descripcion | "Inmuebles embargados", "Baratos del banco", "Remates bancarios" |
| CTA | "Hacer oferta", "Pujar", "Ofertar al banco" |
| Precio | "Precio de remate", "Precio de embargo" |
| Comunicacion general | Mensajes agresivos de descuento, referencias directas a origen bancario |

### 4.3 Tono recomendado

- Informativo.
- Confiable.
- Orientado a acompanamiento comercial.
- Sin promesas de puja, subasta ni descuento agresivo.

---

## 5. Requerimientos funcionales

### 5.1 Catalogo unificado con tabs

- Una sola pagina publica de catalogo.
- Dos tabs: uno para inmuebles tradicionales, otro para oportunidades de inversion.
- El tab activo controla el filtro `lineaNegocio`.
- Ambos tabs usan el mismo componente de card, adaptado a los datos disponibles.

### 5.2 Filtros dinamicos por linea

| Filtro | Tradicional | Inversion |
|---|---|---|
| Tipo de inmueble | Si | Si |
| Ciudad/municipio | Si | Si |
| Precio min/max | Si | Si |
| Area | Si | Si |
| Habitaciones | Si | No (omitir) |
| Banos | Si | No (omitir) |
| Estrato | Si | No (omitir) |

Los filtros deben adaptarse automaticamente al tab activo. Implementar como search params en URL para compatibilidad server-side.

### 5.3 Cards de propiedad adaptativas

- Si un campo no existe (habitaciones, banos, area), **omitirlo** — no mostrar "0".
- Mostrar siempre: titulo, precio, ubicacion disponible, tipo de inmueble, imagen principal.
- Si solo hay 1 imagen, mostrar imagen unica sin carousel.
- Si no hay imagenes, mostrar placeholder generico.

### 5.4 Pagina de detalle

- Galeria adaptativa: 1 imagen sola, 2 imagenes lado a lado, 3+ con grid.
- Seccion de caracteristicas: solo renderizar las que existan.
- Para inversion: incluir bloque "Como funciona" con pasos generales del proceso.
- CTA principal: boton de WhatsApp con mensaje pre-llenado que incluya el codigo de referencia del inmueble.

### 5.5 Formulario de contacto/interes

- Campos: nombre (obligatorio), telefono (obligatorio), email (opcional), mensaje (opcional).
- Para inversion, el placeholder del mensaje puede sugerir: "Me interesa esta oportunidad".
- **No pedir monto de oferta** — eso lo maneja Isabel personalmente.
- Genera un documento en coleccion `contactos` de Firestore.
- Implementar como Server Action con validacion server-side.

### 5.6 Separacion dato publico vs. sensible

**Datos sensibles (solo backend/admin, jamas al cliente):**

- `entidadBancaria`
- `referenciaEntidad`
- `notasInternas`

**Mecanismo:** funcion `sanitizarPropiedad()` que elimina campos sensibles antes de pasar datos a Client Components o serializar a HTML. Debe usarse en todo Server Component y Server Action que entregue datos de propiedad al frontend.

### 5.7 Seccion de financiacion / documentos

- Contenido estatico informativo sobre el proceso de inversion.
- Incluir: pasos del proceso, documentos necesarios, preguntas frecuentes.
- Puede ser una pagina dedicada o un bloque dentro del detalle de inversion.
- En esta fase: contenido editorial fijo. Gestion desde admin en fase futura.

---

## 6. Modelo de datos recomendado

### 6.1 Tipos primitivos

```typescript
type LineaNegocio = 'inversion' | 'tradicional';

type TipoInmueble =
  | 'apartamento'
  | 'casa'
  | 'local'
  | 'bodega'
  | 'lote'
  | 'otro';

type EstadoPublicacion = 'borrador' | 'activo' | 'inactivo' | 'vendido';

type Estrato = 1 | 2 | 3 | 4 | 5 | 6;
```

### 6.2 `Propiedad` - contrato canonico del dominio

`Propiedad` es la fuente de verdad del dominio y debe vivir en `src/types/propiedad.ts`. El resto de variantes (`PropiedadStorage`, `PropiedadPublica`, `PropiedadAdmin`) se derivan de este contrato.

```typescript
interface Propiedad {
  // --- Identificadores (siempre presentes) ---
  id: string;
  slug: string;
  codigoReferencia: string;

  // --- Discriminador ---
  lineaNegocio: LineaNegocio;

  // --- Clasificacion ---
  tipoInmueble: TipoInmueble;
  estadoPublicacion: EstadoPublicacion;

  // --- Contenido ---
  titulo: string;
  descripcion?: string;

  // --- Precio (COP, moneda unica para MVP) ---
  precio: number;
  precioNegociable?: boolean;

  // --- Ubicacion (solo municipio obligatorio) ---
  municipio: string;
  departamento?: string;
  barrio?: string;
  direccion?: string;

  // --- Caracteristicas fisicas (TODAS opcionales) ---
  areaMt2?: number;
  habitaciones?: number;
  banos?: number;
  parqueaderos?: number;
  estrato?: Estrato;

  // --- Media ---
  imagenes: string[]; // puede estar vacio

  // --- SENSIBLES (jamas al frontend) ---
  entidadBancaria?: string;   // solo inversion
  referenciaEntidad?: string; // solo inversion
  notasInternas?: string;     // ambas lineas, uso admin

  // --- Timestamps ---
  creadoEn: Date;
  actualizadoEn: Date;

  // --- Extras ---
  destacado?: boolean;
}
```

### 6.3 `PropiedadStorage` - capa de persistencia Firestore

`PropiedadStorage` representa la forma persistida. En esta arquitectura, por simplicidad y para evitar complejidad accidental, se define como alias del contrato canonico:

```typescript
type PropiedadStorage = Propiedad;
```

Si Firestore exige diferencias reales en el futuro, `PropiedadStorage` puede divergir sin romper `Propiedad` como contrato central.

### 6.4 Justificacion de campos

| Campo | Obligatorio | Aplica a | Justificacion |
|---|---|---|---|
| `id` | Si | Ambas | ID de Firestore |
| `slug` | Si | Ambas | URL amigable, generado automaticamente |
| `codigoReferencia` | Si | Ambas | Referencia para comunicacion con clientes |
| `lineaNegocio` | Si | Ambas | Discriminador del modelo dual |
| `tipoInmueble` | Si | Ambas | Siempre se sabe el tipo |
| `estadoPublicacion` | Si | Ambas | Control de visibilidad |
| `titulo` | Si | Ambas | Siempre se puede generar |
| `descripcion` | No | Ambas | Inversion puede no tener descripcion |
| `precio` | Si | Ambas | Siempre hay precio, aunque sea de referencia |
| `precioNegociable` | No | Ambas | No siempre aplica |
| `municipio` | Si | Ambas | Minimo de ubicacion que siempre existe |
| `departamento` | No | Ambas | Usualmente existe pero no forzar |
| `barrio` | No | Ambas | Inversion puede no tenerlo |
| `direccion` | No | Ambas | Inversion puede no tenerlo |
| `areaMt2` | No | Ambas | Inversion puede tenerlo o no |
| `habitaciones` | No | Mas comun en tradicional | Inversion casi nunca lo tiene |
| `banos` | No | Mas comun en tradicional | Inversion casi nunca lo tiene |
| `parqueaderos` | No | Ambas | No siempre disponible |
| `estrato` | No | Ambas | Especifico de Colombia, no siempre disponible |
| `imagenes` | Si (array) | Ambas | Puede estar vacio, no forzar minimo |
| `entidadBancaria` | No | Solo inversion | **CONFIDENCIAL** — nunca al frontend |
| `referenciaEntidad` | No | Solo inversion | Referencia interna del banco |
| `notasInternas` | No | Ambas | Notas privadas del admin |
| `creadoEn` | Si | Ambas | Audit trail |
| `actualizadoEn` | Si | Ambas | Audit trail |
| `destacado` | No | Ambas | Para resaltar en home |

### 6.5 Decisiones de diseno

1. **Ubicacion aplanada** (no sub-objeto): simplifica queries de Firestore y respeta que inversion puede no tener direccion. Solo `municipio` es obligatorio.
2. **Precio como numero plano en COP**: sin sub-objeto con moneda/admin/impuesto. Si se necesita multi-moneda en el futuro, se agrega sin romper.
3. **Sin sub-objeto `Caracteristicas`**: cada caracteristica es un campo opcional en la raiz. Evita forzar campos que inversion no tiene.
4. **`imagenes` permite array vacio**: inversion puede llegar sin fotos inicialmente.
5. **Sin `modoNegocio`**: siempre es venta en este negocio.
6. **Sin `condicion`** (nuevo/usado): inversion no siempre lo sabe. Se puede agregar como campo opcional en el futuro si se necesita.
7. **`areaMt2` es opcional**: aunque inversion suele tenerlo, no se fuerza como obligatorio.

### 6.6 Tipo `Contacto` (reemplaza el antiguo `leads`)

```typescript
interface Contacto {
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
  mensaje?: string;
  codigoReferencia?: string;
  lineaNegocio?: LineaNegocio;
  estado: 'nuevo' | 'atendido' | 'descartado';
  creadoEn: Date;
}
```

Sin `oferta`, sin `DatosOferta`, sin `EstadoOferta`. El flujo de oferta es manual y personal, no se modela en el sistema.

---

## 7. Separacion entre dominio / storage / admin / publico

La jerarquia de tipos del dominio queda definida en este orden:

1. `Propiedad` (contrato canonico del dominio)
2. `PropiedadStorage` (forma de persistencia en Firestore)
3. `PropiedadPublica` (DTO sanitizado para cliente/frontend)
4. `PropiedadAdmin` (variante para panel/admin)

### 7.1 `Propiedad`

- Es el tipo principal contra el que debe tiparse el dominio.
- Es la fuente de verdad en `src/types/propiedad.ts`.
- Casos de uso, validaciones y logica de negocio deben partir de este contrato.

### 7.2 `PropiedadStorage`

- Existe para modelar la frontera de persistencia.
- En esta definicion, se mantiene como alias de `Propiedad`.

```typescript
type PropiedadStorage = Propiedad;
```

### 7.3 `PropiedadPublica`

- Es el DTO sanitizado que puede exponerse a frontend.
- Nunca incluye `entidadBancaria`, `referenciaEntidad` ni `notasInternas`.
- Es lo unico que puede llegar a Client Components, HTML renderizado o respuestas de API publicas.

```typescript
type CamposSensibles = 'entidadBancaria' | 'referenciaEntidad' | 'notasInternas';

type PropiedadPublica = Omit<Propiedad, CamposSensibles>;
```

### 7.4 `PropiedadAdmin`

- Se mantiene como tipo separado para el panel admin.
- En esta definicion, es alias de `PropiedadStorage`.

```typescript
type PropiedadAdmin = PropiedadStorage;
```

### 7.5 Funcion de sanitizacion

Debe usarse en todo punto donde los datos pasan del servidor al cliente.

```typescript
function sanitizarPropiedad(doc: PropiedadStorage): PropiedadPublica {
  const { entidadBancaria, referenciaEntidad, notasInternas, ...publica } = doc;
  return publica;
}
```

### 7.6 Flujo de datos

```
Firestore -> PropiedadStorage (alias de Propiedad) -> sanitizarPropiedad() -> PropiedadPublica -> Client Component / HTML
                                                    -> PropiedadAdmin -> Panel Admin (Server Component)
```

---

## 8. Fuera de alcance por ahora

- UI final compleja (animaciones, transiciones, microinteracciones).
- Contenido administrable desde el panel (financiacion, requisitos, documentos).
- Automatizaciones comerciales (notificaciones, CRM, seguimiento automatico).
- Logica heredada del sistema anterior.
- Integraciones externas (pasarelas de pago, APIs de terceros, maps).
- Multi-moneda o soporte de precios en USD.
- Sistema de busqueda avanzada (full-text, geolocalizado).
- Roles de usuario mas alla de admin.

---

## 9. Roadmap tecnico inmediato

Fases secuenciales. Cada una verificable antes de pasar a la siguiente.

| Fase | Entregable | Depende de |
|---|---|---|
| 1 | `src/types/propiedad.ts` + `src/types/contacto.ts` con tipos definidos | Este documento |
| 2 | `src/lib/mappers/sanitizarPropiedad.ts` | Fase 1 |
| 3 | `src/lib/firebase/propiedades.ts` — lectura Firestore con Admin SDK + sanitizacion | Fases 1-2 |
| 4 | Seed/mock data — 3-5 propiedades por linea, variando completitud de datos | Fase 1 |
| 5 | Catalogo publico con tabs, cards adaptativas, filtros dinamicos | Fases 3-4 |
| 6 | Detalle de propiedad con galeria adaptativa y CTA WhatsApp | Fase 5 |
| 7 | Formulario de contacto + Server Action + coleccion `contactos` | Fase 1 |
| 8 | Admin CRUD de propiedades | Fase 3 |
| 9 | Actualizar `firestore.rules` para reflejar nuevo modelo | Fase 1 |

**Primer paso concreto:** implementar Fase 1 (tipos TypeScript) seguida inmediatamente de Fase 2 (sanitizacion).

---

## 10. Nota ejecutiva de arquitectura de tipos

Se mantiene `Propiedad` como contrato canonico para preservar una sola fuente de verdad del dominio en `src/types/propiedad.ts`. `PropiedadStorage` cubre la frontera de persistencia (alias actual de `Propiedad`), `PropiedadPublica` define la exposicion sanitizada al cliente y `PropiedadAdmin` separa el contexto del panel administrativo sin mezclarlo con la capa publica.
