import * as fs from 'fs'
import * as path from 'path'
import pdf from 'pdf-parse'
import { supabaseAdmin } from './supabase'
import { RAGService } from './rag-service'
import { Database } from './database.types'

export interface ProcessedChunk {
  content: string
  pageNumber: number
  chunkIndex: number
}

export class PDFProcessor {
  private ragService: RAGService

  constructor() {
    this.ragService = RAGService.getInstance()
  }

  async extractTextFromPDF(filePath: string): Promise<{ text: string; numPages: number }> {
    try {
      const dataBuffer = fs.readFileSync(filePath)
      const data = await pdf(dataBuffer)
      
      return {
        text: data.text,
        numPages: data.numpages
      }
    } catch (error) {
      console.error('Error extracting text from PDF:', error)
      throw new Error(`Failed to extract text from PDF: ${filePath}`)
    }
  }

  chunkText(text: string, maxChunkSize: number = 4000, overlap: number = 200): ProcessedChunk[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const chunks: ProcessedChunk[] = []
    let currentChunk = ''
    let chunkIndex = 0

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim()
      if (!trimmedSentence) continue

      const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + trimmedSentence

      if (potentialChunk.length > maxChunkSize && currentChunk.length > 0) {
        // Save current chunk
        chunks.push({
          content: currentChunk.trim() + '.',
          pageNumber: 1, // We'll update this later when we have page info
          chunkIndex: chunkIndex++
        })

        // Start new chunk with overlap
        const words = currentChunk.split(' ')
        const overlapWords = words.slice(-Math.floor(overlap / 6)) // Approximate word count for overlap
        currentChunk = overlapWords.join(' ') + (overlapWords.length > 0 ? '. ' : '') + trimmedSentence
      } else {
        currentChunk = potentialChunk
      }
    }

    // Add the last chunk
    if (currentChunk.trim()) {
      chunks.push({
        content: currentChunk.trim() + '.',
        pageNumber: 1,
        chunkIndex: chunkIndex
      })
    }

    return chunks
  }

  async processAndStorePDF(filePath: string, filename: string): Promise<string> {
    try {
      console.log(`Processing PDF: ${filename}`)
      
      // Extract text from PDF
      const { text, numPages } = await this.extractTextFromPDF(filePath)
      
      if (!text.trim()) {
        throw new Error('No text content found in PDF')
      }

      // Store document metadata
      const insertData = {
        filename,
        file_path: filePath,
        total_pages: numPages
      }
      const { data: document, error: docError } = await (supabaseAdmin as any)
        .from('cv_documents')
        .insert(insertData)
        .select()
        .single()

      if (docError) {
        console.error('Error storing document:', docError)
        throw new Error('Failed to store document metadata')
      }

      console.log(`Document stored with ID: ${document.id}`)

      // Chunk the text
      const chunks = this.chunkText(text)
      console.log(`Created ${chunks.length} chunks`)

      // Process chunks and generate embeddings
      const chunkPromises = chunks.map(async (chunk, index) => {
        try {
          const embedding = await this.ragService.generateEmbedding(chunk.content)
          
          return {
            document_id: document.id,
            content: chunk.content,
            page_number: Math.ceil((index + 1) / (chunks.length / numPages)), // Estimate page number
            chunk_index: chunk.chunkIndex,
            embedding
          }
        } catch (error) {
          console.error(`Error processing chunk ${index}:`, error)
          throw error
        }
      })

      const processedChunks = await Promise.all(chunkPromises)

      // Store chunks in batches
      const batchSize = 10
      for (let i = 0; i < processedChunks.length; i += batchSize) {
        const batch = processedChunks.slice(i, i + batchSize)
        
        const { error: chunkError } = await (supabaseAdmin as any)
          .from('cv_chunks')
          .insert(batch)

        if (chunkError) {
          console.error('Error storing chunks:', chunkError)
          throw new Error('Failed to store chunks')
        }
      }

      console.log(`Successfully processed ${filename}: ${chunks.length} chunks stored`)
      return document.id
    } catch (error) {
      console.error(`Error processing PDF ${filename}:`, error)
      throw error
    }
  }

  async processDirectory(directoryPath: string): Promise<void> {
    try {
      const files = fs.readdirSync(directoryPath)
      const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'))

      console.log(`Found ${pdfFiles.length} PDF files to process`)

      for (const file of pdfFiles) {
        const filePath = path.join(directoryPath, file)
        try {
          await this.processAndStorePDF(filePath, file)
        } catch (error) {
          console.error(`Failed to process ${file}:`, error)
          // Continue with other files
        }
      }

      console.log('Directory processing completed')
    } catch (error) {
      console.error('Error processing directory:', error)
      throw error
    }
  }
}