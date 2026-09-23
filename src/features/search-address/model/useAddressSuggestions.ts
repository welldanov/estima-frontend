import {useEffect, useState} from "react";

import {searchAddresses, type AddressSuggestion} from "@src/entities/address";
import {isAbortError} from "@src/shared/api";
import {useDebouncedValue} from "@src/shared/lib";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

interface SearchResult {
  key: string;
  items: AddressSuggestion[];
  failed: boolean;
}

/**
 * Подсказки адресов с debounce и отменой устаревших запросов.
 * Загрузка выводится из того, к какому запросу относится последний ответ,
 * поэтому setState синхронно в эффекте не нужен.
 */
export function useAddressSuggestions(cityId: number | null, query: string, enabled: boolean) {
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(trimmedQuery, DEBOUNCE_MS);

  // Текущий запрос тоже проверяем: после очистки поля старые подсказки не должны висеть до конца debounce
  const canSearch = enabled
    && cityId != null
    && trimmedQuery.length >= MIN_QUERY_LENGTH
    && debouncedQuery.length >= MIN_QUERY_LENGTH;
  const requestKey = canSearch ? `${cityId}:${debouncedQuery}` : null;

  const [result, setResult] = useState<SearchResult | null>(null);

  useEffect(() => {
    if (requestKey === null || cityId == null) {
      return;
    }

    const controller = new AbortController();

    searchAddresses({cityId, query: debouncedQuery}, controller.signal)
      .then((items) => setResult({key: requestKey, items, failed: false}))
      .catch((error: unknown) => {
        if (!isAbortError(error)) {
          setResult({key: requestKey, items: [], failed: true});
        }
      });

    return () => controller.abort();
  }, [requestKey, cityId, debouncedQuery]);

  const isFresh = requestKey !== null && result?.key === requestKey;
  const isTyping = enabled
    && trimmedQuery !== debouncedQuery
    && trimmedQuery.length >= MIN_QUERY_LENGTH;

  return {
    items: isFresh ? result.items : [],
    isLoading: isTyping || (requestKey !== null && !isFresh),
    isEmpty: isFresh && !result.failed && result.items.length === 0,
    isError: isFresh && result.failed,
  };
}
