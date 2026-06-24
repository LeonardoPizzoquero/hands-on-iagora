/** Layout das rotas públicas de auth — sem bloco de perfil (o header global
 *  já aparece sem perfil quando não há sessão). */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-8 px-6 py-12">
      {children}
    </main>
  );
}
