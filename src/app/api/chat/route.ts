import { NextRequest, NextResponse } from 'next/server'
import { RAGService } from '@/lib/rag-service'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    console.log('🔍 Chat API - Received message:', message)

    if (!message || typeof message !== 'string') {
      console.log('❌ Chat API - Invalid message provided')
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    console.log('🚀 Chat API - Initializing RAG service')
    const ragService = RAGService.getInstance()
    
    console.log('⚡ Chat API - Processing query with RAG service')
    const result = await ragService.processQuery(message)
    
    console.log('✅ Chat API - RAG result:', {
      answerLength: result.answer.length,
      citationsCount: result.citations.length,
      citations: result.citations.map(c => ({ filename: c.filename, page: c.page_number }))
    })

    return NextResponse.json({
      answer: result.answer,
      citations: result.citations,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Chat API is running' })
}