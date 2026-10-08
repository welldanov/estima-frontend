/** Тип объекта по Yandex: дом, улица, район, населённый пункт. */
export type AddressKind = "house" | "street" | "district" | "locality";

/** Подсказка из поиска адресов. */
export interface AddressSuggestion {
  uri: string;
  title: string;
  subtitle?: string;
  /** Полный адрес от Yandex («Республика Татарстан, Казань, улица Баумана, 9»). */
  formattedAddress?: string;
  kind?: AddressKind;
}

/** Выбранный пользователем адрес: uri уходит в /api/predict, label — для показа. */
export interface SelectedAddress {
  uri: string;
  label: string;
}
