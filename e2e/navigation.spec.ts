import { expect, test } from "@playwright/test";

import {
  chooseAddress,
  chooseApartment,
  completeWizard,
  fillApartment,
  mockApi,
} from "./fixtures.ts";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test.describe("guard'ы шагов при пустом сторе", () => {
  for (const path of ["/predict/address", "/predict/details", "/predict/result"]) {
    test(`${path} → главная`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL("/");
    });
  }

  test("неизвестный роут → главная", async ({ page }) => {
    await page.goto("/no-such-page");
    await expect(page).toHaveURL("/");
  });
});

test("без адреса детали редиректят на шаг адреса", async ({ page }) => {
  await chooseApartment(page);

  await page.goto("/predict/details");
  await expect(page).toHaveURL("/predict/address");
});

test("на главной только квартира доступна, дом и участок — beta", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: /Квартира/ })).toBeEnabled();
  await expect(page.getByRole("button", { name: /Дом/ })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Участок/ })).toBeDisabled();
});

test("в списке городов только города с моделью для квартир", async ({ page }) => {
  await chooseApartment(page);
  await page.getByRole("combobox", { name: "Город" }).click();

  await expect(page.getByRole("option")).toHaveText(["Москва", "Казань"]);
});

test("смена города сбрасывает выбранный адрес", async ({ page }) => {
  await chooseApartment(page);
  await chooseAddress(page);
  await page.getByRole("button", { name: "Назад" }).click();

  await expect(page.getByRole("combobox", { name: "Адрес" })).toHaveValue(
    "Тверская улица, 1, Москва",
  );

  await page.getByRole("combobox", { name: "Город" }).click();
  await page.getByRole("option", { name: "Казань" }).click();

  await expect(page.getByRole("combobox", { name: "Адрес" })).toHaveValue("");
  await expect(page.getByRole("button", { name: "Продолжить" })).toBeDisabled();
});

test("этаж выше этажности — ошибка и расчёт недоступен", async ({ page }) => {
  await chooseApartment(page);
  await chooseAddress(page);
  await fillApartment(page, { floor: "12", floorsTotal: "9" });
  await page.getByLabel("Этажей в доме").blur();

  await expect(page.getByText("Выше этажности дома")).toBeVisible();
  await expect(page.getByRole("button", { name: "Рассчитать стоимость" })).toBeDisabled();
});

test("«Назад» в шапке ведёт на предыдущий шаг, на главной её нет", async ({ page }) => {
  await completeWizard(page);

  await page.getByRole("button", { name: "Назад" }).click();
  await expect(page).toHaveURL("/predict/details");
  await page.getByRole("button", { name: "Назад" }).click();
  await expect(page).toHaveURL("/predict/address");
  await page.getByRole("button", { name: "Назад" }).click();
  await expect(page).toHaveURL("/");

  await expect(page.getByRole("button", { name: "Назад" })).toBeHidden();
});

test("логотип ведёт на главную и сбрасывает вводные", async ({ page }) => {
  await chooseApartment(page);
  await chooseAddress(page);

  await page.getByRole("link", { name: "estima — на главную" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/predict/address");
  await expect(page).toHaveURL("/");
});
