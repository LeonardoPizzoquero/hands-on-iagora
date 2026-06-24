"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Campo de busca do feed. Submete navegando para `/feed?q=<termo>` (compartilhável).
 * Termo vazio volta ao feed normal (`/feed`).
 */
export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/feed?q=${encodeURIComponent(q)}` : "/feed");
  }

  function clear() {
    setValue("");
    router.push("/feed");
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap gap-2" role="search">
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar posts por título ou conteúdo…"
        aria-label="Buscar posts"
        className="brutal-box min-w-0 flex-1 bg-paper px-4 py-2.5 outline-none focus:[box-shadow:var(--shadow-brutal-lg)]"
      />
      <button
        type="submit"
        className="brutal-box bg-brand-blue px-5 py-2.5 font-bold text-paper transition-transform hover:-translate-y-0.5"
      >
        Buscar
      </button>
      {initialQuery && (
        <button
          type="button"
          onClick={clear}
          className="brutal-box bg-paper px-5 py-2.5 font-medium transition-transform hover:-translate-y-0.5"
        >
          Limpar
        </button>
      )}
    </form>
  );
}
