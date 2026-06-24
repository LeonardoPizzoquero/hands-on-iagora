import { describe, it, expect } from "vitest";
import { canLike, optimisticToggle } from "./can-like";

describe("canLike", () => {
  it("autenticado não-autor pode curtir", () => {
    expect(canLike({ id: "u1" }, "u2")).toBe(true);
  });
  it("autor não pode curtir o próprio", () => {
    expect(canLike({ id: "u1" }, "u1")).toBe(false);
  });
  it("não autenticado não pode curtir", () => {
    expect(canLike(null, "u2")).toBe(false);
  });
});

describe("optimisticToggle", () => {
  it("não curtido → curtido +1", () => {
    expect(optimisticToggle({ liked: false, count: 2 })).toEqual({
      liked: true,
      count: 3,
    });
  });
  it("curtido → não curtido -1", () => {
    expect(optimisticToggle({ liked: true, count: 3 })).toEqual({
      liked: false,
      count: 2,
    });
  });
  it("não vai abaixo de zero", () => {
    expect(optimisticToggle({ liked: true, count: 0 })).toEqual({
      liked: false,
      count: 0,
    });
  });
});
