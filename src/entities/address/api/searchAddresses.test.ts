import { describe, expect, it, vi } from "vitest";

import { searchAddresses } from "./searchAddresses";

describe("searchAddresses", () => {
  it("кодирует параметры в query string", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ items: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await searchAddresses({ cityId: 1, propertyType: "apartment", query: "Тверская 1&2" });

    const url = new URL(fetchMock.mock.calls[0][0], "http://localhost");
    expect(url.pathname).toBe("/api/addresses/search");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      city_id: "1",
      property_type: "apartment",
      query: "Тверская 1&2",
    });
  });

  it("маппит подсказки, null → undefined", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          items: [
            {
              uri: "uri-1",
              title: "Тверская улица, 1",
              subtitle: "Москва",
              formatted_address: "Россия, Москва, Тверская улица, 1",
              kind: "house",
            },
            {
              uri: "uri-2",
              title: "Тверская улица",
              subtitle: null,
              formatted_address: null,
              kind: null,
            },
          ],
        }),
      ),
    );

    await expect(
      searchAddresses({ cityId: 1, propertyType: "apartment", query: "Тверская" }),
    ).resolves.toEqual([
      {
        uri: "uri-1",
        title: "Тверская улица, 1",
        subtitle: "Москва",
        formattedAddress: "Россия, Москва, Тверская улица, 1",
        kind: "house",
      },
      {
        uri: "uri-2",
        title: "Тверская улица",
        subtitle: undefined,
        formattedAddress: undefined,
        kind: undefined,
      },
    ]);
  });
});
