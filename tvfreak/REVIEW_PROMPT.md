# Prompt para Fable: revisa el plan TVFREAK en Google TV

Copia todo lo que hay debajo de la línea en una sesión nueva de Claude Code con el modelo Fable, abierta en `C:\Users\diez fernando\GitHub\NuvioTV`.

---

Quiero una segunda opinión independiente sobre un proyecto personal. No ejecutes nada que escriba fuera de este ordenador. Solo lee, piensa y dime qué harías mejor. Sé directo: si el plan tiene un fallo, dilo, aunque contradiga lo que ya está decidido.

## El objetivo

Quiero una app en mi Google TV que tenga el aspecto de mi diseño TVFREAK y que no quede por debajo de Nuvio en nada: reproductor, addons, Real-Debrid, sincronización, menús y ajustes tienen que seguir funcionando igual o mejor. Si queda por debajo, no me vale.

TVFREAK es mi base de datos de series y películas: lo que veo, por dónde voy y las notas de IMDb y Rotten Tomatoes. Hoy la uso desde una web.

## Las piezas

- **App de la tele:** mi fork de NuvioTV (`fernbs/NuvioTV`, rama `dev`), clonado en esta carpeta. Remotos: `origin` es mi fork y `upstream` es `NuvioMedia/NuvioTV`. Kotlin con Jetpack Compose, unas 259.000 líneas. Se compila solo en GitHub Actions con `.github/workflows/tvfreak.yml` (15 a 30 minutos por compilación) y se instala en la tele. En este portátil no hay entorno Android ni Python, pero sí Node y git.
- **Worker de Cloudflare:** `tvfreak-stremio.lastonteridas.workers.dev`, código en `C:\Users\diez fernando\OneDrive - The Boston Consulting Group, Inc\Desktop\Ai\Projects\Work\Stremio\stremio-addon\worker.js`. Hace tres cosas sobre la base de datos D1 `tvfreak`:
  - Es un addon de Stremio con catálogos propios: "Seguir viendo", "Sugerencias para ti", "Para volver a ver", "Parecidas a".
  - Imita la API de Trakt en `/trakt/...`: OAuth por código de dispositivo, playback, scrobble, historial, watchlist y related. El workflow compila Nuvio con `TRAKT_API_URL` apuntando ahí, así que Nuvio cree que habla con Trakt y en realidad guarda todo en TVFREAK.
  - Sirve la página `/activate` para vincular la tele con un PIN. Hoy añadimos `/activate/<código>`, que rellena el código solo.
