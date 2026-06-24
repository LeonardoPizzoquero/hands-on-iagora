import { describe, it, expect } from "vitest";
import { validateImage, IMAGE_MAX_BYTES } from "./image";

describe("validateImage", () => {
  it("aceita PNG dentro do limite", () => {
    const r = validateImage({ type: "image/png", size: 1024 });
    expect(r).toEqual({ ok: true, ext: "png" });
  });

  it("rejeita tipo não permitido", () => {
    const r = validateImage({ type: "image/gif", size: 1024 });
    expect(r.ok).toBe(false);
  });

  it("rejeita acima de 5MB", () => {
    const r = validateImage({ type: "image/jpeg", size: IMAGE_MAX_BYTES + 1 });
    expect(r.ok).toBe(false);
  });

  it("rejeita arquivo vazio", () => {
    const r = validateImage({ type: "image/webp", size: 0 });
    expect(r.ok).toBe(false);
  });
});
