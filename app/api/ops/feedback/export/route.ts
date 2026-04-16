import { apiError, handleApiRouteError } from "@/lib/api-route";
import { filterOpsFeedbackItems, getFeedbackSummary } from "@/lib/ops-dashboard";
import { isOpsRequestAuthorized } from "@/lib/ops-auth";

export const dynamic = "force-dynamic";

function escapeCsvValue(value: string | null) {
  const text = value ?? "";
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function readFilterParam(searchParams: URLSearchParams, key: string, legacyKey: string) {
  return searchParams.get(key) ?? searchParams.get(legacyKey) ?? "";
}

export async function GET(request: Request) {
  try {
    if (!isOpsRequestAuthorized(request)) {
      return apiError("Unauthorized", {
        status: 401,
        code: "OPS_UNAUTHORIZED",
      });
    }

    const { searchParams } = new URL(request.url);
    const status = readFilterParam(searchParams, "feedbackStatus", "status");
    const source = readFilterParam(searchParams, "feedbackSource", "source");
    const query = readFilterParam(searchParams, "feedbackQuery", "query");

    const feedback = await getFeedbackSummary(0);
    const items = filterOpsFeedbackItems(feedback.items, {
      status,
      source,
      query,
    });

    const lines = [
      ["submittedAt", "status", "source", "nickname", "content", "emailId", "error"].join(","),
      ...items.map((item) =>
        [
          escapeCsvValue(item.submittedAt),
          escapeCsvValue(item.status),
          escapeCsvValue(item.source),
          escapeCsvValue(item.nickname),
          escapeCsvValue(item.content),
          escapeCsvValue(item.emailId),
          escapeCsvValue(item.error),
        ].join(",")
      ),
    ];

    const csv = `\uFEFF${lines.join("\n")}`;

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ops-feedback-export.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleApiRouteError(error, {
      message: "Failed to export feedback",
      code: "OPS_FEEDBACK_EXPORT_FAILED",
      logMessage: "export ops feedback failed:",
    });
  }
}
