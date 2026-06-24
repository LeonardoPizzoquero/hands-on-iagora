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
    <header className="sticky top-0 z-[100] flex items-center justify-between gap-2 border-b-[3px] border-ink bg-paper px-4 py-3 sm:px-6">
      <Link
        href="/"
        className="shrink-0 text-xl font-bold tracking-tight"
      >
        IAgora?
      </Link>

      {profile ? (
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href="/feed"
            className="brutal-box shrink-0 whitespace-nowrap bg-paper px-3 py-1.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
          >
            Feed
          </Link>
          <span className="brutal-box flex min-w-0 items-center gap-1 bg-brand-yellow px-3 py-1.5 text-sm font-bold">
            <span className="min-w-0 truncate">{profile.name}</span>
            {profile.role === "teacher" && (
              <span className="shrink-0 font-mono">· prof</span>
            )}
          </span>
          <form action={logout} className="shrink-0">
            <button
              type="submit"
              className="brutal-box whitespace-nowrap bg-paper px-3 py-1.5 text-sm font-medium transition-transform hover:-translate-y-0.5"
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
