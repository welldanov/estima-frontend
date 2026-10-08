/** Данные квартиры для оценки (camelCase, маппинг в snake_case — в api). */
export interface ApartmentPredictionParams {
  cityId: number;
  addressUri: string;
  areaM2: number;
  rooms: number | null;
  isStudio: boolean;
  floor: number;
  floorsTotal: number;
}

export interface Prediction {
  predictedPrice: number;
  address: {
    formattedAddress: string;
    /** Точность геокодинга Yandex: house | street | district | locality (для квартиры всегда house). */
    kind: string;
    lat: number;
    lon: number;
    distanceToCenterKm: number;
  };
}
