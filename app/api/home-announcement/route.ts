import { apiSuccess, handleApiRouteError } from "@/lib/api-route";
import { getResolvedHomeAnnouncement } from "@/lib/home-announcement-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const resolved = await getResolvedHomeAnnouncement();

    return apiSuccess({
      announcement: resolved.announcement,
      source: resolved.source,
      warning: resolved.warning,
    });
  } catch (error) {
    return handleApiRouteError(error, {
      message: "加载公告失败，请稍后重试",
      code: "HOME_ANNOUNCEMENT_LOAD_FAILED",
      logMessage: "load home announcement failed:",
    });
  }
}
