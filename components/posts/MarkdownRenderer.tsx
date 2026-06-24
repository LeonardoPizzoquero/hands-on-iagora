import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

/**
 * Renderização SEGURA de markdown (subset GFM).
 *
 * Segurança:
 * - `react-markdown` NÃO renderiza HTML cru por padrão (não usamos rehype-raw).
 * - `rehype-sanitize` com allowlist (defaultSchema) remove qualquer tag/atributo
 *   perigoso e restringe protocolos de URL (http/https/mailto) — neutraliza
 *   `javascript:` e `<script>`.
 * - Links abrem em nova aba com rel seguro.
 */

// Allowlist derivada do defaultSchema. `img` já é permitido com src http/https.
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), "target", "rel"],
  },
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose-brutal flex flex-col gap-3 break-words leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, schema]]}
        components={{
          a: ({ ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-blue underline underline-offset-2"
            />
          ),
          h1: ({ ...props }) => (
            <h1 {...props} className="text-2xl font-bold" />
          ),
          h2: ({ ...props }) => (
            <h2 {...props} className="text-xl font-bold" />
          ),
          h3: ({ ...props }) => (
            <h3 {...props} className="text-lg font-bold" />
          ),
          ul: ({ ...props }) => (
            <ul {...props} className="list-disc pl-6" />
          ),
          ol: ({ ...props }) => (
            <ol {...props} className="list-decimal pl-6" />
          ),
          code: ({ ...props }) => (
            <code
              {...props}
              className="rounded bg-ink/10 px-1 py-0.5 font-mono text-sm"
            />
          ),
          pre: ({ ...props }) => (
            <pre
              {...props}
              className="brutal-box overflow-x-auto bg-ink p-4 font-mono text-sm text-paper"
            />
          ),
          img: ({ ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              {...props}
              alt={props.alt ?? ""}
              className="brutal-box max-w-full"
            />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              {...props}
              className="border-l-[3px] border-ink pl-4 italic"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
