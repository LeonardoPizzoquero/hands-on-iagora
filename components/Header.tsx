import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logout } from "@/lib/auth/actions";

/**
 * Header global. Mostra o nome do usuário + logout quando autenticado.
 * Em telas públicas (sem sessão) aparece sem o bloco de perfil.
 */
export async function Header() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-[100] flex items-center justify-between border-b-[3px] border-ink bg-paper px-6 py-3">
      <Link href="/" className="text-xl font-bold tracking-tight">
        IAgora?
      </Link>

      {profile ? (
        <div className="flex items-center gap-3">
          <Link
            href="/feed"
            className="brutal-box bg-paper px-3 py-1.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
          >
            Feed
          </Link>
          <span className="brutal-box bg-brand-yellow px-3 py-1.5 text-sm font-bold">
            {profile.name}
            {profile.role === "teacher" ? " · prof" : ""}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="brutal-box bg-paper px-3 py-1.5 text-sm font-medium transition-transform hover:-translate-y-0.5"
            >
              Sair
            </button>
          </form>
        </div>
      ) : (
        <Link
          href="/login"
          className="brutal-box bg-brand-yellow px-4 py-1.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
        >
          Entrar
        </Link>
      )}
    </header>
  );
}
