import {request} from "@src/shared/api";
import type {PropertyType} from "@src/entities/property";

import type {City} from "../model/types";

interface CityResponse {
  id: number;
  name: string;
  property_types: PropertyType[];
}

export async function getCities(signal?: AbortSignal): Promise<City[]> {
  const data = await request<CityResponse[]>("/api/cities", {signal});

  return data.map((city) => ({
    id: city.id,
    name: city.name,
    propertyTypes: city.property_types,
  }));
}
