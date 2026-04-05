const sharp = require('sharp')
const fs = require('fs').promises
const path = require('path')

async function setupImages() {
  const baseDir = path.join(__dirname, '../public/static')

  // 1. Copy main logo
  await fs.copyFile(
    path.join(baseDir, 'images/logo/color-logo-no-bg.png'),
    path.join(baseDir, 'images/logo.png')
  )
  console.log('✓ Main logo copied')

  // 2. Copy avatar (already in correct place)
  console.log('✓ Avatar already in place at images/avatar/avatar.png')

  // 3. Generate favicon sizes from browser.png
  const faviconSource = path.join(baseDir, 'favicon/browser.png')
  const faviconBuffer = await fs.readFile(faviconSource)

  // Generate different favicon sizes
  const faviconSizes = [
    { width: 16, height: 16, name: 'favicon-16x16.png' },
    { width: 32, height: 32, name: 'favicon-32x32.png' },
    { width: 96, height: 96, name: 'logo-96x96.png' },
    { width: 192, height: 192, name: 'logo-192x192.png' },
    { width: 512, height: 512, name: 'logo-512x512.png' },
  ]

  for (const size of faviconSizes) {
    await sharp(faviconBuffer)
      .resize(size.width, size.height)
      .png()
      .toFile(path.join(baseDir, 'logo', size.name))
    console.log(`✓ Generated ${size.name}`)
  }

  // Copy apple and android specific icons
  await sharp(path.join(baseDir, 'favicon/iphone.png'))
    .resize(180, 180)
    .png()
    .toFile(path.join(baseDir, 'logo/logo-apple-touch-icon.png'))
  console.log('✓ Generated Apple touch icon')

  await sharp(path.join(baseDir, 'favicon/android.png'))
    .resize(150, 150)
    .png()
    .toFile(path.join(baseDir, 'logo/logo-mstile-150x150.png'))
  console.log('✓ Generated MS tile icon')

  // Generate ICO file from browser.png (32x32)
  await sharp(faviconBuffer)
    .resize(32, 32)
    .toFormat('png')
    .toFile(path.join(baseDir, 'logo/favicon.ico'))
  console.log('✓ Generated favicon.ico')

  // Update site.webmanifest
  const manifest = {
    name: 'Context Zero - Deep Learning Audio Blog',
    short_name: 'Context Zero',
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
    background_color: '#000000',
    display: 'standalone',
  }

  await fs.writeFile(path.join(baseDir, 'logo/site.webmanifest'), JSON.stringify(manifest, null, 2))
  console.log('✓ Updated site.webmanifest')

  console.log('\n✅ All images have been set up successfully!')
}

setupImages().catch(console.error)
