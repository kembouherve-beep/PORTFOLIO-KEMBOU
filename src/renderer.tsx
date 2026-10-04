import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="KEMBOU — Vidéaste & Monteur Vidéo. Portfolio 2026. Motion design, post-production, création de contenus audiovisuels professionnels." />
        <meta name="theme-color" content="#050505" />
        <title>KEMBOU — Vidéaste & Monteur Vidéo · Portfolio 2026</title>

        {/* Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />

        {/* Google Fonts — Poppins, unique famille du portfolio.
            Un seul chargement : les 6 graisses réellement utilisées. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Tailwind CSS */}
        <script src="https://cdn.tailwindcss.com"></script>
        {/* Aligne le reset et les utilitaires Tailwind sur Poppins,
            pour qu'aucune famille concurrente ne ressurgisse. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `tailwind.config={theme:{extend:{fontFamily:{sans:['Poppins','sans-serif'],display:['Poppins','sans-serif'],mono:['Poppins','sans-serif'],serif:['Poppins','sans-serif']}}}}`,
          }}
        />

        {/* Font Awesome */}
        <link
          href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          rel="stylesheet"
        />

        {/* GSAP + ScrollTrigger pour animations premium */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

        {/* Custom styles */}
        <link href="/static/css/style.css" rel="stylesheet" />
        <link href="/static/css/pressbook.css" rel="stylesheet" />

        {/* Favicon */}
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🎬%3C/text%3E%3C/svg%3E"
        />
      </head>
      <body class="bg-[#050505] text-white antialiased overflow-x-hidden">
        {children}
        <script src="/static/js/app.js"></script>
        <script src="/static/js/playlist.js"></script>
        <script src="/static/js/pressbook.js"></script>
      </body>
    </html>
  )
})
