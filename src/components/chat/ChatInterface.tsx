'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage as ChatMessageType, Citation } from '@/lib/database.types'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { SourcesPanel } from './SourcesPanel'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, AlertCircle } from 'lucide-react'

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [currentCitations, setCurrentCitations] = useState<Citation[]>([])
  const [selectedCitation, setSelectedCitation] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(undefined)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        citations: data.citations,
        timestamp: new Date(data.timestamp)
      }

      setMessages(prev => [...prev, assistantMessage])
      setCurrentCitations(data.citations || [])
    } catch (error) {
      console.error('Error sending message:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
      
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCitationClick = (filename: string) => {
    setSelectedCitation(filename)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 rounded-none border-0 border-r">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              CV Screener Chat
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 py-12">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Welcome to CV Screener</h3>
                    <p className="text-sm max-w-md mx-auto">
                      Ask questions about the candidates in our database. 
                      For example: &quot;Who has Python experience?&quot; or &quot;Which candidates graduated from MIT?&quot;
                    </p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onCitationClick={handleCitationClick}
                  />
                ))}
                
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Sources Panel */}
      <div className="w-96 flex-shrink-0">
        <SourcesPanel
          citations={currentCitations}
          selectedCitation={selectedCitation}
        />
      </div>
    </div>
  )
}