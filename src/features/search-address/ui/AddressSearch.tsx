import {useId, useState} from "react";

import {formatAddress, type SelectedAddress} from "@src/entities/address";
import type {PropertyType} from "@src/entities/property";
import {Autocomplete, Field} from "@src/shared/ui";

import {useAddressSuggestions} from "../model/useAddressSuggestions";

interface AddressSearchProps {
  cityId: number | null;
  propertyType: PropertyType;
  value: SelectedAddress | null;
  onChange: (address: SelectedAddress | null) => void;
}

export function AddressSearch({cityId, propertyType, value, onChange}: AddressSearchProps) {
  const id = useId();
  const [query, setQuery] = useState(value?.label ?? "");

  const {items, isLoading, isEmpty, error} = useAddressSuggestions(cityId, propertyType, query, value === null);

  const isDisabled = cityId == null;

  return (
    <Field
      label="Адрес"
      htmlFor={id}
      error={error}
    >
      <Autocomplete
        id={id}
        name="address-search"
        enterKeyHint="done"
        value={query}
        disabled={isDisabled}
        placeholder={isDisabled ? "Сначала выберите город" : "Улица и номер дома"}
        items={items}
        getItemKey={(item) => item.uri}
        getItemLabel={(item) => item.title}
        getItemDescription={(item) => item.subtitle}
        loading={isLoading}
        emptyText={isEmpty ? "Ничего не найдено" : undefined}
        invalid={error != null}
        onValueChange={(nextQuery) => {
          setQuery(nextQuery);

          if (value) {
            onChange(null);
          }
        }}
        onSelect={(item) => {
          const label = formatAddress(item);

          setQuery(label);
          onChange({uri: item.uri, label});
        }}
        clearable={value != null}
        onClear={() => {
          setQuery("");

          if (value) {
            onChange(null);
          }
        }}
      />
    </Field>
  );
}
