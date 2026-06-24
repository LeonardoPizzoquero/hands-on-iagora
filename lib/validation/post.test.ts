import { describe, it, expect } from "vitest";
import { postSchema, TITLE_MAX } from "./post";

describe("postSchema", () => {
  it("aceita input válido e faz trim", () => {
    const result = postSchema.parse({
      title: "  Como fazer deploy?  ",
      content: "Tenho uma dúvida sobre **Vercel**.",
    });
    expect(result.title).toBe("Como fazer deploy?");
    expect(result.content).toBe("Tenho uma dúvida sobre **Vercel**.");
  });

  it("rejeita título vazio", () => {
    const result = postSchema.safeParse({ title: "   ", content: "ok" });
    expect(result.success).toBe(false);
  });

  it("rejeita título acima do limite", () => {
    const result = postSchema.safeParse({
      title: "a".repeat(TITLE_MAX + 1),
      content: "ok",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita content vazio", () => {
    const result = postSchema.safeParse({ title: "título ok", content: "  " });
    expect(result.success).toBe(false);
  });
});
