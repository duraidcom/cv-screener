'use client'

import { Citation } from '@/lib/database.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { FileText, ExternalLink } from 'lucide-react'

interface SourcesPanelProps {
  citations: Citation[]
  selectedCitation?: string
}

export function SourcesPanel({ citations, selectedCitation }: SourcesPanelProps) {
  if (citations.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" />
            Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No sources available</p>
            <p className="text-sm">Ask a question to see relevant CV sources</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5" />
          Sources ({citations.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4 p-4">
            {citations.map((citation, index) => (
              <Card
                key={citation.id}
                className={`transition-all duration-200 ${
                  selectedCitation === citation.filename
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:shadow-md'
                }`}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {citation.id}
                        </Badge>
                        <span className="font-medium text-sm">
                          {citation.filename}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Page {citation.page_number}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 leading-relaxed">
                      {citation.content.length > 200
                        ? `${citation.content.substring(0, 200)}...`
                        : citation.content
                      }
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Similarity: {(citation.similarity * 100).toFixed(1)}%
                      </span>
                      <div className="flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        <span>Source {index + 1}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}