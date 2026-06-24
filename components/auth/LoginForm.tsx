"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthState } from "@/lib/auth/actions";
import { AuthField } from "./AuthField";
import { SubmitButton } from "./SubmitButton";
import { AuthError } from "./AuthError";

const initial: AuthState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(login, initial);

  return (
    <form
      action={formAction}
      className="brutal-box flex w-full max-w-md flex-col gap-5 bg-paper p-6 [box-shadow:var(--shadow-brutal-lg)]"
    >
      <h1 className="text-2xl font-bold tracking-tight">Entrar</h1>
      <AuthError message={state.error} />
      <AuthField label="Email" name="email" type="email" autoComplete="email" required />
      <AuthField
        label="Senha"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <SubmitButton label="Entrar" />
      <p className="text-sm">
        Não tem conta?{" "}
        <Link href="/signup" className="font-bold underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
