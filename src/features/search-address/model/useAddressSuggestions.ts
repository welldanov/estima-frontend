import {useEffect, useState} from "react";

import {searchAddresses, type AddressSuggestion} from "@src/entities/address";
import type {PropertyType} from "@src/entities/property";
import {getErrorMessage, isAbortError} from "@src/shared/api";
import {useDebouncedValue} from "@src/shared/lib";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

interface SearchResult {
  key: string;
  items: AddressSuggestion[];
  /** Текст ошибки (503 — исчерпан дневной лимит Yandex, 502 — Yandex недоступен), null — успех. */
  error: string | null;
}

/**
 * Подсказки адресов с debounce и отменой устаревших запросов.
 * Загрузка выводится из того, к какому запросу относится последний ответ,
 * поэтому setState синхронно в эффекте не нужен.
 */
export function useAddressSuggestions(
  cityId: number | null,
  propertyType: PropertyType,
  query: string,
  enabled: boolean,
) {
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(trimmedQuery, DEBOUNCE_MS);

  // Текущий запрос тоже проверяем: после очистки поля старые подсказки не должны висеть до конца debounce
  const canSearch = enabled
    && cityId != null
    && trimmedQuery.length >= MIN_QUERY_LENGTH
    && debouncedQuery.length >= MIN_QUERY_LENGTH;
  const requestKey = canSearch ? `${cityId}:${propertyType}:${debouncedQuery}` : null;

  const [result, setResult] = useState<SearchResult | null>(null);

  useEffect(() => {
    if (requestKey === null || cityId == null) {
      return;
    }

    const controller = new AbortController();

    searchAddresses({cityId, propertyType, query: debouncedQuery}, controller.signal)
      .then((items) => setResult({key: requestKey, items, error: null}))
      .catch((error: unknown) => {
        if (!isAbortError(error)) {
          setResult({
            key: requestKey,
            items: [],
            error: getErrorMessage(error, "Не удалось загрузить адреса, попробуйте ещё раз"),
          });
        }
      });

    return () => controller.abort();
  }, [requestKey, cityId, propertyType, debouncedQuery]);

  const isFresh = requestKey !== null && result?.key === requestKey;
  const isTyping = enabled
    && trimmedQuery !== debouncedQuery
    && trimmedQuery.length >= MIN_QUERY_LENGTH;

  return {
    items: isFresh ? result.items : [],
    isLoading: isTyping || (requestKey !== null && !isFresh),
    isEmpty: isFresh && result.error === null && result.items.length === 0,
    error: isFresh ? result.error : null,
  };
}
