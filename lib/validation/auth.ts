import { z } from "zod";

/** Validação + sanitização de auth. Senha mínima de 8 caracteres. */

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe seu nome")
    .max(80, "Nome muito longo"),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
