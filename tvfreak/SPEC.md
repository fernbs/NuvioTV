# TVFREAK dentro de NuvioTV: especificación

Versión 0.3, 11 nov 2026. Aprobada. Tras la revisión de Fable: enganches en Modern en vez de copiarlo, y recursos propios en `app/src/full/res`. La sección "v0.3" manda sobre las secciones 1 a 9 cuando no coinciden. Fork `fernbs/NuvioTV`, rama `dev`.
Diseño de referencia: artifact "Mi Nuvio con TVFREAK" (Inicio, menú de Seguir viendo, Ficha).

Rutas de código: todo cuelga de `app/src/main/java/com/nuvio/tv/`.

---

## 0. Reglas del proyecto

1. Nada por debajo de Nuvio. Toda función que Nuvio tiene sigue funcionando igual: reproductor, addons, Real-Debrid, sincronización, menús, ajustes.
2. Solo se cambia cómo se ve y cómo se organiza. Los datos y las acciones son siempre los de Nuvio (sus ViewModel, repositorios y callbacks).
3. Lo nuevo va en archivos nuevos con prefijo `Tvfreak`, en `ui/screens/home/tvfreak/`. En los archivos de Nuvio solo se añaden enganches de una línea marcados `// TVFREAK`. Textos e imágenes propios van en `app/src/full/res`, nunca en `app/src/main/res`.
4. Todo lo que se pueda resolver con un ajuste dentro de la app no se programa.
5. Los ajustes de Nuvio mandan. El diseño TVFREAK no fija colores ni menús: usa el tema que elijas en la app (incluido el Personalizado), la barra lateral que elijas (por ejemplo la moderna, flotante y oculta) y el resto de opciones de Nuvio. Solo cambia la colocación y la forma de los elementos. Las únicas excepciones son los colores de marca de IMDb (amarillo) y Rotten Tomatoes (rojo y verde) en las notas.

---

## v0.3. Cambios tras la revisión de Fable (mandan sobre lo de abajo)

**Inicio: enganches en Modern, sin copia.** Modern ya tiene hero arriba, notas MDBList en el hero y tarjeta de Seguir viendo 16:9 con progreso, minutos restantes y chip de nuevo (estilo "CARD" en ajustes). Copiar sus 4.244 líneas congelaría unos 28 ajustes y se quedaría atrás (unos 25 cambios por trimestre en upstream). Se descartan: `TvfreakHomeContent/Hero/Rows/RowsList`, `TvfreakContinueWatchingCard`, la preferencia `tvfreak_skin` y el interruptor. Lo único que se añade:

| Elemento | Cómo | Archivos |
|---|---|---|
| Notas IMDb y RT en cada póster de catálogo | `ui/screens/home/tvfreak/TvfreakRatingBadges.kt` (nuevo), llamado desde el Box de la imagen de `ModernCarouselCard`, en la esquina superior izquierda (la derecha es del check de visto) | `ModernHomeRows.kt`, 1 a 3 líneas `// TVFREAK` |
| Datos | `item.heroPreview.mdbListRatings`, que Nuvio ya rellena por lotes con "mostrar en el hero" activado | Ninguno |

La fila Seguir viendo no lleva notas: Nuvio no las carga ahí.

Enganche extra (probado en la tele que hacía falta): Modern no rehace las tarjetas cuando solo llegan notas, porque compara el tamaño de `catalogRows`, no la lista. En `HomeViewModelPresentationPipeline.kt` (`distinctUntilChanged`) se compara la referencia de `catalogRows`, una línea `// TVFREAK`.

**Ficha (Fase 3):** sin copia de `MetaDetailsContent`. Como mucho 2 o 3 enganches (contador "3 de 10 vistos", botón de marcar temporada), a decidir con la tele delante.

