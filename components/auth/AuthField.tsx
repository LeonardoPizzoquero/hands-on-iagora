/** Campo de formulário no estilo neubrutalism (label acima do input). */
export function AuthField({
  label,
  name,
  type = "text",
  autoComplete,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-bold tracking-tight">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="brutal-box bg-paper px-3 py-2 font-medium outline-none focus-visible:-translate-y-0.5"
      />
    </label>
  );
}
