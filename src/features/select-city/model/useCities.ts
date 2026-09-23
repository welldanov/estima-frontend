import {useEffect, useState} from "react";

import {getCities, type City} from "@src/entities/city";
import {isAbortError} from "@src/shared/api";

interface CitiesState {
  cities: City[];
  isLoading: boolean;
  error: string | null;
}

export function useCities(): CitiesState {
  const [state, setState] = useState<CitiesState>({
    cities: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    getCities(controller.signal)
      .then((cities) => setState({cities, isLoading: false, error: null}))
      .catch((error: unknown) => {
        if (isAbortError(error)) {
          return;
        }

        setState({
          cities: [],
          isLoading: false,
          error: "Не удалось загрузить список городов",
        });
      });

    return () => controller.abort();
  }, []);

  return state;
}
