"use client";

import { useEffect, useMemo, useState } from "react";
import { event } from "@/src/data/event";

type Remaining = { days: number; hours: number; minutes: number; seconds: number; done: boolean };

function getRemaining(): Remaining {
  const target = new Date(`${event.dateISO}T${event.startTime ?? "00:00:00"}+07:00`).getTime();
  const distance = target - Date.now();
  if (distance <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
    done: false,
  };
}

export function Countdown() {
  const [remaining, setRemaining] = useState<Remaining | null>(null);
  const hasTime = Boolean(event.startTime);

  useEffect(() => {
    const update = () => setRemaining(getRemaining());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const daysToDate = useMemo(() => {
    if (!remaining) return "—";
    return Math.max(0, remaining.days + (remaining.hours || remaining.minutes || remaining.seconds ? 1 : 0));
  }, [remaining]);

  if (remaining?.done) {
    return <p className="countdown-done">The celebration is here! Welcome to Shaula&apos;s bridal shower.</p>;
  }

  if (!hasTime) {
    return (
      <div className="countdown-days" aria-live="polite">
        <strong>{daysToDate}</strong>
        <span>days until the sweetest celebration</span>
      </div>
    );
  }

  const values = [
    [remaining?.days ?? "—", "Days"],
    [remaining?.hours ?? "—", "Hours"],
    [remaining?.minutes ?? "—", "Minutes"],
    [remaining?.seconds ?? "—", "Seconds"],
  ];

  return (
    <div className="countdown-grid" aria-live="polite">
      {values.map(([value, label]) => (
        <div key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
