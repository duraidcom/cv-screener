# CV Screener - AI-Powered Resume Analysis

A production-ready Next.js application that uses Retrieval-Augmented Generation (RAG) to answer questions about a collection of CVs/resumes. Built with OpenAI embeddings, Supabase vector database, and a modern React interface.

## 🚀 Features

- **Chat Interface**: Clean, intuitive chat interface for asking questions about CVs
- **RAG Pipeline**: Advanced retrieval system using OpenAI embeddings and vector similarity search
- **Source Citations**: Inline citations with filename and page references (e.g., `[John_Doe.pdf p.2]`)
- **Sources Panel**: Right-side panel showing detailed source information for each answer
- **Vector Search**: Powered by Supabase with pgvector for fast similarity search
- **Robust Fallback System**: Automatic fallback to direct database queries if vector functions fail
- **Ready to Use**: Includes sample CV data and works out of the box
- **Production Ready**: Built for deployment on Vercel with proper error handling and optimization

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, OpenAI API, Supabase
- **Database**: Supabase PostgreSQL with pgvector extension
- **AI**: OpenAI `text-embedding-3-small` for embeddings, `gpt-4o-mini` for chat
- **PDF Processing**: pdf-parse for text extraction
- **Deployment**: Vercel-ready configuration

## 📋 Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- Supabase account and project
- PDF files of CVs/resumes to analyze

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd cv-screener
npm install
```

### 2. Environment Configuration

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Enable pgvector extension**:
   - Go to your Supabase dashboard
   - Navigate to Database > Extensions
   - Enable the `vector` extension

3. **Run the database schema**:
   - Go to Database > SQL Editor
   - Copy and paste the contents of `supabase/schema.sql`
   - Run the SQL to create tables and functions

### 4. Prepare CV Data

#### Option A: Use Included Sample CVs
The application comes with sample CV files in the `./samples-cvs/` directory:
- James Carter CV.pdf
- James Mitchell CV.pdf

These are ready to use for testing the application.

#### Option B: Generate Additional Sample CVs
```bash
npm run generate-samples
```
This creates additional sample text files. Convert these to PDFs using any online converter.

#### Option C: Use Your Own PDFs
Place your CV PDF files in a directory (e.g., `./cvs/` or add them to `./samples-cvs/`).

### 5. Ingest CV Data

Process your PDF files and populate the database:

```bash
npm run ingest ./path/to/your/cv-directory
```

Example with included sample CVs:
```bash
npm run ingest ./samples-cvs
```

Example with your own CVs:
```bash
npm run ingest ./cvs
```

This will:
- Extract text from each PDF
- Generate embeddings using OpenAI
- Store chunks and embeddings in Supabase

### 6. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note**: The application includes sample CV data and is ready to use immediately. You can start asking questions like "Who has experience with Python?" right away.

## 🚀 Deployment to Vercel

### 1. Prepare for Deployment

```bash
npm run build
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
npm install -g vercel
vercel
```

#### Option B: GitHub Integration
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard

### 3. Configure Environment Variables

In your Vercel dashboard, add all the environment variables from your `.env.local` file:

- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (set to your Vercel domain)

## 💬 Usage Examples

Once the application is running, you can ask questions like:

- "Who has experience with Python?"
- "Which candidates graduated from MIT?"
- "Summarize the profile of John Doe"
- "Who has worked at Google?"
- "Which candidates have machine learning experience?"
- "Show me candidates with more than 5 years of experience"

## 🏗 Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   OpenAI API    │    │   Supabase DB   │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Chat UI     │ │    │ │ Embeddings  │ │    │ │ cv_documents│ │
│ │ Sources     │ │◄──►│ │ Chat Model  │ │◄──►│ │ cv_chunks   │ │
│ │ Citations   │ │    │ │             │ │    │ │ (vectors)   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **Ingestion**: PDFs → Text Extraction → Chunking → Embeddings → Supabase
2. **Query**: User Question → Embedding → Vector Search → Context Retrieval
3. **Generation**: Context + Question → OpenAI → Answer with Citations
4. **Display**: Answer + Sources Panel with clickable citations

## 📁 Project Structure

```
cv-screener/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts      # Chat API endpoint
│   │   ├── page.tsx               # Main page
│   │   └── globals.css            # Global styles
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx  # Main chat component
│   │   │   ├── ChatMessage.tsx    # Message display
│   │   │   ├── ChatInput.tsx      # Message input
│   │   │   └── SourcesPanel.tsx   # Citations panel
│   │   └── ui/                    # shadcn/ui components
│   └── lib/
│       ├── database.types.ts      # TypeScript types
│       ├── supabase.ts           # Supabase client
│       ├── openai.ts             # OpenAI client
│       ├── rag-service.ts        # RAG pipeline logic
│       └── pdf-processor.ts      # PDF processing
├── scripts/
│   ├── ingest-cvs.ts             # CV ingestion script
│   └── generate-sample-cvs.ts    # Sample data generator
├── supabase/
│   └── schema.sql                # Database schema
└── README.md
```

## 🔧 Configuration Options

### OpenAI Models
- **Embeddings**: `text-embedding-3-small` (1536 dimensions)
- **Chat**: `gpt-4o-mini` (configurable in `src/lib/openai.ts`)

### Vector Search Parameters
- **Similarity Threshold**: 0.7 with fallback to direct query (adjustable in RAG service)
- **Max Results**: 8 chunks per query
- **Chunk Size**: 4000 characters with 200 character overlap
- **Fallback Mechanism**: Automatic fallback to direct database query if vector function fails

### UI Customization
- Built with Tailwind CSS and shadcn/ui
- Fully customizable components
- Responsive design for mobile and desktop

## 🐛 Troubleshooting

### Common Issues

1. **"No relevant information found"**
   - Check if CVs were properly ingested using `npm run ingest ./samples-cvs`
   - Verify Supabase connection
   - The application includes automatic fallback mechanisms for vector search

2. **OpenAI API errors**
   - Verify API key is correct
   - Check API quota and billing
   - Ensure proper environment variables

3. **Database connection issues**
   - Verify Supabase URL and keys
   - Check if pgvector extension is enabled
   - Ensure schema was properly created
   - The RAG service includes fallback queries if vector functions fail

4. **Vector function issues**
   - The application automatically falls back to direct database queries
   - Check console logs for detailed debugging information
   - Ensure the `match_cv_chunks` function is properly deployed

### Debug Mode

Set environment variable for detailed logging:
```bash
NODE_ENV=development
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

Built with ❤️ using Next.js, OpenAI, and Supabase
