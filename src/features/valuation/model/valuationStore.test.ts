import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Prediction } from "@src/entities/prediction";

// persist читает sessionStorage при создании стора — подставляем до импорта (в node его нет)
vi.hoisted(() => {
  const data = new Map<string, string>();

  globalThis.sessionStorage = {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, String(value)),
  };
});

import { useValuationStore } from "./valuationStore";

const prediction: Prediction = {
  predictedPrice: 10_000_000,
  address: {
    formattedAddress: "Москва, Тверская улица, 1",
    kind: "house",
    lat: 55.75,
    lon: 37.61,
    distanceToCenterKm: 0.5,
  },
};

const store = () => useValuationStore.getState();

describe("useValuationStore", () => {
  beforeEach(() => {
    store().reset();
    sessionStorage.clear();
  });

  describe("любой сеттер ввода сбрасывает result", () => {
    it.each([
      ["setPropertyType", () => store().setPropertyType("apartment")],
      ["setCityId", () => store().setCityId(2)],
      ["setAddress", () => store().setAddress({ uri: "ymapsbm1://geo?x", label: "Тверская, 1" })],
      ["setApartmentDetails", () => store().setApartmentDetails({ areaM2: 50 })],
      ["setHouseDetails", () => store().setHouseDetails({ houseAreaM2: 120 })],
      ["setLandDetails", () => store().setLandDetails({ landAreaM2: 6 })],
    ])("%s", (_, act) => {
      store().setResult(prediction);
      act();

      expect(store().result).toBeNull();
    });
  });

  describe("setCityId", () => {
    it("смена города сбрасывает адрес", () => {
      store().setCityId(1);
      store().setAddress({ uri: "uri", label: "Тверская, 1" });
      store().setCityId(2);

      expect(store().cityId).toBe(2);
      expect(store().address).toBeNull();
    });

    it("тот же город ничего не сбрасывает", () => {
      store().setCityId(1);
      store().setAddress({ uri: "uri", label: "Тверская, 1" });
      store().setResult(prediction);
      store().setCityId(1);

      expect(store().address).not.toBeNull();
      expect(store().result).toEqual(prediction);
    });
  });

  it("setApartmentDetails мержит частичные изменения", () => {
    store().setApartmentDetails({ areaM2: 50, rooms: 2 });
    store().setApartmentDetails({ floor: 3 });

    expect(store().apartment).toEqual({
      areaM2: 50,
      rooms: 2,
      isStudio: false,
      floor: 3,
      floorsTotal: null,
    });
  });

  it("reset возвращает начальное состояние", () => {
    store().setPropertyType("apartment");
    store().setCityId(1);
    store().setApartmentDetails({ areaM2: 50 });
    store().setResult(prediction);
    store().reset();

    expect(store()).toMatchObject({
      propertyType: null,
      cityId: null,
      address: null,
      result: null,
      apartment: { areaM2: null },
    });
  });

  it("сохраняет состояние в sessionStorage под ключом estima-valuation", () => {
    store().setPropertyType("apartment");

    const saved = JSON.parse(sessionStorage.getItem("estima-valuation") ?? "null");

    expect(saved.state.propertyType).toBe("apartment");
  });
});
