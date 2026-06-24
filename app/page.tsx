import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-[1280px] flex-col gap-16 px-6 py-12">
      {/* Hero — split screen */}
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold leading-[1.05] tracking-tight">
            O fórum onde alunos{" "}
            <span className="bg-brand-blue px-2 text-paper">perguntam</span> e{" "}
            <span className="bg-brand-red px-2 text-paper">mostram</span> o que
            criaram.
          </h1>
          <p className="max-w-[60ch] text-lg leading-relaxed">
            Publique dúvidas, compartilhe seus projetos e receba comentários de
            professores e colegas. Aprender em público, do jeito certo.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/login"
              className="brutal-box bg-brand-yellow px-6 py-3 text-lg font-bold transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Começar agora
            </Link>
            <Link
              href="#como-funciona"
              className="brutal-box bg-paper px-6 py-3 text-lg font-medium transition-transform hover:-translate-y-0.5"
            >
              Como funciona
            </Link>
          </div>
        </div>

        <div className="brutal-box flex flex-col gap-4 bg-brand-blue p-6 [box-shadow:var(--shadow-brutal-lg)]">
          <div className="brutal-box bg-paper p-4">
            <p className="font-mono text-sm text-brand-red">@aluno</p>
            <p className="mt-1 font-medium">
              Como faço deploy do Next.js na Vercel?
            </p>
          </div>
          <div className="brutal-box ml-8 bg-brand-yellow p-4">
            <p className="font-mono text-sm">@professor</p>
            <p className="mt-1 font-medium">
              Boa pergunta! Vamos por partes…
            </p>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="flex flex-col gap-8">
        <h2 className="text-2xl font-bold tracking-tight">Como funciona</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              n: "01",
              t: "Publique",
              d: "Tire dúvidas ou descreva um projeto que você criou.",
              bg: "bg-brand-yellow",
            },
            {
              n: "02",
              t: "Receba feedback",
              d: "Professores e colegas comentam e ajudam.",
              bg: "bg-brand-red text-paper",
            },
            {
              n: "03",
              t: "Evolua",
              d: "Aprenda em público e construa seu repertório.",
              bg: "bg-brand-blue text-paper",
            },
          ].map((c) => (
            <div key={c.n} className={`brutal-box ${c.bg} flex flex-col gap-2 p-6`}>
              <span className="font-mono text-sm opacity-80">{c.n}</span>
              <h3 className="text-xl font-bold">{c.t}</h3>
              <p className="leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-auto border-t-[3px] border-ink pt-6 font-mono text-sm">
        IAgora? — projeto de aula sobre spec-driven development.
      </footer>
    </main>
  );
}
