# Product Roadmap

This roadmap describes the next practical improvements for AI Text Lab.

## Near term

- [ ] Persist conversations so they survive server restarts.
- [ ] Make sidebar history searchable and allow a previous conversation to be reopened.
- [ ] Add copy buttons for messages and code blocks.
- [ ] Show friendly guidance when Ollama is unavailable or the selected model has not been downloaded.
- [ ] Correct any incorrectly rendered interface symbols and emoji.

## Reliability and quality

- [ ] Add automated tests for chat, health, and text-tool API routes.
- [ ] Validate request sizes and return consistent API error responses.
- [ ] Add structured server-side logging.
- [ ] Add rate limiting before exposing the app beyond a personal local environment.

## Larger features

- [ ] Add user accounts and authentication.
- [ ] Store conversations in a database.
- [ ] Let users choose from available local Ollama models.
- [ ] Export a conversation as Markdown or JSON.
- [ ] Add conversation titles, rename, and delete controls.

## Deployment readiness

- [ ] Add environment-specific configuration and deployment instructions.
- [ ] Add monitoring and error tracking.
- [ ] Document backup and retention rules for persisted conversations.
