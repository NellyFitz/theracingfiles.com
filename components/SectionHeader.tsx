interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function SectionHeader({ eyebrow, title, subtitle, centered = false }: SectionHeaderProps) {
  const align = centered ? 'text-center mx-auto' : '';
  return (
    <div className={`mb-10 ${align}`}>
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-widest text-[#39ff14] mb-3">{eyebrow}</p>
      )}
      <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-zinc-400 leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
