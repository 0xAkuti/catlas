import { NextRequest, NextResponse } from "next/server";
import { openrouter, getOpenRouterModel } from "@/lib/openrouter/client";
import { CAT_CLASSIFICATION_PROMPT, type CatAnalysis } from "@/lib/openrouter/prompt";
import type { ChatCompletionCreateParams } from "openai/resources/chat/completions";

type AnalyzeRequest = {
  imageBase64: string; // data URL or raw base64 (no header)
  gps?: { lat: number; lng: number } | null;
  crop?: { x: number; y: number; size: number } | null;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalyzeRequest;
    if (!body?.imageBase64) {
      return NextResponse.json({ error: "Missing imageBase64" }, { status: 400 });
    }

    const base64 = body.imageBase64.includes(",")
      ? body.imageBase64.split(",")[1]
      : body.imageBase64;

    const imageDataUrl = `data:image/jpeg;base64,${base64}`;

    const model = getOpenRouterModel();

    // Use multimodal message content so the model actually receives the image
    const multimodalMessages = [
      { role: "system", content: "You are a precise vision assistant." },
      {
        role: "user" as const,
        content: [
          { type: "text" as const, text: CAT_CLASSIFICATION_PROMPT },
          { type: "image_url" as const, image_url: imageDataUrl },
        ],
      },
    ] as unknown as ChatCompletionCreateParams["messages"];

    const completion = await openrouter.chat.completions.create({
      model,
      messages: multimodalMessages,
      temperature: 0.2,
      response_format: { type: "json_object" } as unknown as ChatCompletionCreateParams["response_format"],
    });

    const content = completion.choices?.[0]?.message?.content || "{}";
    let parsed: CatAnalysis;
    try {
      parsed = JSON.parse(content) as CatAnalysis;
    } catch {
      parsed = { isCat: false, sceneDescription: "Unparseable response" };
    }

    return NextResponse.json({ result: parsed }, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("/api/analyze error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


