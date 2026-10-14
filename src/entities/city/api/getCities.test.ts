import { describe, expect, it, vi } from "vitest";

import { getCities } from "./getCities";

describe("getCities", () => {
  it("маппит property_types в propertyTypes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json([
          { id: 1, name: "Москва", property_types: ["apartment", "house"] },
          { id: 2, name: "Казань", property_types: ["apartment"] },
        ]),
      ),
    );

    await expect(getCities()).resolves.toEqual([
      { id: 1, name: "Москва", propertyTypes: ["apartment", "house"] },
      { id: 2, name: "Казань", propertyTypes: ["apartment"] },
    ]);
    expect(fetch).toHaveBeenCalledWith("/api/cities", { signal: undefined });
  });
});
