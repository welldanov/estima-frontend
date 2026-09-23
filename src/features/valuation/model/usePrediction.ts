import {useEffect, useState} from "react";

import {predictApartment} from "@src/entities/prediction";
import type {Prediction} from "@src/entities/prediction";
import {isAbortError} from "@src/shared/api";

import {validateApartment} from "./apartment";
import {useValuationStore} from "./valuationStore";

// Бэкенд отвечает за доли секунды — без минимума загрузка мелькает и выглядит как сбой.
const MIN_LOADING_MS = 800;

export type PredictionState =
  | {status: "loading"}
  | {status: "success"; result: Prediction}
  | {status: "error"; retry: () => void};

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(resolve, ms);
    signal.addEventListener("abort", () => window.clearTimeout(timer));
  });
}

/**
 * Запрашивает оценку, если в сторе ещё нет результата для текущих вводных.
 * Вызывать только с заполненными данными квартиры — проверка и редиректы на странице.
 */
export function usePrediction(): PredictionState {
  const propertyType = useValuationStore((s) => s.propertyType);
  const cityId = useValuationStore((s) => s.cityId);
  const addressUri = useValuationStore((s) => s.address?.uri ?? null);
  const apartment = useValuationStore((s) => s.apartment);
  const result = useValuationStore((s) => s.result);
  const setResult = useValuationStore((s) => s.setResult);

  const [failedAttempt, setFailedAttempt] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);

  const {areaM2, rooms, isStudio, floor, floorsTotal} = apartment;

  useEffect(() => {
    const {isValid} = validateApartment({areaM2, rooms, isStudio, floor, floorsTotal});

    if (result || !isValid || propertyType !== "apartment" || cityId == null || !addressUri
      || areaM2 == null || floor == null || floorsTotal == null) {
      return;
    }

    const controller = new AbortController();
    const params = {cityId, addressUri, areaM2, rooms, isStudio, floor, floorsTotal};

    // allSettled: минимум загрузки держим и при ошибке — иначе быстрый отказ (бэкенд лежит)
    // мелькает «загрузка → ошибка» за один кадр после «Повторить».
    Promise.allSettled([
      predictApartment(params, controller.signal),
      delay(MIN_LOADING_MS, controller.signal),
    ]).then(([response]) => {
      if (response.status === "fulfilled") {
        setResult(response.value);
      } else if (!isAbortError(response.reason)) {
        setFailedAttempt(attempt);
      }
    });

    return () => controller.abort();
  }, [result, propertyType, cityId, addressUri, areaM2, rooms, isStudio, floor, floorsTotal, attempt, setResult]);

  if (result) {
    return {status: "success", result};
  }

  if (failedAttempt === attempt) {
    return {status: "error", retry: () => setAttempt((value) => value + 1)};
  }

  return {status: "loading"};
}
