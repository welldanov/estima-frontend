import { describe, expect, it } from "vitest";

import { APARTMENT_AREA, validateApartment } from "./apartment";
import type { ApartmentDetails } from "./valuationStore";

const valid: ApartmentDetails = {
  areaM2: 45,
  rooms: 2,
  isStudio: false,
  floor: 5,
  floorsTotal: 9,
};

describe("validateApartment", () => {
  it("принимает полностью заполненную квартиру", () => {
    expect(validateApartment(valid)).toEqual({
      areaError: null,
      floorError: null,
      floorsTotalError: null,
      isValid: true,
    });
  });

  it("пустая форма невалидна, но без ошибок — их показываем только для введённых значений", () => {
    const result = validateApartment({
      areaM2: null,
      rooms: null,
      isStudio: false,
      floor: null,
      floorsTotal: null,
    });

    expect(result).toEqual({
      areaError: null,
      floorError: null,
      floorsTotalError: null,
      isValid: false,
    });
  });

  describe("комнаты", () => {
    it("без комнат и не студия — невалидно", () => {
      expect(validateApartment({ ...valid, rooms: null }).isValid).toBe(false);
    });

    it("студия валидна без числа комнат", () => {
      expect(validateApartment({ ...valid, rooms: null, isStudio: true }).isValid).toBe(true);
    });
  });

  describe("площадь", () => {
    it.each([APARTMENT_AREA.min, APARTMENT_AREA.max])("граница %d м² допустима", (areaM2) => {
      const result = validateApartment({ ...valid, areaM2 });

      expect(result.areaError).toBeNull();
      expect(result.isValid).toBe(true);
    });

    it.each([APARTMENT_AREA.min - 0.1, APARTMENT_AREA.max + 1, 0])(
      "%d м² — ошибка диапазона",
      (areaM2) => {
        const result = validateApartment({ ...valid, areaM2 });

        expect(result.areaError).toBe("Площадь — от 8 до 1000 м²");
        expect(result.isValid).toBe(false);
      },
    );

    it("без площади — невалидно", () => {
      expect(validateApartment({ ...valid, areaM2: null }).isValid).toBe(false);
    });
  });

  describe("этаж и этажность", () => {
    it("этаж выше этажности дома — ошибка", () => {
      const result = validateApartment({ ...valid, floor: 10, floorsTotal: 9 });

      expect(result.floorError).toBe("Выше этажности дома");
      expect(result.isValid).toBe(false);
    });

    it("последний этаж допустим", () => {
      expect(validateApartment({ ...valid, floor: 9, floorsTotal: 9 }).isValid).toBe(true);
    });

    it("этаж меньше 1 — ошибка", () => {
      expect(validateApartment({ ...valid, floor: 0 }).floorError).toBe("Не меньше 1");
    });

    it("этажность меньше 1 — ошибка", () => {
      const result = validateApartment({ ...valid, floor: null, floorsTotal: 0 });

      expect(result.floorsTotalError).toBe("Не меньше 1");
      expect(result.isValid).toBe(false);
    });

    it("этаж без этажности не сравнивается с ней, но форма неполная", () => {
      const result = validateApartment({ ...valid, floor: 30, floorsTotal: null });

      expect(result.floorError).toBeNull();
      expect(result.isValid).toBe(false);
    });
  });
});
