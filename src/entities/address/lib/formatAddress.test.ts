import { describe, expect, it } from "vitest";

import { formatAddress } from "./formatAddress";

describe("formatAddress", () => {
  it("склеивает заголовок и подзаголовок", () => {
    expect(formatAddress({ uri: "u", title: "Тверская улица, 1", subtitle: "Москва" })).toBe(
      "Тверская улица, 1, Москва",
    );
  });

  it("без подзаголовка — только заголовок", () => {
    expect(formatAddress({ uri: "u", title: "Тверская улица, 1" })).toBe("Тверская улица, 1");
  });
});
