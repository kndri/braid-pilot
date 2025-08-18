import puppeteer from 'puppeteer'
import { extname } from 'path'
// Minimal version: assumes dev server is already running

async function main() {
  const url = process.env.PREVIEW_URL || 'http://localhost:3000/preview/dashboard'
  const output = process.env.OUTPUT || 'public/dashboard-preview.png'
  const deviceScaleFactor = Number(process.env.DPR || 2)
  const width = Number(process.env.WIDTH || 1600)
  const height = Number(process.env.HEIGHT || 1000)
  const delayMs = Number(process.env.DELAY || 400)

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor })
  await page.goto(url, { waitUntil: 'networkidle0' })

  // Hide Next.js dev overlays/badges for clean screenshots
  const hideCss = `
    [aria-label="Next.js"],
    #__nextDevToolbar,
    #__nextDevOverlay,
    #__next-build-watcher,
    #__nextDevTools,
    #nextjs__container,
    [data-nextjs-devtools],
    [data-nextjs-toolbox],
    #nextjs-toast,
    .nextjs-container,
    [id^="nextjs-"],
    [class*="nextjs-"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `
  await page.addStyleTag({ content: hideCss })

  // Ensure fonts/icons render reliably
  try {
    await page.evaluate(async () => {
      // @ts-ignore - fonts may not exist in all contexts
      if (document.fonts && 'ready' in document.fonts) {
        // @ts-ignore
        await document.fonts.ready
      }
    })
  } catch {}

  // Small delay as a fallback for icon sets/images
  await new Promise((resolve) => setTimeout(resolve, delayMs))

  // Choose output type from extension and optional QUALITY env (JPEG/WebP only)
  const ext = extname(output).toLowerCase()
  const type = ext === '.jpeg' || ext === '.jpg' ? 'jpeg' : ext === '.webp' ? 'webp' : 'png'
  const quality = type === 'png' ? undefined : Number(process.env.QUALITY || 90)
  await page.screenshot({ path: output, fullPage: false, type: type as any, quality: quality as any })
  await browser.close()
  // eslint-disable-next-line no-console
  console.log(`Saved screenshot to ${output}`)
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
