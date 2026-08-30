"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  icon,
  children,
  className,
  bodyClassName,
  collapsible = false,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section className={cn("hud-panel relative", className)}>
      <div className="mb-2 flex items-center gap-2">
        <h3 className="font-display flex items-center gap-2 text-[8px] font-bold tracking-[0.16em] text-cyan-300/70 uppercase">
          {icon}
          {title}
        </h3>
        <div className="h-px flex-1 bg-linear-to-r from-cyan-400/25 to-transparent" />
        {collapsible && (
          <button
            type="button"
            className="flex size-[18px] items-center justify-center rounded border border-white/10 bg-white/3 font-mono text-[9px] text-white/40 hover:border-cyan-400/40 hover:text-cyan-300"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Minimize panel" : "Expand panel"}
          >
            {open ? "−" : "+"}
          </button>
        )}
      </div>
      {open && <div className={bodyClassName}>{children}</div>}
    </section>
  );
}
