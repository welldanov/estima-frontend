import { expect, test } from "@playwright/test";

import {
  chooseAddress,
  chooseApartment,
  completeWizard,
  fillApartment,
  mockApi,
} from "./fixtures.ts";

test("полный путь: тип → адрес → параметры → цена", async ({ page }) => {
  const api = await mockApi(page);

  await completeWizard(page);

  // 12 345 678 округляется до тысяч; \s — Intl ставит неразрывные пробелы
  await expect(page.getByText(/^12\s346\s000\s₽$/)).toBeVisible();
  await expect(page.getByText(/274\s000\s₽ за м²/)).toBeVisible();
  await expect(page.getByText("Россия, Москва, Тверская улица, 1")).toBeVisible();

  const params = page.getByRole("region", { name: "Параметры" });
  await expect(params).toContainText("Комнаты2");
  await expect(params).toContainText("Площадь45 м²");
  await expect(params).toContainText("Этаж5 из 9");
  await expect(params).toContainText("До центра0,8 км");

  expect(api.predictRequests).toHaveLength(1);
  expect(api.predictRequests[0].postDataJSON()).toEqual({
    property_type: "apartment",
    city_id: 1,
    address: { uri: "ymapsbm1://geo?tverskaya-1" },
    area_m2: 45,
    rooms: 2,
    is_studio: false,
    floor: 5,
    floors_total: 9,
  });
});

test("студия уходит в запрос как is_studio без комнат", async ({ page }) => {
  const api = await mockApi(page);

  await chooseApartment(page);
  await chooseAddress(page);
  await fillApartment(page, { rooms: "Студия" });
  await page.getByRole("button", { name: "Рассчитать стоимость" }).click();

  await expect(page.getByRole("region", { name: "Параметры" })).toContainText("КомнатыСтудия");
  expect(api.predictRequests[0].postDataJSON()).toMatchObject({ rooms: null, is_studio: true });
});

test("после перезагрузки результат берётся из sessionStorage без повторного запроса", async ({
  page,
}) => {
  const api = await mockApi(page);

  await completeWizard(page);
  await expect(page.getByText(/^12\s346\s000\s₽$/)).toBeVisible();

  await page.reload();

  await expect(page.getByText(/^12\s346\s000\s₽$/)).toBeVisible();
  expect(api.predictRequests).toHaveLength(1);
});

test("«Оценить другой объект» сбрасывает визард", async ({ page }) => {
  await mockApi(page);

  await completeWizard(page);
  await page.getByRole("button", { name: "Оценить другой объект" }).click();

  await expect(page).toHaveURL("/");

  // Вводные сброшены — на результат больше не пускает
  await page.goto("/predict/result");
  await expect(page).toHaveURL("/");
});
