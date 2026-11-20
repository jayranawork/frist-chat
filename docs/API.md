# API Reference

The API routes are implemented by Next.js route handlers. Unless noted otherwise, send JSON with `Content-Type: application/json`.

## Health check

`GET /api/health`

Returns the service status.

```json
{ "status": "ok" }
```

## Chat

`POST /api/chat`

Starts a conversation or continues one. The response body is streamed as plain text. The response includes an `X-Session-Id` header; send that value in later requests to retain context.

```json
{
  "sessionId": "optional-existing-session-id",
  "message": "Explain JavaScript promises"
}
```

To clear a session, call `DELETE /api/chat`:

```json
{ "sessionId": "session-id" }
```

## Text tools

Each route accepts the following body:

```json
{ "text": "Text to process" }
```

| Route | Response field | Purpose |
| --- | --- | --- |
| `POST /api/summarize` | `summary` | Creates a concise summary. |
| `POST /api/explain` | `explanation` | Explains the supplied text. |
| `POST /api/rewrite` | `rewritten` | Rewrites the supplied text. |
| `POST /api/extract` | `data` | Extracts structured JSON data. |
| `POST /api/classify` | `category` | Classifies the supplied text. |

Classification may include a comma-separated `categories` field:

```json
{
  "text": "I love this product",
  "categories": "positive, negative, neutral"
}
```

## Errors

Invalid input or an unavailable Ollama service produces a non-success HTTP response with a JSON error message. Clients should check `response.ok` before using a response.
