/**
 * Pré-rendage statique — pour les hébergeurs statiques (Netlify, etc.).
 *
 * Le build Vite produit un bundle Cloudflare Workers (`dist/_worker.js`) :
 * sur un hébergeur statique, aucun `index.html` n'est généré → page blanche.
 * Ce script appelle l'application côté serveur une seule fois au build
 * et écrit le HTML final dans `dist/index.html`.
 *
 * À lancer après `vite build` (fait automatiquement par `npm run build`).
 */
import { writeFile, stat } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const workerPath = join(dist, '_worker.js')
const outPath = join(dist, 'index.html')

// Contrôles : le build doit échouer bruyamment plutôt que de publier une page vide.
const EXPECTED = [
  { label: '15 entrées de playlist', test: (html) => (html.match(/data-wpl-item/g) || []).length === 15 },
  { label: 'section #projets', test: (html) => html.includes('id="projets"') },
  { label: 'section #profil', test: (html) => html.includes('id="profil"') },
  { label: 'script playlist.js', test: (html) => html.includes('/static/js/playlist.js') },
  { label: 'balise </html>', test: (html) => html.includes('</html>') },
  { label: 'aucun lecteur instancié (lazy)', test: (html) => !html.includes('<wistia-player') },
  { label: 'aucun .mp4 exposé', test: (html) => !html.includes('.mp4') }
]

async function main() {
  try {
    await stat(workerPath)
  } catch {
    throw new Error(`${workerPath} introuvable — lancez "vite build" avant ce script.`)
  }

  // Import du bundle Worker : aucune API Cloudflare n'est utilisée par l'app,
  // il s'exécute donc tel quel sous Node.
  // pathToFileURL est indispensable : sous Windows, import() refuse un chemin brut.
  const mod = await import(pathToFileURL(workerPath).href)
  const app = mod.default
  if (!app || typeof app.fetch !== 'function') {
    throw new Error('dist/_worker.js n\'exporte pas une application Hono valide (fetch manquant).')
  }

  const res = await app.fetch(new Request('https://kembou.dev/', { method: 'GET' }))
  const html = await res.text()

  if (res.status !== 200) throw new Error(`Rendu SSR : statut HTTP ${res.status}`)
  if (!res.headers.get('content-type')?.includes('text/html')) {
    throw new Error(`Rendu SSR : content-type inattendu (${res.headers.get('content-type')})`)
  }
  for (const check of EXPECTED) {
    if (!check.test(html)) throw new Error(`Contrôle échoué : ${check.label}`)
  }

  await writeFile(outPath, html, 'utf8')
  const { size } = await stat(outPath)

  console.log(`✓ dist/index.html généré (${(size / 1024).toFixed(1)} Ko, ${res.status})`)
}

main().catch((err) => {
  console.error(`✗ Pré-rendage impossible : ${err.message}`)
  process.exit(1)
})