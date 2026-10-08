import {request} from "@src/shared/api";
import type {PropertyType} from "@src/entities/property";

import type {AddressKind, AddressSuggestion} from "../model/types";

interface SearchAddressesParams {
  cityId: number;
  /** Бэкенд отдаёт только адреса в зоне покрытия модели этого типа. */
  propertyType: PropertyType;
  query: string;
}

interface SearchAddressesResponse {
  items: {
    uri: string;
    title: string;
    subtitle: string | null;
    formatted_address: string | null;
    kind: AddressKind | null;
  }[];
}

export async function searchAddresses(
  {cityId, propertyType, query}: SearchAddressesParams,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> {
  const params = new URLSearchParams({
    city_id: String(cityId),
    property_type: propertyType,
    query,
  });

  const data = await request<SearchAddressesResponse>(
    `/api/addresses/search?${params.toString()}`,
    {signal},
  );

  return data.items.map((item) => ({
    uri: item.uri,
    title: item.title,
    subtitle: item.subtitle ?? undefined,
    formattedAddress: item.formatted_address ?? undefined,
    kind: item.kind ?? undefined,
  }));
}
