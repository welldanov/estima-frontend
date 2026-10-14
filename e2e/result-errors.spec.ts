import { expect, test } from "@playwright/test";

import { completeWizard, mockApi, PREDICTION } from "./fixtures.ts";

test("4xx: текст ошибки с бэкенда и «Изменить адрес» вместо повтора", async ({ page }) => {
  await mockApi(page, {
    predict: [{ status: 404, json: { detail: "Адрес вне зоны покрытия модели" } }],
  });

  await completeWizard(page);

  await expect(page.getByText("Не удалось рассчитать")).toBeVisible();
  await expect(page.getByText("Адрес вне зоны покрытия модели")).toBeVisible();
  await expect(page.getByRole("button", { name: "Повторить" })).toHaveCount(0);

  await page.getByRole("button", { name: "Изменить адрес" }).click();
  await expect(page).toHaveURL("/predict/address");
});

test("5xx: «Повторить» отправляет запрос заново", async ({ page }) => {
  const api = await mockApi(page, {
    predict: [
      { status: 503, json: { detail: "Достигнут дневной лимит запросов" } },
      { json: PREDICTION },
    ],
  });

  await completeWizard(page);

  await expect(page.getByText("Достигнут дневной лимит запросов")).toBeVisible();
  await page.getByRole("button", { name: "Повторить" }).click();

  await expect(page.getByText(/^12\s346\s000\s₽$/)).toBeVisible();
  expect(api.predictRequests).toHaveLength(2);
});

test("ответ не JSON (сбой прокси) — общий текст ошибки", async ({ page }) => {
  await mockApi(page);
  await page.route("**/api/predict", (route) =>
    route.fulfill({ status: 502, contentType: "text/html", body: "<html>Bad Gateway</html>" }),
  );

  await completeWizard(page);

  await expect(
    page.getByText("Проверьте подключение к интернету и попробуйте ещё раз"),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Повторить" })).toBeVisible();
});
