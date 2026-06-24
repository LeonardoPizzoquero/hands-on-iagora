import { describe, it, expect } from "vitest";
import { parseSearchQuery, hasSearch, SEARCH_MAX } from "./search";

describe("parseSearchQuery", () => {
  it("trima e retorna o termo", () => {
    expect(parseSearchQuery("  deploy  ")).toBe("deploy");
  });

  it("usa o primeiro item quando é array", () => {
    expect(parseSearchQuery(["a", "b"])).toBe("a");
  });

  it("retorna vazio p/ undefined ou só espaços", () => {
    expect(parseSearchQuery(undefined)).toBe("");
    expect(parseSearchQuery("   ")).toBe("");
  });

  it("limita o tamanho do termo", () => {
    expect(parseSearchQuery("x".repeat(SEARCH_MAX + 50)).length).toBe(SEARCH_MAX);
  });
});

describe("hasSearch", () => {
  it("true só quando há termo efetivo", () => {
    expect(hasSearch("deploy")).toBe(true);
    expect(hasSearch("  ")).toBe(false);
    expect(hasSearch(undefined)).toBe(false);
  });
});
