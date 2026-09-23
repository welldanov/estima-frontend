import {request} from "@src/shared/api";

import type {AddressSuggestion} from "../model/types";

interface SearchAddressesParams {
  cityId: number;
  query: string;
}

interface SearchAddressesResponse {
  items: AddressSuggestion[];
}

export async function searchAddresses(
  {cityId, query}: SearchAddressesParams,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> {
  const params = new URLSearchParams({
    city_id: String(cityId),
    query,
  });

  const data = await request<SearchAddressesResponse>(
    `/api/addresses/search?${params.toString()}`,
    {signal},
  );

  return data.items;
}
