# Contributing

## Prerequisites

- Node.js 18 or later
- Ollama running locally
- The `llama3.2` model, installed with `ollama pull llama3.2`

## Local setup

1. Copy `.env.example` to `.env.local` if you need to change the Ollama URL or model.
2. Install dependencies with `npm install`.
3. Start the development server with `npm run dev`.
4. Open `http://localhost:3000`.

## Before opening a change

1. Keep changes focused on one feature or fix.
2. Run `npm run build` to ensure the production build succeeds.
3. Manually verify any changed API route and affected UI flow.
4. Do not commit `.env.local`, credentials, or personal configuration.

## Project conventions

- Use JavaScript modules and the `@/` path alias for source imports.
- Keep API handlers in `src/app/api` and reusable server logic in `src/lib`.
- Return clear error messages from API routes without exposing secrets.
- Update the relevant documentation when behavior or configuration changes.
