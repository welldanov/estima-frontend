export class ApiError extends Error {
  readonly status: number;
  /** Текст ошибки для пользователя из `{detail: string}`; ошибки валидации FastAPI (массив) сюда не попадают. */
  readonly detail: string | null;

  constructor(status: number, detail: string | null = null) {
    super(`Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function readDetail(response: Response): Promise<string | null> {
  try {
    const body: unknown = await response.json();

    if (body && typeof body === "object" && "detail" in body && typeof body.detail === "string") {
      return body.detail;
    }
  } catch {
    // Тело не JSON (прокси, HTML-страница ошибки) — показываем общий текст
  }

  return null;
}

export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new ApiError(response.status, await readDetail(response));
  }

  return await response.json() as Promise<T>;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/** Текст ошибки бэкенда для показа пользователю, иначе `fallback`. */
export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError && error.detail ? error.detail : fallback;
}