Propuesta v0.3.1 (pendiente de tu OK):
- Contador "3 de 10 vistos" debajo de las pestañas de temporada: `ui/screens/home/tvfreak/TvfreakSeasonProgress.kt` (nuevo, sin foco), dentro del `item` `season_tabs` de `MetaDetailsScreen.kt`: el `Box` pasa a `Column` y se añade la llamada debajo de `SeasonTabs`, dos líneas `// TVFREAK`. No va como `item` aparte porque Nuvio calcula a mano la posición de la fila de capítulos (`episodeListItemIndex`). Cuenta igual que Nuvio en `isSeasonFullyWatched`: visto en `watchedEpisodes` o progreso completado. Texto en `app/src/full/res` (`values` y `values-es`).
- Botón de marcar temporada: no se añade. Nuvio ya lo hace con mantener OK en la pestaña de la temporada y en el menú de cada capítulo. Un botón entre las pestañas y los capítulos rompe el paso con el mando (Abajo salta de las pestañas a los capítulos), y arreglarlo pide más enganches en el foco.

**Textos e imágenes:** van en `app/src/full/res/` (el flavor que compilamos), que pisa a `main`. `app/src/main/res` vuelve a estar como en upstream. Solo `values` y `values-es`. Se arreglan también `trakt_awaiting_instruction` y `trakt_status_enter_activation_code`, que mandaban a trakt.tv. Se sustituyen el logo y el splash de Nuvio (`app_logo_wordmark*.png`, `app_logo_mark.png`).

**Workflow:** activar Dolby Vision perfil 7 (`DOVI_*` como en `local.example.properties`), saltar lint vital en el release, y que los `sed` fallen si no encuentran la línea.

**Worker:** bloqueo del código tras 5 PIN fallidos en `/activate`.

**Filas del addon (11 nov):** Series viendo, Series pendientes (apuntadas sin ningún capítulo visto), Al día, Series vistas, Películas viendo (a medias en la tele, la web no tiene ese estado), Películas pendientes, Películas vistas, más Sugerencias, Para volver a ver y Abandonadas. El orden y las filas ocultas se eligen en la tele: Ajustes > Addons > "Reordenar catálogos del inicio". Índices en `watchedEpisodes(watchedAt)` y `movies(status, updatedAt)` para no agotar las lecturas gratis de D1. Además, `sync/watched/shows` y `sync/history/episodes` salen de una instantánea comprimida en D1 (`tv_cache`, 1 fila) que solo se rehace cuando cambia lo visto (huella: `tv_activity.episodes` y `MAX(watchedAt)`) o cada 6 horas. Antes cada página que pedía Nuvio leía todos los capítulos vistos.

**Listas propias (12 nov, solo películas):** listas temporales, por ejemplo "Navidad" para las vacaciones, que luego se borran. El worker implementa la parte de listas de Trakt que usa Nuvio (`users/{id}/lists`: ver, crear, editar, borrar, reordenar, y sus `items`: ver, añadir, quitar) con dos tablas propias en D1:
- `tv_lists`: id, nombre, descripción, privacidad, orden, creada, actualizada.
- `tv_list_items`: lista, tmdbId, imdbId, título, año, póster, sinopsis, orden, fecha. Clave (lista, tmdbId).
Reglas:
- Solo películas. Si añades una serie, el worker responde 0 añadidas y Nuvio enseña su error de "no se pudo añadir".
- Añadir a una lista no toca la biblioteca (tabla `movies`) ni ningún estado de la web.
- Al añadir, el worker pide a TMDB los datos una sola vez y los guarda, así la fila no llama a TMDB.
- "Eliminar lista" en la tele borra la lista y sus items de verdad. Las películas de la biblioteca no se tocan.
- Cada lista con alguna película sale como fila del addon `tvf_list_<id>` (tipo película, con el nombre de la lista). Una lista vacía no sale. Nuvio relee el manifiesto cada 6 horas, o al momento con "actualizar" en Ajustes > Addons.
- La web TVFREAK ve y edita las mismas listas (12 nov). Las listas son las mismas en los dos sitios, no hay copia ni sincronización.

