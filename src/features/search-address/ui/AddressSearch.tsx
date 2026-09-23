import {useId, useState} from "react";

import {formatAddress, type SelectedAddress} from "@src/entities/address";
import {Autocomplete, Field} from "@src/shared/ui";

import {useAddressSuggestions} from "../model/useAddressSuggestions";

interface AddressSearchProps {
  cityId: number | null;
  value: SelectedAddress | null;
  onChange: (address: SelectedAddress | null) => void;
}

export function AddressSearch({cityId, value, onChange}: AddressSearchProps) {
  const id = useId();
  const [query, setQuery] = useState(value?.label ?? "");

  const {items, isLoading, isEmpty, isError} = useAddressSuggestions(cityId, query, value === null);

  const isDisabled = cityId == null;

  return (
    <Field
      label="Адрес"
      htmlFor={id}
      error={isError ? "Не удалось загрузить адреса, попробуйте ещё раз" : undefined}
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
        invalid={isError}
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
