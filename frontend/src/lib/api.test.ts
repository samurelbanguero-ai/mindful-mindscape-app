import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "./api";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiRequest con refresco de sesión", () => {
  it("dos peticiones con 401 comparten un solo refresco y ambas se resuelven", async () => {
    let refreshCalls = 0;
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith("/auth/refresh-token")) {
        refreshCalls++;
        return json(200, { accessToken: "nuevo" });
      }
      const auth = new Headers(init?.headers).get("Authorization");
      return auth === "Bearer nuevo"
        ? json(200, { ok: url })
        : json(401, { error: "Token inválido o expirado" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const [a, b] = await Promise.all([
      apiRequest("/diary/entries"),
      apiRequest("/support/unread-count"),
    ]);

    expect(a.ok).toContain("/diary/entries");
    expect(b.ok).toContain("/support/unread-count");
    expect(refreshCalls).toBe(1);
  });

  it("si el refresco falla, todas las peticiones fallan con 'Sesión expirada' (ninguna queda colgada)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url.endsWith("/auth/refresh-token")
          ? json(401, { error: "Refresh token requerido" })
          : json(401, { error: "Token requerido" }),
      ),
    );

    const results = await Promise.allSettled([
      apiRequest("/diary/entries"),
      apiRequest("/profile"),
    ]);

    for (const r of results) {
      expect(r.status).toBe("rejected");
      expect((r as PromiseRejectedResult).reason.message).toBe("Sesión expirada");
    }
  });

  it("no intenta refrescar cuando falla el propio login", async () => {
    const fetchMock = vi.fn(async () => json(401, { error: "Credenciales inválidas" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest("/auth/login", { method: "POST" })).rejects.toThrow(
      "Credenciales inválidas",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
