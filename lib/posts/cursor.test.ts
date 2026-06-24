import { describe, it, expect } from "vitest";
import { encodeCursor, decodeCursor } from "./queries";

describe("cursor de paginação", () => {
  it("faz round-trip created_at + id", () => {
    const c = { created_at: "2026-06-23T10:00:00.000Z", id: "abc-123" };
    const decoded = decodeCursor(encodeCursor(c));
    expect(decoded).toEqual(c);
  });

  it("retorna null para cursor ausente ou malformado", () => {
    expect(decodeCursor(undefined)).toBeNull();
    expect(decodeCursor("")).toBeNull();
    expect(decodeCursor("semseparador")).toBeNull();
  });
});
