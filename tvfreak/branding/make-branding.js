// Genera las imágenes TVFREAK (icono, banner, logo horizontal) a partir de la calavera pixelada.
// Uso: node make-branding.js <carpeta de salida> <ruta a @resvg/resvg-js>
// No toca nada del proyecto: escribe en la carpeta de salida. Copiar a res/ es un paso aparte.
const fs = require('fs')
const path = require('path')

const OUT = path.resolve(process.argv[2] || 'out')
const { Resvg } = require(process.argv[3] || '@resvg/resvg-js')

// Calavera de TVFREAK (icon.svg): 10 columnas x 11 filas. [fila, columna, ancho]
const SKULL = [
  [0, 2, 6], [1, 1, 8], [2, 0, 10], [3, 0, 10],
  [4, 0, 2], [4, 3, 4], [4, 8, 2],
  [5, 0, 1], [5, 4, 2], [5, 9, 1],
  [6, 0, 2], [6, 3, 4], [6, 8, 2],
  [7, 0, 10], [8, 0, 4], [8, 6, 4], [9, 0, 10],
  [10, 1, 2], [10, 4, 2], [10, 7, 2],
]
const SKULL_W = 10, SKULL_H = 11

// Letras pixeladas 5x7 para "TVFREAK"
const FONT = {
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  V: ['#...#', '#...#', '#...#', '#...#', '.#.#.', '.#.#.', '..#..'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
}
const WORD = 'TVFREAK'
const WORD_W = WORD.length * 5 + (WORD.length - 1), WORD_H = 7

// Variantes: la de por defecto y las 5 que ya tiene el selector de icono de Nuvio
const VARIANTS = {
  '': ['#b4a9ff', '#6c5cf0'],            // TVFREAK, por defecto (morado #8b7bff en el centro)
  _arctic_blue: ['#8fe3ff', '#2f7bff'],
  _emerald: ['#7ef0b8', '#0f9e68'],
  _rose_gold: ['#ffd0bf', '#d27a8c'],
  _copper: ['#ffbd6b', '#e0603a'],
  _graphite: ['#e3e6ec', '#6c7383'],
}
const BG = ['#151a33', '#070912'] // fondo oscuro, parecido al de Nuvio

// Rectángulos de la calavera y del texto en unidades de píxel
function skullRects(ox, oy) {
  return SKULL.map(([r, c, w]) => [ox + c, oy + r, w, 1])
}
function wordRects(ox, oy) {
  const out = []
  ;[...WORD].forEach((ch, i) => {
    FONT[ch].forEach((row, r) => {
      let c = 0
      while (c < 5) {
        if (row[c] === '#') {
          let w = 0
          while (c + w < 5 && row[c + w] === '#') w++
          out.push([ox + i * 6 + c, oy + r, w, 1])
          c += w
        } else c++
      }
    })
  })
  return out
}
// Un solo trazado por bloque: el degradado se aplica una vez y no salen rayas entre filas.
// Cada fila se alarga un poco hacia abajo para tapar la junta con la siguiente.
const svgRects = (rects, u, x0, y0) =>
  `<path shape-rendering="crispEdges" d="${rects.map(([x, y, w, h]) =>
    `M${x0 + x * u},${y0 + y * u}h${w * u}v${h * u + 0.5}h${-w * u}z`).join('')}"/>`

function defs(id, [c1, c2], w, h) {
  return `<defs>
    <radialGradient id="bg${id}" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="${BG[0]}"/><stop offset="1" stop-color="${BG[1]}"/></radialGradient>
    <linearGradient id="fg${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
  </defs>`
}

// Icono cuadrado: calavera centrada, ocupa el 56% del ancho
function iconSvg(size, colors) {
  const u = (size * 0.56) / SKULL_W
  const x0 = (size - SKULL_W * u) / 2, y0 = (size - SKULL_H * u) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${defs('', colors)}
    <rect width="${size}" height="${size}" fill="url(#bg)"/>
    <g fill="url(#fg)">${svgRects(skullRects(0, 0), u, x0, y0)}</g></svg>`
}

// Banner 16:9: calavera y texto TVFREAK juntos, el conjunto centrado
function bannerSvg(w, h, colors) {
  const gap = 3
  const totalW = SKULL_W + gap + WORD_W
  const u = (w * 0.62) / totalW
  const x0 = (w - totalW * u) / 2, y0 = (h - SKULL_H * u) / 2
  const textY = (SKULL_H - WORD_H) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs('', colors)}
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    <g fill="url(#fg)">${svgRects(skullRects(0, 0), u, x0, y0)}</g>
    <g fill="#ffffff">${svgRects(wordRects(SKULL_W + gap, textY), u, x0, y0)}</g></svg>`
}

// Glifo para los ajustes (sustituye trakt_tv_favicon.svg): icono con esquinas redondeadas
function glyphSvg(colors) {
  const s = 48, u = 2.8
  const x0 = (s - SKULL_W * u) / 2, y0 = (s - SKULL_H * u) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${defs('', colors)}
    <rect width="48" height="48" rx="10" fill="url(#bg)"/>
    <g fill="url(#fg)">${svgRects(skullRects(0, 0), u, x0, y0)}</g></svg>`
}

// Logo horizontal en vector de Android (sustituye trakt_logo_wordmark.xml). Blanco, Nuvio lo tiñe.
function wordmarkVector() {
  const gap = 3
  const vw = SKULL_W + gap + WORD_W, vh = SKULL_H
  const textY = (SKULL_H - WORD_H) / 2
  const rects = [...skullRects(0, 0), ...wordRects(SKULL_W + gap, textY)]
  const d = rects.map(([x, y, w, h]) => `M${x},${y}h${w}v${h}h${-w}z`).join('')
  const dpH = 24, dpW = Math.round((vw / vh) * dpH)
  return `<?xml version="1.0" encoding="utf-8"?>
<!-- TVFREAK: calavera pixelada y texto. Generado por tvfreak/branding/make-branding.js -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="${dpW}dp"
    android:height="${dpH}dp"
    android:viewportWidth="${vw}"
    android:viewportHeight="${vh}">
    <path
        android:fillColor="#FFFFFFFF"
        android:pathData="${d}" />
</vector>
`
}

function png(svg, file) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, new Resvg(svg).render().asPng())
}

const ICON_SIZES = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 }
for (const [suffix, colors] of Object.entries(VARIANTS)) {
  for (const [dpi, size] of Object.entries(ICON_SIZES)) {
    png(iconSvg(size, colors), path.join(OUT, `res/mipmap-${dpi}/ic_launcher${suffix}.png`))
  }
  png(bannerSvg(320, 180, colors), path.join(OUT, `res/mipmap-xhdpi/banner${suffix}.png`))
}
const def = VARIANTS['']
png(bannerSvg(1920, 1080, def), path.join(OUT, 'res/drawable-nodpi/tv_banner.png'))
png(bannerSvg(1280, 720, def), path.join(OUT, 'res/drawable/tv_banner.png'))
png(iconSvg(1080, def), path.join(OUT, 'res/drawable/ic_launcher.png'))
fs.mkdirSync(path.join(OUT, 'res/raw'), { recursive: true })
fs.writeFileSync(path.join(OUT, 'res/raw/trakt_tv_favicon.svg'), glyphSvg(def))
fs.writeFileSync(path.join(OUT, 'res/drawable/trakt_logo_wordmark.xml'), wordmarkVector())

// Hoja de vista previa (no va al proyecto)
const cell = 200
const names = Object.keys(VARIANTS)
const W = 1920 / 2 + 40, rowsH = 40 + 540 + 40 + cell + 40 + 190 + 40 + 120 + 40
let parts = [`<rect width="${W}" height="${rowsH}" fill="#2a2d36"/>`]
parts.push(`<image href="data:image/png;base64,${fs.readFileSync(path.join(OUT, 'res/drawable-nodpi/tv_banner.png')).toString('base64')}" x="20" y="40" width="960" height="540"/>`)
names.forEach((n, i) => {
  const f = path.join(OUT, `res/mipmap-xxxhdpi/ic_launcher${n}.png`)
  parts.push(`<image href="data:image/png;base64,${fs.readFileSync(f).toString('base64')}" x="${20 + i * 160}" y="620" width="144" height="144"/>`)
  const b = path.join(OUT, `res/mipmap-xhdpi/banner${n}.png`)
  if (i < 3) parts.push(`<image href="data:image/png;base64,${fs.readFileSync(b).toString('base64')}" x="${20 + i * 330}" y="800" width="320" height="180"/>`)
})
// Logo horizontal sobre fondo oscuro, como en los ajustes
const wm = wordmarkVector().match(/pathData="([^"]+)"/)[1]
parts.push(`<rect x="20" y="1010" width="560" height="120" rx="12" fill="#11131a"/><g transform="translate(70,1026) scale(8)"><path fill="#fff" d="${wm}"/></g>`)
parts.push(`<image href="data:image/svg+xml;base64,${Buffer.from(glyphSvg(def)).toString('base64')}" x="610" y="1010" width="120" height="120"/>`)
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="1150">${parts.join('')}</svg>`
png(sheet, path.join(OUT, 'preview.png'))
console.log('Listo en', OUT)