**Listas en la web (12 nov, solo películas):**
- Tablas: las mismas `tv_lists` y `tv_list_items` de la base `tvfreak`. La web las crea con la migración `0004_lists.sql` (`CREATE TABLE IF NOT EXISTS`, mismo esquema que el worker de la tele), así la instancia de Alfon no se rompe si algún día recibe el código.
- Rutas nuevas en `tvfreak-worker`: `GET /api/lists` (con número de películas), `POST /api/lists` (crear), `PATCH /api/lists/:id` (renombrar), `DELETE /api/lists/:id` (borra la lista y sus películas, pide confirmación en la web), `GET /api/lists/:id/items`, `POST /api/lists/:id/items` (añadir), `DELETE /api/lists/:id/items/:tmdbId` (quitar). Cada cambio actualiza `tv_lists.updatedAt`.
- Al añadir desde la web, la propia web manda tmdbId, imdbId (lo pide a TMDB si no lo tiene), título, año, póster y sinopsis. Sin imdbId la película no sale en la fila de la tele, así que la web avisa si no lo encuentra.
- Ficha de película: botón "Add to list" que abre una hoja con tus listas (marcadas las que ya la tienen) y "New list". Sirve igual para películas de la biblioteca o de la búsqueda, y no toca su estado.
- Biblioteca, modo películas: una fila de chips con las listas. Al elegir una, se ven sus películas. Desde el chip se renombra o se borra la lista.
- Inicio, pestaña "Watching now": cada lista con películas sale como una sección con su nombre, debajo de las series y antes de "Films" (al final quedaba fuera de la vista). Las películas de una lista ya no salen en la sección general "Films", se ven solo en la de su lista (en todas sus listas si está en varias). La sección enseña todas las películas de la lista, estén o no en la biblioteca. Una papelera junto al nombre borra la lista (pide confirmación), y sus películas vuelven a "Films" si les toca. El estado de la película no cambia, así que en la tele sigue saliendo también en "Películas pendientes". Todo se lee con una sola llamada, `GET /api/lists/items` (todas las películas de todas las listas, con su `listId`).
- Textos en inglés, como el resto de la web.
- En la tele: lo añadido a una lista que ya tiene fila sale en unos 2 minutos. Una lista nueva sale como fila cuando Nuvio relee el manifiesto (hasta 6 horas, o al momento con "actualizar" en Ajustes > Addons).

Watchsomuch: descartado.

**Ajustes en la tele (sin código):** apagar los comentarios (el worker no devuelve reseñas), MDBList con clave propia y "mostrar en el hero" activado, estilo "CARD" en Seguir viendo.

**Pendiente apuntado:** el worker rellenaba `imdbRating` con la nota de TMDB en las sugerencias (`worker.js:183`). Arreglado en local el 11 nov (se quita el campo), falta desplegar. Ojo: la web TVFREAK también guarda la nota de TMDB en la columna `imdbRating` de las series, así que las filas de biblioteca del addon la siguen mandando como IMDb. IntroDB y cuenta Nuvio no se activan (sus claves no son públicas).

**Actualizaciones de Nuvio:** merge semanal de `upstream/dev` (no rebase), con `rerere` activado, y tras cada merge contar los `// TVFREAK` para comprobar que no se ha perdido ningún enganche. Lo hace `tvfreak/upstream-merge.sh`, que comprueba cada archivo de `tvfreak/hooks.txt` y que `app/src/main/res` sigue igual que en upstream. No sube nada: el push y la compilación se piden aparte.

---

## 1. Decisión de arquitectura (v0.2, sustituida en parte por v0.3)

**Propuesta: TVFREAK como "piel" de Modern, no como cuarto valor del enum.**

