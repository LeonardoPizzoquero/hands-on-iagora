/** Bloco de mensagem de erro neubrutalism. */
export function AuthError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="brutal-box bg-brand-red px-3 py-2 text-sm font-bold text-paper"
    >
      {message}
    </p>
  );
}
