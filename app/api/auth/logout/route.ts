import { apiSuccess } from "@/lib/api-route";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = apiSuccess();
  response.cookies.set({
    name: "datematch_session",
    value: "",
    maxAge: 0,
    path: "/",
  });
  return response;
}
