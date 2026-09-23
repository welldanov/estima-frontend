import {request} from "@src/shared/api";

import type {ApartmentPredictionParams, Prediction} from "../model/types";

interface PredictionResponse {
  predicted_price: number;
  address: {
    formatted_address: string;
    lat: number;
    lon: number;
    distance_to_center_km: number;
  };
}

export async function predictApartment(
  params: ApartmentPredictionParams,
  signal?: AbortSignal,
): Promise<Prediction> {
  const data = await request<PredictionResponse>("/api/predict", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    signal,
    body: JSON.stringify({
      property_type: "apartment",
      city_id: params.cityId,
      address: {uri: params.addressUri},
      area_m2: params.areaM2,
      rooms: params.rooms,
      is_studio: params.isStudio,
      floor: params.floor,
      floors_total: params.floorsTotal,
    }),
  });

  return {
    predictedPrice: data.predicted_price,
    address: {
      formattedAddress: data.address.formatted_address,
      lat: data.address.lat,
      lon: data.address.lon,
      distanceToCenterKm: data.address.distance_to_center_km,
    },
  };
}
