/** Подсказка из поиска адресов. */
export interface AddressSuggestion {
  uri: string;
  title: string;
  subtitle?: string;
}

/** Выбранный пользователем адрес: uri уходит в /api/predict, label — для показа. */
export interface SelectedAddress {
  uri: string;
  label: string;
}
