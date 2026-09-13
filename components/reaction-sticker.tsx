"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 360;

function removeCheckerboard(image: ImageData) {
  const { data, width, height } = image;
  const visited = new Uint8Array(width * height);
  const queue = new Uint32Array(width * height);
  let head = 0;
  let tail = 0;

  const canErase = (pixel: number) => {
    const offset = pixel * 4;
    const alpha = data[offset + 3];
    if (alpha < 24) return true;

    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const highest = Math.max(red, green, blue);
    const lowest = Math.min(red, green, blue);
    const lightness = (highest + lowest) / 2;

    return highest - lowest < 24 && lightness > 42 && lightness < 248;
  };

  const enqueue = (pixel: number) => {
    if (visited[pixel] || !canErase(pixel)) return;
    visited[pixel] = 1;
    queue[tail] = pixel;
    tail += 1;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  while (head < tail) {
    const pixel = queue[head];
    head += 1;
    const x = pixel % width;
    const y = Math.floor(pixel / width);

    if (x > 0) enqueue(pixel - 1);
    if (x < width - 1) enqueue(pixel + 1);
    if (y > 0) enqueue(pixel - width);
    if (y < height - 1) enqueue(pixel + width);
  }

  for (let pixel = 0; pixel < visited.length; pixel += 1) {
    if (visited[pixel]) data[pixel * 4 + 3] = 0;
  }

  return image;
}

function buildFrames(image: HTMLImageElement) {
  const work = document.createElement("canvas");
  work.width = CANVAS_WIDTH;
  work.height = CANVAS_HEIGHT;
  const context = work.getContext("2d", { willReadFrequently: true });
  if (!context) return [];

  const sourceWidth = image.naturalWidth / 3;

  return [0, 1, 2].map((frame) => {
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const scale = Math.min(CANVAS_WIDTH / sourceWidth, CANVAS_HEIGHT / image.naturalHeight);
    const drawWidth = sourceWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const drawX = (CANVAS_WIDTH - drawWidth) / 2;
    const drawY = (CANVAS_HEIGHT - drawHeight) / 2;

    context.drawImage(
      image,
      frame * sourceWidth,
      0,
      sourceWidth,
      image.naturalHeight,
      drawX,
      drawY,
      drawWidth,
      drawHeight,
    );

    return removeCheckerboard(context.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT));
  });
}

type ReactionStickerProps = {
  src: string;
  frame: number;
  className: string;
  index: number;
  reduceMotion: boolean;
};

export function ReactionSticker({ src, frame, className, index, reduceMotion }: ReactionStickerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frames, setFrames] = useState<ImageData[]>([]);

  useEffect(() => {
    let cancelled = false;
    const image = new window.Image();
    image.decoding = "async";
    image.onload = () => {
      if (!cancelled) setFrames(buildFrames(image));
    };
    image.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    const activeFrame = frames[frame];
    if (context && activeFrame) context.putImageData(activeFrame, 0, 0);
  }, [frame, frames]);

  const direction = index % 2 === 0 ? 1 : -1;

  return (
    <motion.div
      className={`gate-reaction ${className} ${frames.length ? "is-ready" : ""}`}
      animate={reduceMotion ? undefined : {
        x: [0, direction * 5, direction * -3, 0],
        y: [0, -9 - (index % 3) * 2, 4, 0],
        rotate: [0, direction * 4, direction * -2, 0],
      }}
      transition={{
        duration: 4.8 + index * .28,
        delay: index * .12,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    >
      <motion.canvas
        key={frame}
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        initial={reduceMotion ? false : { opacity: .3, scale: .86, rotate: direction * 5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: .42, ease: [.16, 1, .3, 1] }}
      />
    </motion.div>
  );
}
