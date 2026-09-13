"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

type ReactionStickerProps = {
  src: string;
  frame: number;
  className: string;
  index: number;
  reduceMotion: boolean;
};

export function ReactionSticker({ src, frame, className, index, reduceMotion }: ReactionStickerProps) {
  const [loaded, setLoaded] = useState(true);
  const [failedFrames, setFailedFrames] = useState<Record<number, boolean>>({});
  const direction = index % 2 === 0 ? 1 : -1;
  const baseName = src.replace(/\.png$/, "").split("/").pop() || "back-left";
  const frameIndex = ((frame % 3) + 3) % 3;
  const currentFrameSrc = failedFrames[frameIndex]
    ? src
    : `/images/reactions/extracted/${baseName}-frame-${frameIndex}.png`;

  // Preload all 3 expression frames for this sticker so switching is instantaneous
  useEffect(() => {
    [0, 1, 2].forEach((f) => {
      const img = new window.Image();
      img.src = `/images/reactions/extracted/${baseName}-frame-${f}.png`;
      img.onerror = () => {
        setFailedFrames((prev) => ({ ...prev, [f]: true }));
      };
    });
  }, [baseName]);

  return (
    <motion.div
      className={`gate-reaction ${className} ${loaded ? "is-ready" : "is-ready"}`}
      animate={reduceMotion ? undefined : {
        x: [0, direction * 4.5, direction * -3.5, 0],
        y: [0, -8 - (index % 3) * 2, 4, 0],
        rotate: [0, direction * 4.5, direction * -3.5, 0],
      }}
      transition={{
        duration: 3.8 + index * 0.32,
        delay: index * 0.12,
        ease: "easeInOut",
        repeat: Infinity,
      }}
      whileHover={{ scale: 1.14, rotate: direction * 7, transition: { type: "spring", stiffness: 420 } }}
      whileTap={{ scale: 0.92 }}
    >
      <motion.div
        key={frameIndex}
        className="gate-reaction-inner"
        initial={reduceMotion ? false : { scale: 0.88, rotate: direction * -5, y: 2 }}
        animate={{ scale: 1, rotate: 0, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 520,
          damping: 18,
          mass: 0.75,
        }}
        style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
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
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailedFrames((prev) => ({ ...prev, [frameIndex]: true }));
            setLoaded(true);
          }}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "contain",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      </motion.div>
    </motion.div>
  );
}

