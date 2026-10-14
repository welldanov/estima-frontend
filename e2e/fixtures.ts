import { expect, type Page, type Request } from "@playwright/test";

export const CITIES = [
  { id: 1, name: "Москва", property_types: ["apartment", "house", "land"] },
  { id: 2, name: "Казань", property_types: ["apartment"] },
  { id: 3, name: "Сочи", property_types: ["house"] },
];

export const ADDRESSES = [
  {
    uri: "ymapsbm1://geo?tverskaya-1",
    title: "Тверская улица, 1",
    subtitle: "Москва",
    formatted_address: "Россия, Москва, Тверская улица, 1",
    kind: "house",
  },
  {
    uri: "ymapsbm1://geo?tverskaya-7",
    title: "Тверская улица, 7",
    subtitle: "Москва",
    formatted_address: "Россия, Москва, Тверская улица, 7",
    kind: "house",
  },
];

export const PREDICTION = {
  predicted_price: 12_345_678,
  address: {
    formatted_address: "Россия, Москва, Тверская улица, 1",
    kind: "house",
    lat: 55.757,
    lon: 37.613,
    distance_to_center_km: 0.84,
  },
};

interface MockResponse {
  status?: number;
  json: unknown;
}

interface ApiMockOptions {
  /** Ответы /api/predict по очереди; последний повторяется для всех следующих запросов. */
  predict?: MockResponse[];
}

export interface ApiMock {
  /** Все запросы к /api/predict — для проверки тела и числа вызовов. */
  predictRequests: Request[];
}

export async function mockApi(
  page: Page,
  { predict = [{ json: PREDICTION }] }: ApiMockOptions = {},
): Promise<ApiMock> {
  const mock: ApiMock = { predictRequests: [] };

  // Роуты проверяются с последнего зарегистрированного: это — запасной для запросов без мока
  await page.route("**/api/**", (route) =>
    route.fulfill({ status: 599, json: { detail: `Нет мока: ${route.request().url()}` } }),
  );

  await page.route("**/api/cities", (route) => route.fulfill({ json: CITIES }));

  await page.route(/\/api\/addresses\/search\?/, (route) => {
    const query = new URL(route.request().url()).searchParams.get("query") ?? "";
    const items = ADDRESSES.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase()),
    );

    return route.fulfill({ json: { items } });
  });

  await page.route("**/api/predict", (route) => {
    const index = Math.min(mock.predictRequests.length, predict.length - 1);
    mock.predictRequests.push(route.request());

    return route.fulfill({ status: predict[index].status ?? 200, json: predict[index].json });
  });

  return mock;
}

// Шаги визарда — так их проходит пользователь

export async function chooseApartment(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: /Квартира/ }).click();
  await expect(page).toHaveURL("/predict/address");
}

export async function chooseAddress(page: Page, address = "Тверская улица, 1") {
  await page.getByRole("combobox", { name: "Город" }).click();
  await page.getByRole("option", { name: "Москва" }).click();

  await page.getByRole("combobox", { name: "Адрес" }).fill("Тверская");
  await page.getByRole("option", { name: address }).click();

  await page.getByRole("button", { name: "Продолжить" }).click();
  await expect(page).toHaveURL("/predict/details");
}

export async function fillApartment(
  page: Page,
  { rooms = "2", area = "45", floor = "5", floorsTotal = "9" } = {},
) {
  await page.getByText(rooms, { exact: true }).click();
  await page.getByLabel("Общая площадь").fill(area);
  await page.getByLabel("Этаж", { exact: true }).fill(floor);
  await page.getByLabel("Этажей в доме").fill(floorsTotal);
}

/** Весь визард до страницы результата. */
export async function completeWizard(page: Page) {
  await chooseApartment(page);
  await chooseAddress(page);
  await fillApartment(page);
  await page.getByRole("button", { name: "Рассчитать стоимость" }).click();
  await expect(page).toHaveURL("/predict/result");
}
