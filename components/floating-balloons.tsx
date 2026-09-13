"use client";

import { useReducedMotion } from "motion/react";
import { useState } from "react";

interface BalloonConfig {
  id: string;
  type: "oval" | "heart";
  color: "metallic-rose" | "pearl-blush" | "hot-pink" | "soft-ivory";
  left: string;
  size: number;
  speed: number;
  delay: number;
  sway: number;
  rotateDeg: number;
  zIndex: number;
}

const BALLOONS: BalloonConfig[] = [
  {
    id: "b1",
    type: "heart",
    color: "metallic-rose",
    left: "3%",
    size: 56,
    speed: 14,
    delay: -4,
    sway: 14,
    rotateDeg: -8,
    zIndex: 1,
  },
  {
    id: "b2",
    type: "oval",
    color: "pearl-blush",
    left: "22%",
    size: 48,
    speed: 17,
    delay: -11,
    sway: 10,
    rotateDeg: 6,
    zIndex: 1,
  },
  {
    id: "b3",
    type: "oval",
    color: "hot-pink",
    left: "82%",
    size: 62,
    speed: 13,
    delay: -2,
    sway: -15,
    rotateDeg: 9,
    zIndex: 3,
  },
  {
    id: "b4",
    type: "heart",
    color: "pearl-blush",
    left: "67%",
    size: 52,
    speed: 16,
    delay: -9,
    sway: -12,
    rotateDeg: -6,
    zIndex: 1,
  },
  {
    id: "b5",
    type: "oval",
    color: "soft-ivory",
    left: "44%",
    size: 44,
    speed: 18,
    delay: -15,
    sway: 9,
    rotateDeg: 4,
    zIndex: 1,
  },
  {
    id: "b6",
    type: "heart",
    color: "metallic-rose",
    left: "12%",
    size: 50,
    speed: 15,
    delay: -7,
    sway: 12,
    rotateDeg: -7,
    zIndex: 3,
  },
  {
    id: "b7",
    type: "heart",
    color: "hot-pink",
    left: "78%",
    size: 46,
    speed: 16.5,
    delay: -13,
    sway: -11,
    rotateDeg: 7,
    zIndex: 1,
  },
  {
    id: "b8",
    type: "oval",
    color: "pearl-blush",
    left: "35%",
    size: 42,
    speed: 19,
    delay: -5,
    sway: 13,
    rotateDeg: -4,
    zIndex: 1,
  },
];

