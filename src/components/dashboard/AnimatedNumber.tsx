"use client";

import { useEffect, useRef, useState } from "react";
import { fmt } from "@/lib/format";

export function AnimatedNumber({
  value,
  format = fmt,
}: {
  value: number;
  format?: (n: number) => string;
}) {
  const [shown, setShown] = useState(value);
  const current = useRef(value);

  useEffect(() => {
    const start = current.current;
    const t0 = performance.now();
    const dur = 640;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - (1 - p) ** 3;
      const next = start + (value - start) * eased;
      current.current = next;
      setShown(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{format(shown)}</>;
}
