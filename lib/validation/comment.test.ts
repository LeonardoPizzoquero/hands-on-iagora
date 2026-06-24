import { describe, it, expect } from "vitest";
import { commentSchema, COMMENT_MAX } from "./comment";

describe("commentSchema", () => {
  it("aceita comentário válido e faz trim", () => {
    const result = commentSchema.parse({ content: "  bom post  " });
    expect(result.content).toBe("bom post");
  });

  it("rejeita comentário vazio", () => {
    expect(commentSchema.safeParse({ content: "   " }).success).toBe(false);
  });

  it("rejeita comentário acima do limite", () => {
    const result = commentSchema.safeParse({
      content: "a".repeat(COMMENT_MAX + 1),
    });
    expect(result.success).toBe(false);
  });
});
