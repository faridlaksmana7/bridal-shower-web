"use client";

import { motion } from "motion/react";
import { useState } from "react";

type ReactionStickerProps = {
  src: string;
  frame: number;
  className: string;
  index: number;
  reduceMotion: boolean;
};

export function ReactionSticker({ src, frame, className, index, reduceMotion }: ReactionStickerProps) {
  const [hasError, setHasError] = useState(false);
  const direction = index % 2 === 0 ? 1 : -1;
  const baseName = src.replace(/\.png$/, "").split("/").pop() || "back-left";
  const frameIndex = ((frame % 3) + 3) % 3;

  const currentFrameSrc = hasError
    ? src
    : `/images/reactions/extracted/${baseName}-frame-${frameIndex}.png`;

  return (
    <motion.div
      className={`gate-reaction ${className} is-ready`}
      animate={
        reduceMotion
          ? undefined
          : {
              x: [0, direction * 4, direction * -3, 0],
              y: [0, -7 - (index % 3) * 2, 3, 0],
              rotate: [0, direction * 4, direction * -3, 0],
            }
      }
      transition={{
        duration: 3.6 + index * 0.3,
        delay: index * 0.1,
        ease: "easeInOut",
        repeat: Infinity,
      }}
      whileHover={{ scale: 1.12, rotate: direction * 6, transition: { type: "spring", stiffness: 400 } }}
      whileTap={{ scale: 0.93 }}
      style={{ willChange: "transform" }}
    >
      <div
        className="gate-reaction-inner"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={currentFrameSrc}
          alt={`Bestie expression ${index + 1}`}
          loading="eager"
          decoding="async"
          draggable={false}
          className="gate-reaction-img"
          width={300}
          height={360}
          onError={() => setHasError(true)}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "contain",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      </div>
    </motion.div>
  );
}
