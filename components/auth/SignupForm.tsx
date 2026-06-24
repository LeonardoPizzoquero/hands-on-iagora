"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type AuthState } from "@/lib/auth/actions";
import { AuthField } from "./AuthField";
import { SubmitButton } from "./SubmitButton";
import { AuthError } from "./AuthError";

const initial: AuthState = {};

export function SignupForm() {
  const [state, formAction] = useActionState(signup, initial);

  return (
    <form
      action={formAction}
      className="brutal-box flex w-full max-w-md flex-col gap-5 bg-paper p-6 [box-shadow:var(--shadow-brutal-lg)]"
    >
      <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
      <AuthError message={state.error} />
      <AuthField label="Nome completo" name="name" autoComplete="name" required />
      <AuthField label="Email" name="email" type="email" autoComplete="email" required />
      <AuthField
        label="Senha (mín. 8 caracteres)"
        name="password"
        type="password"
        autoComplete="new-password"
        required
      />
      <SubmitButton label="Cadastrar" />
      <p className="text-sm">
        Já tem conta?{" "}
        <Link href="/login" className="font-bold underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
