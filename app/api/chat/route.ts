import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ReqBody = {
  prompt: string;
  session_id?: string | null;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody;

    if (!body?.prompt || typeof body.prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server misconfigured: missing DASHSCOPE_API_KEY" },
        { status: 500 }
      );
    }

    const url = "https://dashscope.aliyuncs.com/api/v1/apps/2d547ff0bf13486680ecc1f339ac8553/completion";

    const upstreamResp = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          prompt: body.prompt,
          ...(body.session_id ? { session_id: body.session_id } : {}),
        },
      }),
    });

    const text = await upstreamResp.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      // keep raw
    }

    if (!upstreamResp.ok) {
      return NextResponse.json(
        {
          error: "Upstream error",
          status: upstreamResp.status,
          data: data ?? text,
        },
        { status: 502 }
      );
    }

    const answer = data?.output?.text ?? "";
    const session_id = data?.output?.session_id ?? null;

    return NextResponse.json({ answer, session_id, raw: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