Lo que pediste era añadir `TVFREAK` al enum `HomeLayout`. Al revisarlo, Nuvio trata `MODERN` como caso especial en unos 25 sitios (carga de filas, enriquecimiento con TMDB, filas que se cargan al bajar, títulos traducidos, carpetas, ajustes). Si TVFREAK es un valor nuevo, hay que cambiar cada uno a `MODERN || TVFREAK`, y si un día Nuvio añade otro chequeo de `MODERN`, el nuestro se rompe en silencio. Eso va contra la regla 3.

La alternativa toca muchas menos líneas:

- `HomeLayout` sigue siendo `MODERN`. Todo el motor de datos de Nuvio funciona exactamente como en Modern.
- Se añade una preferencia `tvfreak_skin` (sí/no, por defecto sí en nuestra compilación).
- En `HomeScreen.kt`, dentro de la rama `MODERN`, un único `if`: si la piel está activa, `TvfreakHomeRoute`, si no, `ModernHomeRoute`.
- En Ajustes > Disposición, un interruptor "Diseño TVFREAK" junto a Modern. Si algo falla, lo apagas y tienes el Modern de siempre, sin reinstalar.

Coste: unas 25 líneas en 4 archivos de Nuvio, frente a unas 60 en 12 archivos con el enum.

---

## 2. Datos comunes

| Dato | De dónde sale en Nuvio | De dónde sale en origen |
|---|---|---|
| Seguir viendo (en curso y siguiente capítulo) | `HomeUiState.continueWatchingItems`, montado en `HomeViewModelContinueWatching.kt` desde `WatchProgressRepository.allProgress` | Tu worker, vía la emulación de Trakt (`/trakt/sync/playback`, `sync/watched/shows`, `sync/history`) |
| Próximos estrenos | `HomeUiState.upcomingItems` | Igual, más TMDB para fechas |
| Filas de catálogo | `HomeUiState.catalogRows` / `homeRows`, `HomeViewModelCatalogPipeline.kt` | Los addons instalados. Las filas TVFREAK salen de tu addon (`tvf_watching`, `tvf_recs_series`, `tvf_rewatch`...) |
| Hero (fondo, logo, sinopsis, año, géneros) | `ModernHomePresentationState` + `enrichedPreviews` | Meta del addon, enriquecida con TMDB |
| Notas IMDb y RT | `MetaPreview.mdbListRatings` (filas) y `HeroPreview` / `mdbListRatings` (hero) | MDBList, con tu clave. Ver sección 5 |
| Progreso de un capítulo | `ContinueWatchingItem.InProgress` (posición y duración) | Tu worker vía Trakt |
| Colores | `NuvioTheme.colors` (fondo, superficies, texto, acento) y `NuvioTheme.focusRing` (marco de foco) | El tema que elijas en los ajustes de Nuvio. Nada fijo en nuestro código salvo IMDb y RT |

Requisito de uso, no de código: tu addon TVFREAK tiene que estar instalado en Nuvio por su URL de manifiesto para que salgan "Sugerencias para ti" y "Para volver a ver". **Pendiente de confirmar que lo está.**

---

## 3. Pantalla 1: Inicio

### Qué hace hoy Modern

- Fondo a pantalla completa con la imagen del elemento enfocado. El hero sigue al foco (con 450 ms de espera) y muestra logo o título, notas, año, géneros y sinopsis. No tiene botones, el foco vive siempre en las filas.
- Filas en vertical: Seguir viendo primero, luego catálogos de los addons. Al bajar se cargan más filas.
- Navegación en la barra lateral de toda la app (Inicio, Buscar, Biblioteca, Ajustes).
- OK en Seguir viendo reproduce. OK en un póster abre la ficha. Mantener OK abre un menú.

### Qué pide tu diseño y cómo lo resuelvo