export function FloatingBalloons() {
  const reduceMotion = useReducedMotion();
  const [popped, setPopped] = useState<Record<string, boolean>>({});

  const handleBalloonClick = (id: string) => {
    setPopped((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setPopped((prev) => ({ ...prev, [id]: false }));
    }, 2400);
  };

  if (reduceMotion) {
    return null;
  }

  return (
    <div className="balloons-layer" aria-hidden="true">
      {BALLOONS.map((b) => {
        const isPopped = popped[b.id];
        return (
          <div
            key={b.id}
            className={`balloon-item balloon-${b.color} ${isPopped ? "is-popped" : ""}`}
            style={{
              left: b.left,
              width: `${b.size}px`,
              zIndex: b.zIndex,
              animationDuration: `${b.speed}s, ${b.speed * 0.4}s`,
              animationDelay: `${b.delay}s, ${b.delay * 0.5}s`,
              ["--sway" as string]: `${b.sway}px`,
              ["--rot" as string]: `${b.rotateDeg}deg`,
            }}
            onClick={() => handleBalloonClick(b.id)}
            role="presentation"
          >
            {b.type === "heart" ? (
              <svg
                viewBox="0 0 100 115"
                className="balloon-svg"
                style={{ width: b.size, height: b.size * 1.15 }}
              >
                <defs>
                  <radialGradient id={`grad-heart-${b.id}`} cx="38%" cy="32%" r="65%">
                    {b.color === "metallic-rose" && (
                      <>
                        <stop offset="0%" stopColor="#fff0f6" />
                        <stop offset="35%" stopColor="#ff70a5" />
                        <stop offset="75%" stopColor="#e0296c" />
                        <stop offset="100%" stopColor="#a31145" />
                      </>
                    )}
                    {b.color === "pearl-blush" && (
                      <>
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="40%" stopColor="#ffd8e8" />
                        <stop offset="80%" stopColor="#fca5c5" />
                        <stop offset="100%" stopColor="#e7749f" />
                      </>
                    )}
                    {b.color === "hot-pink" && (
                      <>
                        <stop offset="0%" stopColor="#ffe6f0" />
                        <stop offset="30%" stopColor="#ff4d94" />
                        <stop offset="75%" stopColor="#e6005c" />
                        <stop offset="100%" stopColor="#99003d" />
                      </>
                    )}
                    {b.color === "soft-ivory" && (
                      <>
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="45%" stopColor="#fff0f5" />
                        <stop offset="85%" stopColor="#ffd1e0" />
                        <stop offset="100%" stopColor="#f5a3bf" />
                      </>
                    )}
                  </radialGradient>
                  <filter id={`shadow-heart-${b.id}`} x="-15%" y="-15%" width="130%" height="130%">
                    <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#85152f" floodOpacity="0.25" />
                  </filter>
                </defs>

                {/* Trailing wavy string */}
                <path
                  d="M 50 82 Q 44 92, 53 100 T 47 114"
                  fill="none"
                  stroke="rgba(243, 53, 140, 0.45)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />

                {/* Knot */}
                <polygon points="46,82 54,82 50,78" fill="rgba(180, 20, 70, 0.6)" />

                {/* Heart body */}
                <path
                  d="M 50,78 
                     C 20,55 5,35 15,18 
                     C 23,4 40,8 50,24 
                     C 60,8 77,4 85,18 
                     C 95,35 80,55 50,78 Z"
                  fill={`url(#grad-heart-${b.id})`}
                  filter={`url(#shadow-heart-${b.id})`}
                />

                {/* Specular Highlight */}
                <ellipse
                  cx="32"
                  cy="24"
                  rx="10"
                  ry="6"
                  transform="rotate(-25 32 24)"
                  fill="rgba(255, 255, 255, 0.65)"
                />
                <circle cx="24" cy="33" r="2.5" fill="rgba(255, 255, 255, 0.5)" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 100 120"
                className="balloon-svg"
                style={{ width: b.size, height: b.size * 1.2 }}
              >
                <defs>
                  <radialGradient id={`grad-oval-${b.id}`} cx="35%" cy="30%" r="68%">
                    {b.color === "metallic-rose" && (
                      <>
                        <stop offset="0%" stopColor="#fff2f7" />
                        <stop offset="35%" stopColor="#ff70a5" />
                        <stop offset="75%" stopColor="#db2768" />
                        <stop offset="100%" stopColor="#93103e" />
                      </>
                    )}
                    {b.color === "pearl-blush" && (
                      <>
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="40%" stopColor="#fedae9" />
                        <stop offset="80%" stopColor="#f8a7c6" />
                        <stop offset="100%" stopColor="#df6c97" />
                      </>
                    )}
                    {b.color === "hot-pink" && (
                      <>
                        <stop offset="0%" stopColor="#ffe6f0" />
                        <stop offset="30%" stopColor="#ff4d94" />
                        <stop offset="75%" stopColor="#db0058" />
                        <stop offset="100%" stopColor="#8a0037" />
                      </>
                    )}
                    {b.color === "soft-ivory" && (
                      <>
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="45%" stopColor="#fff0f5" />
                        <stop offset="85%" stopColor="#ffd4e3" />
                        <stop offset="100%" stopColor="#f39dbb" />
                      </>
                    )}
                  </radialGradient>
                  <filter id={`shadow-oval-${b.id}`} x="-15%" y="-15%" width="130%" height="130%">
                    <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#85152f" floodOpacity="0.22" />
                  </filter>
                </defs>

                {/* Trailing wavy string */}
                <path
                  d="M 50 87 Q 56 97, 47 106 T 52 119"
                  fill="none"
                  stroke="rgba(243, 53, 140, 0.45)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />

                {/* Knot */}
                <polygon points="46,87 54,87 50,83" fill="rgba(180, 20, 70, 0.55)" />

                {/* Oval body */}
                <ellipse
                  cx="50"
                  cy="46"
                  rx="38"
                  ry="43"
                  fill={`url(#grad-oval-${b.id})`}
                  filter={`url(#shadow-oval-${b.id})`}
                />

                {/* Specular Highlight */}
                <ellipse
                  cx="34"
                  cy="28"
                  rx="11"
                  ry="6"
                  transform="rotate(-30 34 28)"
                  fill="rgba(255, 255, 255, 0.7)"
                />
                <circle cx="26" cy="38" r="2.5" fill="rgba(255, 255, 255, 0.5)" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}
