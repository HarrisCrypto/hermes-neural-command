"use client";

import { useEffect, useRef } from "react";
import type { BrainActivity } from "@/lib/types";

const KEYS: Array<keyof BrainActivity> = [
  "reasoning",
  "toolUse",
  "memory",
  "output",
  "reflection",
  "proactive",
];
const LABELS = ["Reason", "Tools", "Memory", "Output", "Reflect", "Proact"];
const COLORS = ["#00f0ff", "#a855f7", "#ec4899", "#22d3ee", "#fbbf24", "#34d399"];
const SHORT = ["R", "T", "M", "O", "R", "P"];

export function Gauges({ brain }: { brain: BrainActivity }) {
  const R = 26;
  const circ = 2 * Math.PI * R;
  return (
    <div className="flex flex-wrap justify-center gap-2 py-1">
      {KEYS.map((key, i) => {
        const v = Math.min(1, brain[key]);
        const offset = circ * (1 - v);
        return (
          <div key={key} className="text-center">
            <svg viewBox="0 0 60 60" className="size-[58px]">
              <circle cx="30" cy="30" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <circle
                cx="30"
                cy="30"
                r={R}
                fill="none"
                stroke={COLORS[i]}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                transform="rotate(-90 30 30)"
                style={{ filter: `drop-shadow(0 0 6px ${COLORS[i]})`, transition: "stroke-dashoffset 1s ease" }}
              />
              <text
                x="30"
                y="34"
                textAnchor="middle"
                fill={COLORS[i]}
                fontFamily="var(--font-share), monospace"
                fontSize="10"
                fontWeight="700"
              >
                {Math.round(v * 100)}%
              </text>
            </svg>
            <div className="font-mono mt-[-2px] text-[6px] tracking-wider text-white/35 uppercase">{SHORT[i]}</div>
          </div>
        );
      })}
    </div>
  );
}

export function RadarChart({ brain }: { brain: BrainActivity }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const parent = c.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = 130;
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2 - 16;
    if (r < 15) return;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(0,240,255,0.07)";
    for (let ring = 1; ring <= 4; ring++) {
      ctx.beginPath();
      KEYS.forEach((_, i) => {
        const ang = (Math.PI * 2 * i) / 6 - Math.PI / 2;
        const x = cx + Math.cos(ang) * r * (ring / 4);
        const y = cy + Math.sin(ang) * r * (ring / 4);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();
    }
    ctx.beginPath();
    KEYS.forEach((key, i) => {
      const ang = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      const x = cx + Math.cos(ang) * r * Math.min(1, brain[key]);
      const y = cy + Math.sin(ang) * r * Math.min(1, brain[key]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(0,240,255,0.1)";
    ctx.fill();
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 1.2;
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 5;
    ctx.stroke();
    ctx.shadowBlur = 0;
    KEYS.forEach((key, i) => {
      const ang = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      const x = cx + Math.cos(ang) * r * Math.min(1, brain[key]);
      const y = cy + Math.sin(ang) * r * Math.min(1, brain[key]);
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#00f0ff";
      ctx.fill();
    });
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "7px Orbitron, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    LABELS.forEach((label, i) => {
      const ang = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      ctx.fillText(label, cx + Math.cos(ang) * (r + 12), cy + Math.sin(ang) * (r + 12));
    });
  }, [brain]);

  return <canvas ref={ref} className="h-[130px] w-full" />;
}

export function LineChart({ series }: { series: number[] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const parent = c.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = 130;
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx || series.length < 2) return;
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.moveTo(0, h);
    series.forEach((v, i) => {
      const x = (w * i) / (series.length - 1);
      const y = h - (v / 100) * h;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(w, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(0,240,255,0.18)");
    grad.addColorStop(1, "rgba(0,240,255,0)");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.beginPath();
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 1.2;
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 6;
    series.forEach((v, i) => {
      const x = (w * i) / (series.length - 1);
      const y = h - (v / 100) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;
    const last = series[series.length - 1];
    ctx.beginPath();
    ctx.arc(w, h - (last / 100) * h, 2.6, 0, Math.PI * 2);
    ctx.fillStyle = "#00f0ff";
    ctx.shadowBlur = 5;
    ctx.fill();
  }, [series]);

  return <canvas ref={ref} className="h-[130px] w-full" />;
}
