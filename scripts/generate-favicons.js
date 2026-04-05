const sharp = require('sharp')
const fs = require('fs').promises
const path = require('path')

async function generateFavicons() {
  const svgPath = path.join(__dirname, '../public/static/logo/logo.svg')
  const outputDir = path.join(__dirname, '../public/static/logo')

  const svgBuffer = await fs.readFile(svgPath)

  // Generate different sizes
  const sizes = [
    { width: 16, height: 16, name: 'favicon-16x16.png' },
    { width: 32, height: 32, name: 'favicon-32x32.png' },
    { width: 96, height: 96, name: 'logo-96x96.png' },
    { width: 192, height: 192, name: 'logo-192x192.png' },
    { width: 512, height: 512, name: 'logo-512x512.png' },
    { width: 180, height: 180, name: 'logo-apple-touch-icon.png' },
    { width: 150, height: 150, name: 'logo-mstile-150x150.png' },
  ]

  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size.width, size.height)
      .png()
      .toFile(path.join(outputDir, size.name))
    console.log(`Generated ${size.name}`)
  }

  // Generate ICO file (32x32)
  await sharp(svgBuffer).resize(32, 32).toFormat('png').toFile(path.join(outputDir, 'favicon.ico'))
  console.log('Generated favicon.ico')

  // Update site.webmanifest
  const manifest = {
    name: 'Deep Learning Audio Blog',
    short_name: 'DL Audio',
    icons: [
      {
        src: '/static/logo/logo-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/static/logo/logo-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/static/logo/logo-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
  }

  await fs.writeFile(path.join(outputDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2))
  console.log('Updated site.webmanifest')
}

generateFavicons().catch(console.error)
