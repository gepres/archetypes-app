# Arquetipos en voz — V2

La segunda versión de la aplicación. Convive con la primera, no la sustituye.

**La idea:** el test no se lee, se escucha. Y se responde con un gesto. Arriba es sí, abajo es
no. Nada más.

## Por qué existe

El test de la V1 son sesenta afirmaciones que hay que leer y responder en una escala de cinco
puntos. La fricción no está en el contenido: está en leer y en elegir entre cinco cosas cada vez.
La V2 quita las dos: la voz lee, y la respuesta es binaria.

- **Una pantalla, un botón** para empezar.
- **Veinticuatro afirmaciones**, no sesenta. La premisa es pocas acciones.
- **Una acción por afirmación**: tocar la mitad de arriba, la de abajo, deslizar la tarjeta, o
  las flechas del teclado. Todas hacen lo mismo.
- **Nada que pulsar entre preguntas**: al responder, la siguiente arranca sola.
- **La revelación se cuenta en voz alta**, con la ilustración del arquetipo, su mantra y un único
  camino hacia adelante: la versión completa.

## Cómo se ejecuta

Desde la raíz del repositorio, no desde esta carpeta:

| Para | Comando |
|---|---|
| Arrancar la V2 en desarrollo | `npm run dev:v2` |
| Comprobar tipos de la V2 | `npm run lint:v2` |
| Comprobar tipos de las dos | `npm run lint:all` |
| Construir las dos | `npm run build:all` |
| Desplegar las dos | `npm run deploy` |

**Nunca despliegues con `npm run build` a secas.** Ese comando vacía `dist/`, y la V2 vive en
`dist/v2`. Si construyes solo la V1 y despliegas, la V2 desaparece del sitio. Para eso está
`build:all`, y `deploy` ya lo usa.

## De dónde salen los datos

`src/lib/domain.ts` es **el único** punto por el que la V2 toca el dominio: los dieciocho
arquetipos, las afirmaciones, el motor de puntuación y las ilustraciones. Ningún otro fichero de
la V2 importa de `../src`.

Hoy apunta al código de la V1, que es el que está en producción con los dieciocho. No consume
`packages/core` porque ese núcleo se extrajo antes de la ampliación y todavía tiene doce. Cuando
se ponga al día, se reapunta ese fichero y la V2 no se entera.

## La voz

`src/lib/voice.ts` envuelve la síntesis del navegador. No cuesta nada, no necesita clave y
funciona sin conexión; la calidad es la del sistema de cada quien. Todo lo específico de esa API
vive ahí detrás de cuatro funciones, así que cambiarla por una voz de pago no toca ninguna
pantalla.

Dos cosas que ya mordieron y conviene no "arreglar":

- **La primera frase se dice dentro del gesto de "Empezar".** Los navegadores móviles no dejan
  hablar sin una interacción previa; mover esa llamada fuera del `onClick` deja la aplicación
  muda en iOS sin que nada falle.
- **Cada frase tiene un tope de tiempo.** Chrome deja de avisar de que terminó de hablar si la
  pestaña pierde el foco, y sin ese tope el recorrido se queda colgado esperando un aviso que no
  llega.

## Cómo se sirve

Misma carpeta de salida que la V1, en el subdirectorio `v2`, y una reescritura propia en
`firebase.json` **antes** del comodín. El service worker de la V1 lleva `/v2/` en su lista de
exclusión: sin eso respondería a esas navegaciones con su propio índice y la V2 no cargaría nunca
para quien ya tuviera la V1 instalada.
