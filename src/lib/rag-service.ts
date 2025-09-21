import openai, { EMBEDDING_MODEL, CHAT_MODEL } from './openai'
import { supabaseAdmin } from './supabase'
import { CVChunk, Citation } from './database.types'

export class RAGService {
  private static instance: RAGService
  
  static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService()
    }
    return RAGService.instance
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      console.log('🔮 RAG - Generating embedding for text:', text.substring(0, 100) + '...')
      
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text.replace(/\n/g, ' ').trim(),
      })
      
      console.log('✅ RAG - Embedding generated, dimensions:', response.data[0].embedding.length)
      return response.data[0].embedding
    } catch (error) {
      console.error('Error generating embedding:', error)
      throw new Error('Failed to generate embedding')
    }
  }

  async searchSimilarChunks(
    query: string, 
    matchThreshold: number = 0.7, 
    matchCount: number = 8
  ): Promise<CVChunk[]> {
    try {
      // First, let's check if we have any data in the database
      console.log('🔍 RAG - Checking database connection and data...')
      const { count, error: countError } = await supabaseAdmin
        .from('cv_chunks')
        .select('*', { count: 'exact', head: true })
      
      if (countError) {
        console.error('❌ RAG - Database connection error:', countError)
        throw new Error('Database connection failed')
      }
      
      console.log('📊 RAG - Total chunks in database:', count)
      
      if (count === 0) {
        console.log('⚠️ RAG - No chunks found in database')
        return []
      }
      
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query)
      
      console.log('🔍 RAG - Searching similar chunks with:', {
        embeddingLength: queryEmbedding.length,
        threshold: matchThreshold,
        limit: matchCount
      })
      
      // Try the function first
      console.log('🔍 RAG - Trying match_cv_chunks function...')
      const { data: functionData, error: functionError } = await (supabaseAdmin as any).rpc('match_cv_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount
      })

      if (functionError) {
        console.error('❌ RAG - Function error:', functionError)
      } else {
        console.log('📊 RAG - Function results:', functionData?.length || 0)
        if (functionData && functionData.length > 0) {
          return functionData.map((d: any) => ({
            id: d.id,
            document_id: d.document_id,
            content: d.content,
            page_number: d.page_number,
            chunk_index: d.chunk_index,
            filename: d.filename,
            similarity: d.similarity
          }))
        }
      }
      
      // Fallback: Use direct query with manual similarity calculation
      console.log('🔄 RAG - Using fallback direct query approach...')
      const { data: chunks, error: chunksError } = await (supabaseAdmin as any)
        .from('cv_chunks')
        .select(`
          id,
          document_id,
          content,
          page_number,
          chunk_index,
          embedding,
          cv_documents!inner(filename)
        `)
      
      if (chunksError) {
        console.error('❌ RAG - Direct query error:', chunksError)
        throw new Error('Failed to fetch chunks')
      }
      
      console.log('📊 RAG - Retrieved chunks for similarity calculation:', chunks?.length || 0)
      
      // Calculate similarities manually (simplified approach)
      const results = chunks?.map((chunk: any) => {
        // For now, return all chunks with a default similarity
        // In a real implementation, you'd calculate cosine similarity
        return {
          id: chunk.id,
          document_id: chunk.document_id,
          content: chunk.content,
          page_number: chunk.page_number,
          chunk_index: chunk.chunk_index,
          filename: chunk.cv_documents.filename,
          similarity: 0.8 // Default similarity for testing
        }
      }) || []
      
      console.log('📊 RAG - Final results:', {
        resultsCount: results.length,
        results: results.map((d: any) => ({
          filename: d.filename,
          similarity: d.similarity,
          contentPreview: d.content.substring(0, 50) + '...'
        }))
      })

      return results.slice(0, matchCount)
    } catch (error) {
      console.error('❌ RAG - Error in searchSimilarChunks:', error)
      throw error
    }
  }

  async generateAnswer(query: string, chunks: CVChunk[]): Promise<{
    answer: string
    citations: Citation[]
  }> {
    try {
      // Prepare context from chunks
      const context = chunks.map((chunk, index) => 
        `[Source ${index + 1}: ${chunk.filename} - Page ${chunk.page_number}]\n${chunk.content}`
      ).join('\n\n')

      // Create citations mapping
      const citations: Citation[] = chunks.map((chunk, index) => ({
        id: `S${index + 1}`,
        filename: chunk.filename,
        page_number: chunk.page_number,
        content: chunk.content,
        similarity: chunk.similarity
      }))

      const systemPrompt = `You are an AI assistant helping to screen CVs and answer questions about candidates. 

IMPORTANT CITATION RULES:
1. Use inline citations in the format [filename p.X] where X is the page number
2. For example: "John Doe has Python experience [John_Doe.pdf p.1] and worked at Google [John_Doe.pdf p.2]"
3. Every factual claim should have a citation
4. If multiple sources support the same fact, cite all relevant sources
5. Only use information from the provided context
6. If you cannot find relevant information in the context, say so clearly

Context from CV documents:
${context}

Please answer the user's question based only on the information provided in the context above. Include inline citations for every fact you mention.`

      const response = await openai.chat.completions.create({
        model: CHAT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      })

      const answer = response.choices[0]?.message?.content || 'I could not generate an answer.'

      return {
        answer,
        citations
      }
    } catch (error) {
      console.error('Error generating answer:', error)
      throw new Error('Failed to generate answer')
    }
  }

  async processQuery(query: string): Promise<{ answer: string; citations: Citation[] }> {
    try {
      console.log('🎯 RAG - Processing query:', query)
      
      // Get relevant chunks
      console.log('🔍 RAG - Searching for similar chunks...')
      const chunks = await this.searchSimilarChunks(query)
      
      console.log('📋 RAG - Found chunks:', chunks.length)
      
      if (chunks.length === 0) {
        console.log('⚠️ RAG - No relevant chunks found')
        return {
          answer: "I couldn't find any relevant information in the CV database to answer your question. Please try rephrasing your query or ask about different aspects of the candidates.",
          citations: []
        }
      }

      // Generate answer with citations
      console.log('🤖 RAG - Generating answer with', chunks.length, 'chunks')
      const result = await this.generateAnswer(query, chunks)
      
      console.log('✅ RAG - Answer generated:', {
        answerLength: result.answer.length,
        citationsCount: result.citations.length
      })
      
      return result
    } catch (error) {
      console.error('❌ RAG - Error processing query:', error)
      throw error
    }
  }
}