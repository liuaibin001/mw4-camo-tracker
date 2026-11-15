import { Resvg } from '@resvg/resvg-js'
import { writeFile } from 'node:fs/promises'
const tiles = Array.from(
  { length: 14 },
  (_, i) =>
    `<rect x="${70 + i * 48}" y="453" width="35" height="35" rx="5" fill="${i < 8 ? '#708261' : i < 11 ? '#9eab91' : i === 11 ? '#b89d56' : i === 12 ? '#9badab' : '#839482'}" opacity="${i < 5 ? '1' : '.33'}"/>${i < 5 ? `<path d="M${79 + i * 48} 470l5 5 10-11" stroke="#fff" stroke-width="2.3" fill="none" stroke-linecap="round"/>` : ''}`,
).join('')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#fafafa"/><path d="M0 110H1200M0 555H1200" stroke="#e2e6dc"/><g fill="none" stroke="#e3e9da"><circle cx="1090" cy="335" r="215"/><circle cx="1090" cy="335" r="168" stroke-dasharray="3 8"/><circle cx="1090" cy="335" r="70"/><path d="M1090 75v180m0 160v160M825 335h185m160 0h100" stroke-width="2"/></g><g font-family="Inter, sans-serif"><text x="70" y="72" font-size="29" font-weight="600" fill="#405439">CamoField</text><text x="1040" y="68" font-size="14" fill="#79876b" letter-spacing="2">MW4 / 2026</text><text x="70" y="193" font-size="14" fill="#7a896a" letter-spacing="3">YOUR GRIND. A CLEARER ROUTE.</text><text x="65" y="286" font-size="76" font-weight="600" letter-spacing="-3" fill="#252c21">MW4 Camo Tracker<tspan fill="#80966c">.</tspan></text><text x="70" y="345" font-size="25" fill="#7d8872">Every weapon. Every challenge. Know what’s next.</text><text x="70" y="405" font-size="17" fill="#536747">35 weapons<tspan fill="#a4b195">   /   </tspan>490 challenges<tspan fill="#a4b195">   /   </tspan>Free cloud sync</text>${tiles}<text x="70" y="599" font-size="14" fill="#8c997e">Military → Special → Gold → Platinum → Harmonic Break → Divergence</text></g></svg>`
await writeFile(
  new URL('../public/og.png', import.meta.url),
  new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: 'Helvetica Neue' } })
    .render()
    .asPng(),
)
console.log('Generated public/og.png (1200 × 630).')
