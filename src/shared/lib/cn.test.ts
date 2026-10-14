import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("склеивает классы и пропускает пустые", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("без классов — пустая строка", () => {
    expect(cn()).toBe("");
  });
});