| Elemento del diseño | Cómo queda | Datos |
|---|---|---|
| Hero arriba, ocupando el 54% de la pantalla, degradado oscuro abajo | Copia de `ModernHomeHero.kt` con nuevas medidas y degradado | Igual que Modern |
| Antetítulo "Capítulo nuevo el 12 nov" en verde azulado | Nuevo. Solo si el elemento enfocado tiene un capítulo próximo o recién salido | `upcomingItems` y `ContinueWatchingItem.NextUp` (fecha de emisión) |
| Título grande | Se usa el logo si existe, como Modern. Si no, el título con la fuente que elijas en los ajustes de Nuvio | `HeroPreview.logo` / `title` |
| Notas grandes: IMDb y Rotten Tomatoes | Componente nuevo `TvfreakRatingBadges` (grande) | `mdbListRatings.imdb` y `.tomatoes` |
| Sinopsis, máximo 3 líneas | Igual que Modern | `HeroPreview.description` |
| Botones "Ver T1 · E5" y "Ficha" | **Propongo quitarlos.** El hero cambia con el foco, así que llegar a sus botones con el mando obliga a subir y pierde el elemento. OK y mantener OK ya hacen lo mismo desde la tarjeta | - |
| Barra superior "Inicio · Buscar · Biblioteca · Ajustes" | **Se usa la barra lateral de Nuvio, la que elijas en sus ajustes** (ahora tienes la moderna, flotante y oculta). No se toca `MainActivity.kt` | Ajustes de Nuvio |
| Fila "Seguir viendo · desde TVFREAK" | Encabezado con título y subtítulo pequeño en gris | Fija |
| Tarjeta de Seguir viendo 16:9 | Componente nuevo `TvfreakContinueWatchingCard`: imagen, degradado, título, línea "T3 · E4 · quedan 22 min", barra de progreso blanca, chip "Nuevo" arriba a la izquierda, notas arriba a la derecha | Imagen del capítulo o fondo de la serie. Minutos restantes = duración menos posición. "Nuevo" si es `NextUp` emitido hace 7 días o menos |
| Filas de pósters 2:3 con nombre de la fila y "tu addon" | Copia de la fila de Modern con pósters verticales y subtítulo con el nombre del addon | `catalogRows` |
| Notas pequeñas en cada póster (IMDb amarillo, RT rojo), siempre visibles | Componente `TvfreakRatingBadges` (pequeño) | `MetaPreview.mdbListRatings`. Nuvio ya las pide por lotes para la fila enfocada y la siguiente. Las filas lejanas se rellenan al acercarte |
| Foco: marco de color y escala 1,04 | El marco usa `NuvioTheme.focusRing`, es decir, el color del tema que elijas. La escala y el estilo de tarjeta respetan los ajustes de tarjetas de Nuvio cuando existen | Tema de Nuvio |
| Antetítulo y chip "Nuevo" | Color de acento del tema, no un verde fijo | Tema de Nuvio |

### Lo que se mantiene igual que Modern (para no quedar por debajo)

Carga de filas al bajar, guardado y recuperación del foco al volver de una ficha, Atrás devuelve la fila al principio, tráiler de fondo si está activado, menú al mantener OK en pósters (Ficha, Biblioteca, Marcar visto), transición del fondo al abrir la ficha.

---

## 4. Pantalla 2: menú de Seguir viendo

**Propuesta: no se toca.** Nuvio ya tiene este menú (`ContinueWatchingOptionsDialog` en `ui/components/ContinueWatchingSection.kt:1117`), compartido por todas las disposiciones.

| Opción del diseño | En Nuvio |
|---|---|
| Ir a la ficha | Sí, "Ir a los detalles", con el foco por defecto |
| Empezar desde el principio | Sí, solo en capítulos a medias |
| Marcar como visto | Sí. Va a `sync/history` de tu worker, así que se marca en TVFREAK |
| Quitar (borra el progreso) | Sí. Va a `DELETE sync/playback/<id>` de tu worker |
| (no está en el diseño) | "Reproducir manualmente", para elegir fuente. Se queda, es una función más |

