import { apiError, apiSuccess, handleApiRouteError } from "@/lib/api-route";
import { filterOpsFeedbackItems, getOpsDashboardData, normalizeOpsFeedbackFilter } from "@/lib/ops-dashboard";
import { isOpsRequestAuthorized } from "@/lib/ops-auth";

export const dynamic = "force-dynamic";

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
    const feedbackFilter = normalizeOpsFeedbackFilter({
      status: readFilterParam(searchParams, "feedbackStatus", "status"),
      source: readFilterParam(searchParams, "feedbackSource", "source"),
      query: readFilterParam(searchParams, "feedbackQuery", "query"),
    });

    const dashboard = await getOpsDashboardData();
    const filteredFeedbackItems = filterOpsFeedbackItems(dashboard.feedback.items, feedbackFilter);

    return apiSuccess(
      {
        dashboard: {
          ...dashboard,
          feedback: {
            ...dashboard.feedback,
            filteredTotal: filteredFeedbackItems.length,
            items: filteredFeedbackItems,
          },
        },
        feedbackFilter,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return handleApiRouteError(error, {
      message: "Failed to load ops dashboard snapshot",
      code: "OPS_DASHBOARD_LOAD_FAILED",
      logMessage: "load ops dashboard snapshot failed:",
    });
  }
}
