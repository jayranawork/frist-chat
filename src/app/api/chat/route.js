import { NextResponse } from "next/server";
import { clearChat, streamChatMessage } from "@/lib/chat-store";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      throw new ApiError("The request body must be valid JSON", 400);
    }

    const result = await streamChatMessage(body);
    return new Response(result.stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Session-Id": result.sessionId,
      },
    });
  } catch (error) {
    const { message, status } = errorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(clearChat(body.sessionId));
  } catch (error) {
    const { message, status } = errorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
