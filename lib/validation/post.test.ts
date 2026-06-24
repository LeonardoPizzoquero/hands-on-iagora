import { describe, it, expect } from "vitest";
import { createPostSchema } from "./post";

describe("createPostSchema", () => {
  it("aceita input válido e faz trim", () => {
    const result = createPostSchema.parse({
      title: "  Como fazer deploy?  ",
      body: "Tenho uma dúvida sobre Vercel.",
    });
    expect(result.title).toBe("Como fazer deploy?");
  });

  it("rejeita título curto", () => {
    const result = createPostSchema.safeParse({ title: "ab", body: "ok" });
    expect(result.success).toBe(false);
  });

  it("rejeita body vazio", () => {
    const result = createPostSchema.safeParse({ title: "título ok", body: "  " });
    expect(result.success).toBe(false);
  });
});
