import { cn } from "@/lib/utils";

/** Isotipo de Emowave: dos ondas sobre el color primario del tema activo. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("w-8 h-8 shrink-0", className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--color-primary)" />
      <path
        d="M7 13.5c2.2-2.4 4.4-2.4 6.6 0s4.4 2.4 6.6 0 4.4-2.4 4.8-1.9"
        fill="none"
        stroke="var(--color-primary-foreground)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M7 19.5c2.2-2.4 4.4-2.4 6.6 0s4.4 2.4 6.6 0 4.4-2.4 4.8-1.9"
        fill="none"
        stroke="var(--color-primary-foreground)"
        strokeOpacity="0.55"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-serif text-[1.3rem] leading-none tracking-tight">Emowave</span>
    </span>
  );
}
