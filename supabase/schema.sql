-- Enable the pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the cv_documents table
CREATE TABLE IF NOT EXISTS cv_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    total_pages INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the cv_chunks table
CREATE TABLE IF NOT EXISTS cv_chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES cv_documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    page_number INTEGER NOT NULL DEFAULT 1,
    chunk_index INTEGER NOT NULL DEFAULT 0,
    embedding VECTOR(1536) NOT NULL, -- OpenAI text-embedding-3-small dimensions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS cv_chunks_document_id_idx ON cv_chunks(document_id);
CREATE INDEX IF NOT EXISTS cv_chunks_page_number_idx ON cv_chunks(page_number);
CREATE INDEX IF NOT EXISTS cv_documents_filename_idx ON cv_documents(filename);

-- Create a vector similarity search index
CREATE INDEX IF NOT EXISTS cv_chunks_embedding_idx ON cv_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Function to search for similar chunks
CREATE OR REPLACE FUNCTION match_cv_chunks(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    content TEXT,
    page_number INT,
    chunk_index INT,
    filename TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.document_id,
        c.content,
        c.page_number,
        c.chunk_index,
        d.filename,
        1 - (c.embedding <=> query_embedding) AS similarity
    FROM cv_chunks c
    JOIN cv_documents d ON c.document_id = d.id
    WHERE 1 - (c.embedding <=> query_embedding) > match_threshold
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for cv_documents
CREATE TRIGGER update_cv_documents_updated_at 
    BEFORE UPDATE ON cv_documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
-- This can be removed in production
INSERT INTO cv_documents (filename, file_path, total_pages) VALUES
('sample_cv_1.pdf', '/path/to/sample_cv_1.pdf', 2),
('sample_cv_2.pdf', '/path/to/sample_cv_2.pdf', 1)
ON CONFLICT DO NOTHING;