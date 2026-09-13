"use client";

import { useEffect, useRef, useState } from "react";

interface Butterfly {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  scale: number;
  rotation: number;
  speed: number;
  hue: number;
  wingSpeed: number;
}

export function ButterflyTransition() {
  const containerRef = useRef<HTMLDivElement>(null);
  const butterfliesRef = useRef<Butterfly[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Create initial 4 butterflies with organic coordinates
    butterfliesRef.current = [
      { id: 1, x: 10, y: 15, targetX: 85, targetY: 40, scale: 0.82, rotation: 25, speed: 0.015, hue: 330, wingSpeed: 0.18 },
      { id: 2, x: 90, y: 35, targetX: 15, targetY: 65, scale: 0.68, rotation: -35, speed: 0.018, hue: 340, wingSpeed: 0.22 },
      { id: 3, x: 20, y: 70, targetX: 80, targetY: 90, scale: 0.95, rotation: 15, speed: 0.012, hue: 325, wingSpeed: 0.16 },
      { id: 4, x: 80, y: 85, targetX: 25, targetY: 25, scale: 0.75, rotation: -20, speed: 0.014, hue: 335, wingSpeed: 0.2 },
    ];

    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let animId = 0;
    let time = 0;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      scrollVelocity = Math.min(Math.abs(currentScrollY - lastScrollY), 50);
      lastScrollY = currentScrollY;

      // When scrolling, randomize butterfly targets slightly to create dynamic flutter across sections
      butterfliesRef.current.forEach((b, i) => {
        b.targetX = (b.targetX + (Math.random() - 0.5) * 20 + 100) % 95;
        b.targetY = (b.targetY + (scrollVelocity > 5 ? 12 : 4) + i * 5) % 92;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    const loop = () => {
      time += 0.02;
      scrollVelocity *= 0.94; // Decay velocity

      // Update positions
      butterfliesRef.current.forEach((b, i) => {
        // Natural meandering sine wave motion + scroll-reactive drift
        const dx = b.targetX - b.x;
        const dy = b.targetY - b.y;

        const effectiveSpeed = b.speed * (1 + scrollVelocity * 0.08);
        b.x += dx * effectiveSpeed + Math.sin(time * 2 + i) * 0.18;
        b.y += dy * effectiveSpeed + Math.cos(time * 1.5 + i) * 0.14;

        // Calculate flight heading rotation
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        b.rotation += (angle - b.rotation) * 0.08;

        // Wrap around gracefully
        if (b.y > 98) {
          b.y = 2;
          b.targetY = Math.random() * 80 + 10;
        }
        if (b.y < 0) {
          b.y = 96;
          b.targetY = Math.random() * 80 + 10;
        }
        if (b.x > 98) b.x = 2;
        if (b.x < 0) b.x = 96;
      });

      setTick((t) => (t + 1) % 10000);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div ref={containerRef} className="butterfly-transition-stage" aria-hidden="true">
      {butterfliesRef.current.map((b) => (
        <div
          key={b.id}
          className="pink-butterfly"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            transform: `scale(${b.scale}) rotate(${b.rotation}deg)`,
            filter: `hue-rotate(${b.hue - 330}deg) drop-shadow(0 4px 12px rgba(243, 53, 140, 0.45))`,
          }}
        >
          {/* 3D Flapping Wings */}
          <div className="butterfly-wings">
            <div className="wing wing-left" style={{ animationDuration: `${b.wingSpeed}s` }}>
              <svg viewBox="0 0 42 54" className="wing-svg">
                <defs>
                  <linearGradient id={`wing-grad-${b.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fff5f9" stopOpacity="0.95" />
                    <stop offset="40%" stopColor="#ff79b0" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#f3358c" stopOpacity="0.85" />
                  </linearGradient>
                </defs>
                <path
                  d="M 38 28 C 36 10, 18 2, 6 6 C -2 10, 2 24, 14 30 C 4 36, 6 48, 16 52 C 28 56, 36 44, 38 28 Z"
                  fill={`url(#wing-grad-${b.id})`}
                  stroke="rgba(255, 255, 255, 0.7)"
                  strokeWidth="1"
                />
                {/* Delicate wing veins */}
                <path d="M 38 28 Q 20 20 8 10" stroke="rgba(255, 255, 255, 0.55)" strokeWidth="0.8" fill="none" />
                <path d="M 38 28 Q 22 34 16 48" stroke="rgba(255, 255, 255, 0.55)" strokeWidth="0.8" fill="none" />
                <circle cx="10" cy="14" r="1.5" fill="#ffffff" opacity="0.8" />
                <circle cx="18" cy="46" r="1.2" fill="#ffffff" opacity="0.8" />
              </svg>
            </div>

            <div className="butterfly-body" />

            <div className="wing wing-right" style={{ animationDuration: `${b.wingSpeed}s` }}>
              <svg viewBox="0 0 42 54" className="wing-svg">
                <path
                  d="M 4 28 C 6 10, 24 2, 36 6 C 44 10, 40 24, 28 30 C 38 36, 36 48, 26 52 C 14 56, 6 44, 4 28 Z"
                  fill={`url(#wing-grad-${b.id})`}
                  stroke="rgba(255, 255, 255, 0.7)"
                  strokeWidth="1"
                />
                <path d="M 4 28 Q 22 20 34 10" stroke="rgba(255, 255, 255, 0.55)" strokeWidth="0.8" fill="none" />
                <path d="M 4 28 Q 20 34 26 48" stroke="rgba(255, 255, 255, 0.55)" strokeWidth="0.8" fill="none" />
                <circle cx="32" cy="14" r="1.5" fill="#ffffff" opacity="0.8" />
                <circle cx="24" cy="46" r="1.2" fill="#ffffff" opacity="0.8" />
              </svg>
            </div>
          </div>

          {/* Sparkle dust trailing behind */}
          <div className="butterfly-sparkle" />
        </div>
      ))}
    </div>
  );
}
