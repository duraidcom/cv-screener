export interface Database {
  public: {
    Tables: {
      cv_documents: {
        Row: {
          id: string
          filename: string
          file_path: string
          total_pages: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          filename: string
          file_path: string
          total_pages: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          filename?: string
          file_path?: string
          total_pages?: number
          created_at?: string
          updated_at?: string
        }
      }
      cv_chunks: {
        Row: {
          id: string
          document_id: string
          content: string
          page_number: number
          chunk_index: number
          embedding: number[]
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          content: string
          page_number: number
          chunk_index: number
          embedding: number[]
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          content?: string
          page_number?: number
          chunk_index?: number
          embedding?: number[]
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_cv_chunks: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          document_id: string
          content: string
          page_number: number
          chunk_index: number
          filename: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export interface CVChunk {
  id: string
  document_id: string
  content: string
  page_number: number
  chunk_index: number
  filename: string
  similarity: number
}

export interface CVDocument {
  id: string
  filename: string
  file_path: string
  total_pages: number
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
  timestamp: Date
}

export interface Citation {
  id: string
  filename: string
  page_number: number
  content: string
  similarity: number
}