import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, "");
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const sendId = typeof payload?.sendId === "string" ? payload.sendId.trim() : "";
    const receiveId = typeof payload?.receiveId === "string" ? payload.receiveId.trim() : "";

    if (!sendId || !receiveId) {
      return NextResponse.json({ error: "缺少 sendId 或 receiveId" }, { status: 400 });
    }

    const baseUrl = process.env.KAMACHAT_API_URL || process.env.NEXT_PUBLIC_KAMACHAT_WEB_URL || "";

    if (!baseUrl) {
      return NextResponse.json(
        { error: "未配置 KAMACHAT_API_URL 或 NEXT_PUBLIC_KAMACHAT_WEB_URL" },
        { status: 400 }
      );
    }

    const response = await fetch(`${normalizeBaseUrl(baseUrl)}/session/openSession`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        send_id: sendId,
        receive_id: receiveId,
      }),
      cache: "no-store",
    });

    const rawText = await response.text();
    let upstream: unknown = rawText;

    try {
      upstream = JSON.parse(rawText);
    } catch {
      // Keep raw text when upstream is not JSON.
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "调用 KamaChat openSession 失败",
          status: response.status,
          upstream,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      upstream,
    });
  } catch (error) {
    console.error("Error opening KamaChat session:", error);
    return NextResponse.json({ error: "打开 KamaChat 会话失败" }, { status: 500 });
  }
}
