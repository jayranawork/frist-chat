import { NextResponse } from "next/server";
import { runTextTool } from "@/lib/text-tools";

export async function POST(request, { params }) {
  try {
    const routeParams = await params;
    const result = await runTextTool(routeParams.operation, await request.json());
    return NextResponse.json(result);
  } catch (error) {
    const status = error.message === "Endpoint not found" ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
