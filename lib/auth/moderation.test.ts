import { describe, it, expect } from "vitest";
import { canDelete, isModerating } from "./moderation";

const author = { id: "a", role: "student" as const };
const otherStudent = { id: "b", role: "student" as const };
const teacher = { id: "t", role: "teacher" as const };

describe("canDelete", () => {
  it("autor pode apagar o próprio conteúdo", () => {
    expect(canDelete(author, "a")).toBe(true);
  });

  it("aluno não-autor NÃO pode apagar", () => {
    expect(canDelete(otherStudent, "a")).toBe(false);
  });

  it("teacher pode apagar conteúdo de qualquer um", () => {
    expect(canDelete(teacher, "a")).toBe(true);
  });

  it("não autenticado não pode apagar", () => {
    expect(canDelete(null, "a")).toBe(false);
  });
});

describe("isModerating", () => {
  it("true quando teacher apaga conteúdo alheio", () => {
    expect(isModerating(teacher, "a")).toBe(true);
  });

  it("false quando teacher apaga o próprio", () => {
    expect(isModerating(teacher, "t")).toBe(false);
  });

  it("false para aluno", () => {
    expect(isModerating(otherStudent, "a")).toBe(false);
  });
});
