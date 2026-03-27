import { cookies } from "next/headers";

export const OPS_AUTH_COOKIE_NAME = "datematch_ops_token";

export function getConfiguredOpsToken() {
  return process.env.OPS_DASHBOARD_TOKEN?.trim() ?? "";
}

export function isOpsBypassEnabled() {
  return process.env.NODE_ENV !== "production" && !getConfiguredOpsToken();
}

export function isOpsAuthenticated() {
  const token = getConfiguredOpsToken();

  if (!token) {
    return isOpsBypassEnabled();
  }

  return cookies().get(OPS_AUTH_COOKIE_NAME)?.value === token;
}
