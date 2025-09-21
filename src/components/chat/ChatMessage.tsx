'use client'

import { ChatMessage as ChatMessageType } from '@/lib/database.types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Bot } from 'lucide-react'

interface ChatMessageProps {
  message: ChatMessageType
  onCitationClick?: (citationId: string) => void
}

export function ChatMessage({ message, onCitationClick }: ChatMessageProps) {
  const isUser = message.role === 'user'

  // Parse citations from the message content
  const parseMessageWithCitations = (content: string) => {
    // Match patterns like [filename.pdf p.X] or [filename p.X]
    const citationRegex = /\[([^\]]+\.pdf)\s+p\.(\d+)\]/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = citationRegex.exec(content)) !== null) {
      // Add text before citation
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        })
      }

      // Add citation
      parts.push({
        type: 'citation',
        content: match[0],
        filename: match[1],
        page: match[2]
      })

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex)
      })
    }

    return parts
  }

  const messageParts = parseMessageWithCitations(message.content)

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-blue-600" />
        </div>
      )}
      
      <Card className={`max-w-[80%] p-4 ${
        isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="space-y-2">
          <div className="text-sm">
            {messageParts.map((part, index) => {
              if (part.type === 'text') {
                return <span key={index}>{part.content}</span>
              } else {
                return (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="mx-1 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => part.filename && onCitationClick?.(part.filename)}
                  >
                    {part.filename} p.{part.page}
                  </Badge>
                )
              }
            })}
          </div>
          
          <div className="text-xs opacity-70">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </Card>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  )
}