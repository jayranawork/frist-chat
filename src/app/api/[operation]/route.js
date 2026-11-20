import { NextResponse } from "next/server";
import { runTextTool } from "@/lib/text-tools";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function POST(request, { params }) {
  try {
    const routeParams = await params;
    let body;
    try {
      body = await request.json();
    } catch {
      throw new ApiError("The request body must be valid JSON", 400);
    }

    const result = await runTextTool(routeParams.operation, body);
    return NextResponse.json(result);
  } catch (error) {
    const { message, status } = errorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
