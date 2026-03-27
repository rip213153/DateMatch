import { NextResponse } from "next/server";

type ApiSuccessPayload = Record<string, unknown>;

type ApiErrorOptions = {
  status?: number;
  code?: string;
  details?: unknown;
};

type ApiErrorHandlerOptions = {
  message: string;
  code?: string;
  status?: number;
  logMessage?: string;
};

export class ApiRouteError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, message: string, code: string = "API_ERROR", details?: unknown) {
    super(message);
    this.name = "ApiRouteError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function apiSuccess<T extends ApiSuccessPayload>(payload?: T, init?: ResponseInit) {
  return NextResponse.json(
    {
      success: true,
      ...(payload ?? {}),
    },
    init,
  );
}

export function apiError(message: string, options: ApiErrorOptions = {}) {
  const { status = 500, code = "API_ERROR", details } = options;

  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      ...(details === undefined ? {} : { details }),
    },
    { status },
  );
}

export function handleApiRouteError(error: unknown, options: ApiErrorHandlerOptions) {
  if (error instanceof ApiRouteError) {
    return apiError(error.message, {
      status: error.status,
      code: error.code,
      details: error.details,
    });
  }

  console.error(options.logMessage ?? options.message, error);
  return apiError(options.message, {
    status: options.status ?? 500,
    code: options.code ?? "INTERNAL_SERVER_ERROR",
  });
}

export function assertApi(condition: unknown, message: string, options: ApiErrorOptions = {}): asserts condition {
  if (condition) {
    return;
  }

  throw new ApiRouteError(
    options.status ?? 400,
    message,
    options.code ?? "INVALID_REQUEST",
    options.details,
  );
}

export async function readJsonBody(request: Request) {
  try {
    const body = await request.json();
    assertApi(body && typeof body === "object" && !Array.isArray(body), "请求体格式不正确", {
      status: 400,
      code: "INVALID_JSON_BODY",
    });
    return body as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ApiRouteError) {
      throw error;
    }

    throw new ApiRouteError(400, "请求体格式不正确", "INVALID_JSON_BODY");
  }
}

export function readTrimmedString(value: unknown) {
  return String(value ?? "").trim();
}

export function readLowercaseEmail(value: unknown) {
  return readTrimmedString(value).toLowerCase();
}

export function readPositiveInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

export function readBoolean(value: unknown, defaultValue: boolean = false) {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off"].includes(normalized)) return false;
  }

  return Boolean(value);
}
