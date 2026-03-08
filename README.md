# Portal Inmobiliario - Cascaron Base

Boilerplate limpio construido con Next.js (App Router), Tailwind CSS y Firebase (Auth, Admin SDK).

## Estado Actual

El proyecto acaba de pasar por un **Reset Nuclear**. Hoy es un lienzo en blanco seguro, enfocado unicamente en la autenticacion base y en rutas estaticas. Todo el codigo complejo anterior fue eliminado para reconstruir el sistema desde una base mas simple, clara y controlada.

## Vision de Arquitectura (Proximos Pasos)

El sistema evolucionara hacia un modelo dual: **Tradicional** e **Inversion Bancaria**, alimentado por una sola coleccion NoSQL llamada `propiedades`.

Regla de Oro de Seguridad: aunque exista una sola base de datos, el sistema sanitizara estrictamente los datos desde el servidor para asegurar que `entidadBancaria` jamas llegue al cliente final. Esa sanitizacion protege directamente el modelo de negocio.

## Vision de Experiencia de Usuario (UX/UI)

El catalogo publico sera una sola pagina unificada. La navegacion principal del inventario se resolvera con un sistema de `Tabs` para alternar entre **Tradicional** y **Oportunidades de Banco** sin fragmentar la experiencia.

## Filtros Dinamicos

Los filtros de busqueda deben ser inteligentes e hiper-simples.

Si el usuario esta en la pestana de **Oportunidades de Banco**, el sistema nunca debe preguntar por `habitaciones` o `banos`. En ese contexto, los filtros deben limitarse a datos basicos como `area`, `precio`, `ciudad` y `tipo`.
