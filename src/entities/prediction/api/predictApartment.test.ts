import { describe, expect, it, vi } from "vitest";

import { predictApartment } from "./predictApartment";

describe("predictApartment", () => {
  it("шлёт snake_case и маппит ответ в camelCase", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        predicted_price: 12_500_000,
        address: {
          formatted_address: "Москва, Тверская улица, 1",
          kind: "house",
          lat: 55.75,
          lon: 37.61,
          distance_to_center_km: 0.8,
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const signal = new AbortController().signal;

    const result = await predictApartment(
      {
        cityId: 1,
        addressUri: "ymapsbm1://geo?x",
        areaM2: 45,
        rooms: null,
        isStudio: true,
        floor: 5,
        floorsTotal: 9,
      },
      signal,
    );

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/predict");
    expect(init).toMatchObject({ method: "POST", signal });
    expect(JSON.parse(init.body)).toEqual({
      property_type: "apartment",
      city_id: 1,
      address: { uri: "ymapsbm1://geo?x" },
      area_m2: 45,
      rooms: null,
      is_studio: true,
      floor: 5,
      floors_total: 9,
    });

    expect(result).toEqual({
      predictedPrice: 12_500_000,
      address: {
        formattedAddress: "Москва, Тверская улица, 1",
        kind: "house",
        lat: 55.75,
        lon: 37.61,
        distanceToCenterKm: 0.8,
      },
    });
  });
});