Diferencias visuales: Nuvio no pone el subtítulo gris bajo cada opción ("vuelve a 0:00"). El foco sale del color de tu tema. Para añadir los subtítulos habría que tocar el componente compartido o copiarlo. No compensa, propongo dejarlo.

---

## 5. Notas de IMDb y Rotten Tomatoes (punto 6 de tu lista)

**Comprobado:** se puede redirigir MDBList a tu worker igual que Trakt. La dirección está escrita en `core/di/NetworkModule.kt:566` y se cambia con una línea en el workflow. El worker tendría que responder `GET /mdblist/{imdb|tmdb}/{movie|show}/{id}` y `POST` por lotes con el formato de MDBList.

**El problema es de datos, no de código.** Tu base de datos solo tiene IMDb y RT de los títulos que están en tu biblioteca TVFREAK (los saca de OMDb). Las filas de sugerencias y "Parecidas" son títulos que no tienes, y para esos el worker tendría que pedirlos fuera igualmente.

**Recomendación:** fase 1 sin código. Te das de alta gratis en MDBList, metes la clave en Ajustes > MDBList de la app y activas "mostrar en el hero". Nuvio agrupa las peticiones (hasta 200 títulos por petición) y guarda 12 horas en disco, así que el límite diario gratuito sobra para una tele. Si en la práctica falla el límite o faltan notas, entonces montamos la ruta en el worker, que consulta tu base de datos primero y MDBList después, con caché.

Nota: la clave de MDBList la escribes tú en la tele. No me la pegues en el chat.

---

## 6. Pantalla 3: Ficha

### Qué hace hoy Nuvio

`MetaDetailsScreen.kt` (3.570 líneas) con su ViewModel (3.143). Tiene hero con fondo, logo, notas MDBList, botones (Reproducir / Continuar, Biblioteca, Tráiler, Marcar visto), selector de temporadas, episodios con progreso y marca de visto, reparto, "Más como esto", colección, comentarios, tráiler incrustado. La elección de fuente es otra pantalla (`StreamScreen`), así que cualquier ficha nueva la hereda gratis.

### Qué pide tu diseño

| Elemento | En Nuvio hoy | Cambio |
|---|---|---|
| Línea de datos "Serie · 2021 · 3 temporadas" | Parecida | Estilo |
| Título grande | Logo o título | Estilo |
| Notas grandes IMDb y RT | Sí, `MDBListRatingsRow` | Nuestro componente |
| Botones Continuar T3·E4 / Marcar temporada vista / Tráiler | Continuar y Tráiler sí. Marcar temporada está en el menú del episodio | Añadir botón, la acción ya existe en el ViewModel |
| "Temporada 3 · 3 de 10 vistos, sincronizado con TVFREAK" | Selector de temporada sin contador | Contador calculado de `watchedEpisodes` |
| Episodios 16:9 con check blanco y barra de progreso | Sí, con otro estilo | Estilo |
| Fila "Parecidas" | Sí, "Más como esto" | Estilo y nombre |
| Reparto, comentarios, colección | Sí | Se mantienen debajo |

### ¿Admite variante tan fácil como el Inicio? No tanto. Esto es lo que implica

- Nuvio no tiene selector de diseño para la Ficha. Hay que crear el enganche.
- La pantalla se divide en unas 800 líneas de "pegamento" (foco, tráiler, animación de entrada, botón Atrás, reproducción) y unas 2.000 de dibujo (`MetaDetailsContent`, privada, con unos 100 parámetros).
- **Camino recomendado:** un único `if` en `MetaDetailsScreen.kt` que llama a `TvfreakMetaDetailsContent` en lugar de `MetaDetailsContent`, con los mismos parámetros. Reutilizamos todo el pegamento. Pero las funciones auxiliares privadas de ese archivo hay que copiarlas a nuestro archivo, y `MetaDetailsScreen.kt` es uno de los archivos que Nuvio cambia más a menudo. Si Nuvio añade un parámetro, nuestra copia deja de compilar hasta que la ajustemos (es un aviso claro, no un fallo silencioso).
- Tamaño: parecido al Inicio, en torno a 2.000 líneas copiadas y ajustadas.

