import { NextResponse } from "next/server";
import { clearChat, streamChatMessage } from "@/lib/chat-store";

export async function POST(request) {
  try {
    const result = await streamChatMessage(await request.json());
    return new Response(result.stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Session-Id": result.sessionId,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(clearChat(body.sessionId));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
