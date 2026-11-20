# AI Text Lab

AI Text Lab is a Next.js web application for chatting with a local AI developer mentor and running text-processing tools through Ollama and Llama 3.2.

## Features

- Dark ChatGPT/Grok-style interface
- Collapsible sidebar
- New chat button
- In-memory conversation sessions
- Bounded chat context: the latest 12 conversation messages are sent to Ollama
- Chat tool with follow-up questions
- Summarize
- Explain
- Rewrite
- Extract JSON
- Classify
- Loading state and responsive layout
- Token-by-token streaming chat responses
- Markdown rendering for headings, lists, inline code, and code blocks
- Health endpoint

## Architecture

```text
src/
  app/
    api/
      [operation]/route.js   Summarize, explain, rewrite, extract, classify
      chat/route.js           Multi-turn chat and clear session
      health/route.js         Health check
    globals.css               Global dark UI styles
    layout.js                 App metadata and root layout
    page.js                   Main chat interface
  lib/
    chat-store.js             Session memory and streaming chat context
    ollama.js                 Ollama API client and streaming client
    text-tools.js             Text-processing instructions and parsing

jsconfig.json                 @/* import alias
package.json                  Next.js scripts and dependencies
```

## Requirements

- Node.js 18 or newer
- Ollama
- Llama 3.2

Pull the model if necessary:

```bash
ollama pull llama3.2
```

Make sure Ollama is running at `http://localhost:11434`.

## Install and run

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Create a production build:

```bash
npm run build
npm start
```

## Configuration

Optional environment variables:

```text
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

PowerShell example:

```powershell
$env:OLLAMA_URL="http://localhost:11434"
$env:OLLAMA_MODEL="llama3.2"
npm run dev
```

Next.js uses port `3000` by default. To use another port:

```bash
npm run dev -- -p 3001
```

## API routes

### Chat

```http
POST /api/chat
```

Request:

```json
{
  "sessionId": "optional-existing-session-id",
  "message": "Explain JavaScript promises"
}
```

Response:

```json
{
  "sessionId": "generated-session-id",
  "reply": "A promise represents..."
}
```

The browser stores the session ID in local storage and sends it with later messages. The actual messages are held by the server in memory. Chat responses are streamed from Ollama to the browser as they are generated.

Clear a chat session:

```http
DELETE /api/chat
```

```json
{
  "sessionId": "generated-session-id"
}
```

### Text tools

All text tools accept:

```json
{
  "text": "Text to process"
}
```

Available routes:

```text
POST /api/summarize  → { "summary": "..." }
POST /api/explain    → { "explanation": "..." }
POST /api/rewrite    → { "rewritten": "..." }
POST /api/extract    → { "data": { ... } }
POST /api/classify   → { "category": "..." }
```

Classification accepts optional categories:

```json
{
  "text": "I love this product",
  "categories": "positive, negative, neutral"
}
```

The extract route requests JSON from Ollama and parses it on the server with `JSON.parse()` before returning it.

### Health

```http
GET /api/health
```

Response:

```json
{
  "status": "ok"
}
```

## Request flow

```text
Browser
  ↓
Next.js client page
  ↓
Next.js route handler
  ↓
Server-side Ollama client
  ↓
Ollama / Llama 3.2
  ↓
JSON response
```