**Recomendación:** no prometo la Fase 3 hasta ver la Fase 2 en la tele. Con tu tema y las notas MDBList activas, la Ficha de Nuvio ya se acerca bastante a tu diseño. Decidimos con la tele delante.

---

## 7. Fase 1: marca, textos y QR (una compilación)

| Cambio | Dónde | Cómo |
|---|---|---|
| Nombre "TVFREAK" | `app_name` en `res/values/strings.xml` y `values-es` | Edición directa en el fork |
| Icono | `res/mipmap-*/ic_launcher*.png` (48 a 192) | PNG generados por mí desde la calavera, con vista previa antes |
| Banner Google TV | `mipmap-xhdpi/banner.png` 320x180 y `drawable-nodpi/tv_banner.png` 1920x1080 | Igual |
| Logo horizontal | `res/drawable/trakt_logo_wordmark.xml` | Vector nuevo con la calavera y "TVFREAK" |
| Textos "Trakt" a "TVFREAK" | 89 textos en `values` y 89 en `values-es` | Sustitución revisada a mano (hay frases que hablan de Trakt como servicio, se revisan una a una) |
| QR | `TrackingProviderDialogs.kt:121` | El QR usa la dirección que devuelve el worker (`<worker>/activate/<código>`), no `trakt.tv` |
| Ruta `/activate/<código>` | `stremio-addon/worker.js` | Abre la página de activación con el código ya escrito. Solo falta el PIN |
| Tema | Ajuste en la tele | El que elijas entre los de Nuvio o el Personalizado. Sin código |

Despliegue: commit y push al fork (te aviso antes), lanzar el workflow, desplegar el worker con wrangler (te aviso antes).

---

## 8. Cambios en archivos de Nuvio (lista cerrada)

| Archivo | Cambio | Fase |
|---|---|---|
| `res/values*/strings.xml` | Nombre y textos Trakt | 1 |
| `res/mipmap-*`, `drawable*` | Imágenes | 1 |
| `ui/screens/settings/TrackingProviderDialogs.kt` | 1 línea del QR | 1 |
| `data/local/LayoutPreferenceDataStore.kt` | Preferencia `tvfreak_skin` (unas 10 líneas) | 2 |
| `ui/screens/home/HomeScreen.kt` | 1 `if` dentro de la rama MODERN | 2 |
| `ui/screens/settings/LayoutHomeSettings.kt` | Interruptor "Diseño TVFREAK" | 2 |
| `res/values/strings.xml`, `values-es` | 2 textos del interruptor | 2 |
| `ui/screens/detail/MetaDetailsScreen.kt` | 1 `if` | 3, si se aprueba |

Archivos nuevos (solo nuestros): `ui/screens/home/tvfreak/TvfreakHomeContent.kt`, `TvfreakHomeHero.kt`, `TvfreakHomeRows.kt`, `TvfreakHomeRowsList.kt`, `TvfreakRatingBadges.kt`, `TvfreakContinueWatchingCard.kt`. Sin fuentes propias: se usa la que elijas en Nuvio.

Se reutilizan sin copiar: `ModernHomeModels.kt` y `ModernHomePresentation.kt` (los datos ya llegan preparados para todas las disposiciones).

---

## 9. Riesgos

- **Actualizaciones de Nuvio.** Nuestra copia no recibe los arreglos que Nuvio haga en la vista Modern. Al actualizar, reviso los cambios de `ModernHome*.kt` y paso a mano los que importen.
- **Compilar sin Android en local.** Cada error de Kotlin cuesta una vuelta de 15 a 30 minutos en GitHub. Para reducirlo, antes de cada compilación reviso a mano firmas e imports, y la Fase 2 va en una sola tanda.