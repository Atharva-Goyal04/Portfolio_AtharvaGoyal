import sharp from 'sharp'
import { readdir, mkdir } from 'fs/promises'
import { join, extname, dirname } from 'path'

const INPUT_DIR  = './public/images/ToCompress'
const OUTPUT_DIR = './public/images/optimized'
const MAX_W = 2000
const MAX_H = 2000
const QUALITY = 80

async function listImages(dir = INPUT_DIR, array = []) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      await listImages(full, array)
    } else if (['.jpg', '.jpeg', '.png', '.webp'].includes(extname(entry.name).toLowerCase())) {
      array.push(full)
    }
  }
  return array
}

async function compressImages() {
  // Ensure input and output directories exist
  await mkdir(INPUT_DIR, { recursive: true })
  await mkdir(OUTPUT_DIR, { recursive: true })
  
  const files = await listImages()

  if (files.length === 0) {
    console.log('No images found to compress in:', INPUT_DIR)
    return
  }

  let totalSaved = 0
  for (const file of files) {
    const relative = file.slice(INPUT_DIR.length + 1)
    const outPath = join(OUTPUT_DIR, relative.replace(extname(relative), '.jpg'))
    const outFolder = dirname(outPath)
    await mkdir(outFolder, { recursive: true })

    const buffer = await sharp(file).toBuffer()
    const metadata = await sharp(file).metadata()

    await sharp(file)
      .resize(MAX_W, MAX_H, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(outPath)

    const outBuffer = await sharp(outPath).toBuffer()
    const saved = buffer.length - outBuffer.length
    totalSaved += saved

    console.log(`✓ ${relative}`)
    console.log(`  ${metadata.width}x${metadata.height} → ${Math.round(buffer.length/1024)}KB → ${Math.round(outBuffer.length/1024)}KB (-${((saved/buffer.length)*100).toFixed(1)}%)`)
  }

  console.log(`\nDone! Total saved: ${(totalSaved/1024/1024).toFixed(2)}MB`)
  console.log(`Optimized images saved to: ${OUTPUT_DIR}`)
  console.log(`Please manually move optimized images to their respective category folders in public/images/`)
}

compressImages()