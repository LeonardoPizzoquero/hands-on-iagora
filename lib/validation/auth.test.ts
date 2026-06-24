import { describe, it, expect } from "vitest";
import { signupSchema, loginSchema } from "./auth";

describe("signupSchema", () => {
  it("aceita e sanitiza input válido", () => {
    const r = signupSchema.parse({
      name: "  Ana Lima  ",
      email: " ANA@Mail.com ",
      password: "supersafe1",
    });
    expect(r.name).toBe("Ana Lima");
    expect(r.email).toBe("ana@mail.com");
  });

  it("rejeita senha curta", () => {
    expect(
      signupSchema.safeParse({ name: "Ana", email: "a@b.com", password: "123" })
        .success,
    ).toBe(false);
  });

  it("rejeita email inválido", () => {
    expect(
      signupSchema.safeParse({ name: "Ana", email: "nope", password: "12345678" })
        .success,
    ).toBe(false);
  });

  it("rejeita nome vazio", () => {
    expect(
      signupSchema.safeParse({ name: " ", email: "a@b.com", password: "12345678" })
        .success,
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("rejeita campos vazios", () => {
    expect(loginSchema.safeParse({ email: "", password: "" }).success).toBe(
      false,
    );
  });
});
