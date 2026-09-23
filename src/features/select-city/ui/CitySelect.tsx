import {useId, useState} from "react";

import {ArrowIcon} from "@src/shared/assets/icons";
import {Autocomplete, Field} from "@src/shared/ui";

import {useCities} from "../model/useCities";

import styles from "./CitySelect.module.scss";

interface CitySelectProps {
  value: number | null;
  onChange: (cityId: number | null) => void;
}

export function CitySelect({value, onChange}: CitySelectProps) {
  const id = useId();
  const {cities, isLoading, error} = useCities();

  const selectedName = cities.find((city) => city.id === value)?.name ?? "";

  // null — пользователь ничего не вводил, в поле показываем выбранный город
  const [query, setQuery] = useState<string | null>(null);

  const normalizedQuery = query?.trim().toLowerCase() ?? "";
  const filteredCities = normalizedQuery
    ? cities.filter((city) => city.name.toLowerCase().includes(normalizedQuery))
    : cities;

  return (
    <Field label="Город" htmlFor={id} error={error}>
      <Autocomplete
        id={id}
        name="city-search"
        enterKeyHint="next"
        value={query ?? selectedName}
        disabled={isLoading || Boolean(error)}
        placeholder={isLoading ? "Загрузка…" : "Выберите город"}
        items={filteredCities}
        getItemKey={(city) => String(city.id)}
        getItemLabel={(city) => city.name}
        emptyText="Город не найден"
        loading={isLoading}
        // Когда город выбран, стрелку заменяет крестик очистки
        endSlot={value == null && <ArrowIcon className={styles.chevron} aria-hidden/>}
        onValueChange={setQuery}
        onSelect={(city) => {
          setQuery(null);
          onChange(city.id);
        }}
        onBlur={() => setQuery(null)}
        clearable={value != null}
        focusOnClear={false}
        onClear={() => {
          setQuery(null);
          onChange(null);
        }}
      />
    </Field>
  );
}