- **Web TVFREAK:** `...\Projects\Work\TVFREAK\app` (repo `fernbs/tvfreak`). Es React, sin reproducción. Saca IMDb y RT de OMDb y los guarda en la misma D1.
- **App de acceso directo:** `fernbs/tvfreak-tv`, un WebView a la web. Es secundaria.
- **Diseño de referencia:** el artifact "Mi Nuvio con TVFREAK" (https://claude.ai/artifact/DGg7XSn1eBoMjQCJbogaAb). Tiene tres pantallas:
  - **Inicio:** hero arriba, "Seguir viendo" en tarjetas 16:9 con progreso y chip "Nuevo", y filas de pósters con notas IMDb y RT siempre visibles.
  - **Menú de Seguir viendo:** se abre al mantener pulsado.
  - **Ficha de serie:** botones, episodios con check y barra, y "Parecidas".

## Lo que ya está decidido y por qué

Todo está en `tvfreak/SPEC.md`. Léelo entero. Resumen:

1. **No hay app desde cero.** La web tiene 7.800 líneas sin reproductor, y Nuvio solo en el reproductor tiene unas 58.000. Desde cero no se llega a igualar a Nuvio.
2. **No hay app aparte.** Android no deja poner una piel sobre otra app, y los deep links de Nuvio solo abren fichas.
3. **TVFREAK es una "piel" sobre la disposición MODERN de Nuvio,** no un cuarto valor del enum `HomeLayout`. Nuvio trata MODERN como caso especial en unos 25 sitios: carga de filas, enriquecimiento con TMDB, filas que se cargan al bajar, carpetas y ajustes. La idea es dejar MODERN por debajo y añadir:
   - una preferencia `tvfreak_skin`,
   - un `if` en `HomeScreen.kt` que llama a `TvfreakHomeRoute`,
   - un interruptor en ajustes.
   Los archivos nuevos van en `ui/screens/home/tvfreak/` y parten de una copia de `ModernHomeContent.kt`, `ModernHomeHero.kt`, `ModernHomeRows.kt` y `ModernHomeRowsList.kt`. Se reutilizan sin copiar `ModernHomeModels.kt` y `ModernHomePresentation.kt`.
4. **Los ajustes de Nuvio mandan.** Colores, fuente y barra lateral salen siempre de lo que elijo en la app. La única excepción son los colores de marca de IMDb y RT.
5. **El hero no lleva botones,** porque cambia con el foco. La barra lateral de Nuvio se queda.
6. **El menú de Seguir viendo es el de Nuvio, sin tocar.** Ya tiene Ir a la ficha, Empezar de nuevo, Marcar como visto, Quitar y Reproducir manualmente.
7. **Las notas salen primero de MDBList,** con mi clave gratuita metida en los ajustes de la app. Nuvio ya las pide por lotes de hasta 200 títulos y las guarda 12 horas. Redirigir MDBList a mi worker es posible: la dirección está fija en `core/di/NetworkModule.kt:566`. Pero mi D1 solo tiene notas de los títulos de mi biblioteca, y las sugerencias no están ahí, así que se deja para más tarde.
8. **La ficha propia (Fase 3) queda pendiente.** Nuvio no tiene selector de diseño para la ficha. La vía sería un `if` en `MetaDetailsScreen.kt` que llame a una copia de `MetaDetailsContent`, que es privada, tiene unas 2.000 líneas y unos 100 parámetros. Se decide después de ver la Fase 2 en la tele.

## Estado a 11 nov 2026

- **Fase 1 subida a `dev`** (commit `063724de3`) y compilando en Actions. Incluye:
  - Nombre TVFREAK en los 39 idiomas.
  - Icono y banners con mi calavera pixelada en las 6 variantes del selector de icono de Nuvio.
  - Logo horizontal en lugar de `trakt_logo_wordmark.xml`.
  - "Trakt" cambiado a "TVFREAK" en `values` y `values-es`.
  - El QR usa `state.verificationUrl` en vez de `trakt.tv`.
  El generador de imágenes está en `tvfreak/branding/make-branding.js`.
- **Fase 2,** la disposición TVFREAK del Inicio, está sin empezar. Va en otra sesión cuando la Fase 1 esté probada en la tele.

## Lo que quiero que hagas

Lee `tvfreak/SPEC.md`, el workflow, `worker.js` y el código de Nuvio que haga falta: `ui/screens/home/`, `ui/screens/detail/`, `HomeViewModel*`, `data/mdblist/` y `MainActivity.kt`. Después respóndeme a esto:

1. **¿La estrategia es la buena para llegar al objetivo?** Me refiero al fork, la piel sobre MODERN y la copia de archivos. Si ves una vía mejor, explícala con el coste real. Por ejemplo: tocar menos archivos, usar más lo que Nuvio ya tiene, o algo que hayamos pasado por alto.
2. **¿Dónde corremos riesgo de quedar por debajo de Nuvio?** Piensa en funciones de Modern que la copia podría perder sin que nadie se dé cuenta: foco, carga perezosa, tráilers, restauración del foco, carpetas, modo "Essential" y ajustes que solo afectan a Modern.
3. **¿Cómo bajamos el coste de cada compilación?** Cada error de Kotlin nos cuesta entre 15 y 30 minutos. Por ejemplo:
   - pasos del workflow que se puedan quitar o meter en caché,
   - compilar solo una ABI,
   - un job que solo compile Kotlin sin empaquetar,
   - comprobaciones que se puedan hacer en local sin Android.
4. **¿Cómo nos afectarán las actualizaciones de Nuvio?** Dime una estrategia concreta para traer `upstream/dev` sin romper la piel.
5. **¿El reparto de notas es el mejor?** Comparo tres opciones: MDBList con clave propia, el worker con mi D1 más MDBList, o el worker con OMDb. Ten en cuenta los límites y las notas en tarjetas de títulos que no están en mi biblioteca.
6. **¿Qué del diseño no merece la pena** por lo que cuesta? ¿Y qué falta en el diseño que Nuvio ya da gratis y debería aprovechar?
7. **¿Hay algo mal hecho en la Fase 1** que vaya a dar problemas? Piensa en el QR, los textos cambiados en bloque y las imágenes.

## Formato de la respuesta

- Empieza con tu veredicto en tres frases: seguir así, ajustar o cambiar de rumbo.
- Después, una lista ordenada por impacto. Cada punto con qué cambiarías, por qué, qué cuesta y qué archivos toca, con rutas y números de línea cuando los tengas.
- Separa lo que has comprobado en el código de lo que es opinión.
- En español, frases cortas, sin rayas largas.

## Reglas

- **No escribas nada en GitHub ni en Cloudflare.** Nada de push, workflows, wrangler ni releases. No modifiques archivos del repo. Si quieres proponer código, ponlo en tu respuesta.
- **Nunca muestres secretos.** Las URLs de manifiesto de los addons llevan mi clave de Real-Debrid. No las pidas ni las leas.
- **Si usas `gh` para algo de solo lectura,** hazlo con la cuenta personal: `GH_TOKEN=$(gh auth token -u fernbs)`. No cambies la cuenta activa.
