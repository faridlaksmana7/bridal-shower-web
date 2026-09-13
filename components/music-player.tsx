"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Disc3, VolumeX, Music } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MusicPlayerProps {
  opened: boolean;
}

// Exact chorus start timestamp in "Taylor Swift - Lover" ("Can I go where you go?...")
const CHORUS_START_TIME = 41.5;
const TARGET_VOLUME = 0.72;

export function MusicPlayer({ opened }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showTag, setShowTag] = useState(false);
  const fadeRafRef = useRef<number | null>(null);

  // Smooth fade-in volume ramp to prevent abrupt clicks or loud audio shocks
  const fadeVolume = useCallback((targetVol: number, durationMs: number, onComplete?: () => void) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeRafRef.current) cancelAnimationFrame(fadeRafRef.current);

    const startVol = audio.volume;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // Smooth ease-out quad curve
      const ease = 1 - Math.pow(1 - progress, 2);
      audio.volume = Math.max(0, Math.min(1, startVol + (targetVol - startVol) * ease));

      if (progress < 1) {
        fadeRafRef.current = requestAnimationFrame(step);
      } else {
        audio.volume = targetVol;
        fadeRafRef.current = null;
        onComplete?.();
      }
    };
    fadeRafRef.current = requestAnimationFrame(step);
  }, []);

  const playMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!hasStarted) {
      try {
        audio.currentTime = CHORUS_START_TIME;
      } catch {
        // Handled in onLoadedMetadata
      }
      setHasStarted(true);
    }

    audio.volume = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          fadeVolume(TARGET_VOLUME, 1300);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  }, [hasStarted, fadeVolume]);

  const pauseMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    fadeVolume(0, 320, () => {
      audio.pause();
      setIsPlaying(false);
    });
  }, [fadeVolume]);

  const togglePlay = () => {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  };

  // Autoplay immediately when invitation gate opens
  useEffect(() => {
    if (!opened) return;

    const audio = audioRef.current;
    if (!audio) return;

    // Small delay to let the gate opening animation commence smoothly
    const startTimer = window.setTimeout(() => {
      playMusic();
      setShowTag(true);
      const tagTimer = window.setTimeout(() => setShowTag(false), 4500);
      return () => window.clearTimeout(tagTimer);
    }, 150);

    // Fallback listener in case browser policies require an extra tap
    const handleFirstGesture = () => {
      if (audio.paused) {
        playMusic();
      }
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("scroll", handleFirstGesture);
    };

    window.addEventListener("pointerdown", handleFirstGesture, { once: true });
    window.addEventListener("scroll", handleFirstGesture, { once: true });

    return () => {
      window.clearTimeout(startTimer);
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("scroll", handleFirstGesture);
    };
  }, [opened, playMusic]);

  // Clean up RAF and audio on unmount
  useEffect(() => {
    return () => {
      if (fadeRafRef.current) cancelAnimationFrame(fadeRafRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        loop
        onLoadedMetadata={() => {
          if (!hasStarted && audioRef.current) {
            try {
              audioRef.current.currentTime = CHORUS_START_TIME;
            } catch {
              // ignore
            }
          }
        }}
      >
        <source src="/assets/Taylor%20Swift%20-%20Lover.mp3" type="audio/mpeg" />
        <source src="/assets/lover.mp3" type="audio/mpeg" />
      </audio>

      {opened && (
        <div className="music-player-widget" role="region" aria-label="Music Player">
          <AnimatePresence>
            {showTag && (
              <motion.div
                className="music-track-badge"
                initial={{ opacity: 0, x: 12, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 8, scale: 0.94 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <Music size={11} className="music-tag-note" aria-hidden="true" />
                <span>Taylor Swift — Lover</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            className={`music-disc-button ${isPlaying ? "is-playing" : "is-paused"}`}
            onClick={togglePlay}
            onMouseEnter={() => setShowTag(true)}
            onMouseLeave={() => setShowTag(false)}
            aria-label={isPlaying ? "Pause music: Taylor Swift - Lover" : "Play music: Taylor Swift - Lover"}
            title={isPlaying ? "Pause music" : "Play music"}
          >
            <div className="music-disc-inner">
              <Disc3
                size={22}
                className={`music-vinyl-icon ${isPlaying ? "spin-vinyl" : ""}`}
                aria-hidden="true"
              />
              {isPlaying ? (
                <div className="sound-wave-bars" aria-hidden="true">
                  <span className="wave-bar bar-1" />
                  <span className="wave-bar bar-2" />
                  <span className="wave-bar bar-3" />
                </div>
              ) : (
                <div className="music-paused-overlay" aria-hidden="true">
                  <VolumeX size={12} />
                </div>
              )}
            </div>
          </button>
        </div>
      )}
    </>
  );
}
