import {request} from "@src/shared/api";

import type {City} from "../model/types";

export function getCities(signal?: AbortSignal): Promise<City[]> {
  return request<City[]>("/api/cities", {signal});
}
