import sharp from 'sharp'
import { readdir } from 'fs/promises'
import { join, extname } from 'path'

const BASE_DIR = './public/images'
const MAX_WIDTH = 1600
const MAX_HEIGHT = 1600
const QUALITY = 75

const folders = ['street', 'portrait', 'architecture', 'summer-picnic', 'misc']

async function compressFolder(folder) {
  const inputDir = join(BASE_DIR, folder)
  const files = await readdir(inputDir)
  const imageFiles = files.filter(f => 
    ['.jpg', '.jpeg', '.png', '.webp'].includes(extname(f).toLowerCase())
  )
  
  console.log(`\n📁 ${folder}/ (${imageFiles.length} images)`)
  
  let totalSaved = 0
  
  for (const file of imageFiles) {
    const inputPath = join(inputDir, file)
    
    try {
      const inputBuffer = await sharp(inputPath).toBuffer()
      const inputSize = inputBuffer.length
      
      if (inputSize < 150 * 1024) {
        console.log(`  ⏭ ${file} (already small: ${Math.round(inputSize/1024)}KB)`)
        continue
      }
      
      const outputBuffer = await sharp(inputBuffer)
        .resize(MAX_WIDTH, MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toBuffer()
      
      const { writeFile } = await import('fs/promises')
      await writeFile(inputPath, outputBuffer)
      
      const outputSize = outputBuffer.length
      const saved = inputSize - outputSize
      const percent = ((saved / inputSize) * 100).toFixed(1)
      
      totalSaved += saved
      
      console.log(`  ✓ ${file}: ${Math.round(inputSize/1024)}KB → ${Math.round(outputSize/1024)}KB (-${percent}%)`)
    } catch (err) {
      console.log(`  ✗ ${file}: ${err.message}`)
    }
  }
  
  return totalSaved
}

async function main() {
  console.log('🔧 Re-compressing images...\n')
  
  let totalSaved = 0
  for (const folder of folders) {
    totalSaved += await compressFolder(folder)
  }
  
  console.log(`\n✅ Done! Total saved: ${(totalSaved / 1024 / 1024).toFixed(1)}MB`)
}

main()
