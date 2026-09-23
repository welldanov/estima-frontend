import type {ApartmentDetails} from "./valuationStore";

export const APARTMENT_AREA = {min: 8, max: 1000};
export const APARTMENT_FLOORS = {min: 1, max: 150};

export interface ApartmentValidation {
  areaError: string | null;
  floorError: string | null;
  floorsTotalError: string | null;
  /** Все поля заполнены и без ошибок — можно считать */
  isValid: boolean;
}

/** Одна проверка для формы деталей, guard страницы результата и запроса оценки. */
export function validateApartment(apartment: ApartmentDetails): ApartmentValidation {
  const {areaM2, rooms, isStudio, floor, floorsTotal} = apartment;

  const areaError = areaM2 != null && (areaM2 < APARTMENT_AREA.min || areaM2 > APARTMENT_AREA.max)
    ? `Площадь — от ${APARTMENT_AREA.min} до ${APARTMENT_AREA.max} м²`
    : null;

  const floorError = floor != null && floor < APARTMENT_FLOORS.min
    ? "Не меньше 1"
    : floor != null && floorsTotal != null && floor > floorsTotal
      ? "Выше этажности дома"
      : null;

  const floorsTotalError = floorsTotal != null && floorsTotal < APARTMENT_FLOORS.min
    ? "Не меньше 1"
    : null;

  const isValid =
    (isStudio || rooms != null)
    && areaM2 != null && !areaError
    && floor != null && floorsTotal != null && !floorError && !floorsTotalError;

  return {areaError, floorError, floorsTotalError, isValid};
}
