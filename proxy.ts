import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Convenção `proxy` (Next 16+); substitui o antigo `middleware`.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Roda em todas as rotas exceto assets estáticos e imagens.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
