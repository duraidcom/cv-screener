#!/usr/bin/env tsx

// Load environment variables from .env.local
import { config } from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
config({ path: path.resolve('.env.local') })

import { PDFProcessor } from '../src/lib/pdf-processor'

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('Usage: npm run ingest <pdf-directory>')
    console.log('Example: npm run ingest ./cvs')
    process.exit(1)
  }

  const pdfDirectory = args[0]
  const fullPath = path.resolve(pdfDirectory)

  if (!fs.existsSync(fullPath)) {
    console.error(`Directory does not exist: ${fullPath}`)
    process.exit(1)
  }

  if (!fs.statSync(fullPath).isDirectory()) {
    console.error(`Path is not a directory: ${fullPath}`)
    process.exit(1)
  }

  console.log(`Starting CV ingestion from: ${fullPath}`)
  console.log('This process will:')
  console.log('1. Extract text from PDF files')
  console.log('2. Generate embeddings using OpenAI')
  console.log('3. Store data in Supabase')
  console.log('')

  try {
    const processor = new PDFProcessor()
    await processor.processDirectory(fullPath)
    
    console.log('')
    console.log('✅ CV ingestion completed successfully!')
    console.log('You can now start the application and ask questions about the CVs.')
  } catch (error) {
    console.error('')
    console.error('❌ CV ingestion failed:', error)
    process.exit(1)
  }
}

main().catch(console.error)