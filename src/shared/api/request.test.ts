import { describe, expect, it, vi } from "vitest";

import { ApiError, getErrorMessage, isAbortError, request } from "./request";

function mockFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("request", () => {
  it("возвращает JSON при успешном ответе и передаёт init в fetch", async () => {
    const fetchMock = mockFetch(Response.json({ ok: true }));
    const init = { method: "POST" };

    await expect(request("/api/x", init)).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith("/api/x", init);
  });

  it("при ошибке бросает ApiError со статусом и текстом detail", async () => {
    mockFetch(Response.json({ detail: "Адрес вне зоны покрытия" }, { status: 404 }));

    const error = await request("/api/x").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, detail: "Адрес вне зоны покрытия" });
  });

  it("detail-массив валидации FastAPI не показываем", async () => {
    mockFetch(
      Response.json({ detail: [{ loc: ["body"], msg: "field required" }] }, { status: 422 }),
    );

    await expect(request("/api/x")).rejects.toMatchObject({ status: 422, detail: null });
  });

  it("тело ошибки не JSON (HTML прокси) — detail null", async () => {
    mockFetch(new Response("<html>Bad Gateway</html>", { status: 502 }));

    await expect(request("/api/x")).rejects.toMatchObject({ status: 502, detail: null });
  });
});

describe("getErrorMessage", () => {
  it("берёт detail из ApiError", () => {
    expect(getErrorMessage(new ApiError(503, "Дневной лимит"), "Ошибка")).toBe("Дневной лимит");
  });

  it.each([
    ["ApiError без detail", new ApiError(500)],
    ["сетевая ошибка", new TypeError("Failed to fetch")],
    ["не ошибка", "oops"],
  ])("%s — fallback", (_, error) => {
    expect(getErrorMessage(error, "Ошибка")).toBe("Ошибка");
  });
});

describe("isAbortError", () => {
  it("распознаёт отмену запроса", () => {
    expect(isAbortError(new DOMException("aborted", "AbortError"))).toBe(true);
  });

  it("другие ошибки — нет", () => {
    expect(isAbortError(new DOMException("x", "NetworkError"))).toBe(false);
    expect(isAbortError(new Error("AbortError"))).toBe(false);
  });
});
