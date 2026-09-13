"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ReactionSticker } from "./reaction-sticker";

interface EnvelopeParallaxGateProps {
  guestName: string;
  onOpened: () => void;
  reduceMotion?: boolean;
  reactionFrame: number;
  reactionStickers: { src: string; className: string }[];
}

export function EnvelopeParallaxGate({
  guestName,
  onOpened,
  reduceMotion = false,
  reactionFrame,
  reactionStickers,
}: EnvelopeParallaxGateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const personRef = useRef<HTMLDivElement>(null);
  const upper1Ref = useRef<HTMLDivElement>(null);
  const upper2Ref = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const stickersWrapRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const orbitSlotsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [isOpening, setIsOpening] = useState(false);

  // Set up GSAP parallax, 3D tilt, and physical shake animations
  useEffect(() => {
    if (reduceMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // 1. Initial entrance timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        bgRef.current,
        { scale: 1.06, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2 }
      )
        .fromTo(
          personRef.current,
          { y: 22, opacity: 0, scale: 0.98 },
          { y: 0, opacity: 1, scale: 1, duration: 1.0 },
          "-=0.9"
        )
        .fromTo(
          [upper1Ref.current, upper2Ref.current],
          { y: -14, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.12, duration: 0.9 },
          "-=0.8"
        )
        .fromTo(
          headerRef.current,
          { y: -18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          "-=0.6"
        )
        .fromTo(
          ".gate-orbit-slot",
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, stagger: 0.06, duration: 0.65, ease: "back.out(1.5)" },
          "-=0.5"
        )
        .fromTo(
          ctaRef.current,
          { scale: 0.85, opacity: 0, y: 15 },
          { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.3)" },
          "-=0.4"
        );

      // 2. Idle gentle breathing animations on inner images (so they don't fight with quickTo on outer layers)
      if (personRef.current) {
        const img = personRef.current.querySelector(".parallax-img");
        if (img) {
          gsap.to(img, {
            y: 4,
            duration: 4.2,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        }
      }

      if (upper1Ref.current) {
        const img = upper1Ref.current.querySelector(".parallax-img");
        if (img) {
          gsap.to(img, {
            y: -3,
            x: 2,
            duration: 5.0,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        }
      }

      if (upper2Ref.current) {
        const img = upper2Ref.current.querySelector(".parallax-img");
        if (img) {
          gsap.to(img, {
            y: 3,
            x: -2,
            duration: 4.6,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        }
      }

      // 3. High performance GSAP quickTo setters for 3D card tilt & multi-plane parallax
      const rotXToStage = gsap.quickTo(stageRef.current, "rotationX", { duration: 0.7, ease: "power2.out" });
      const rotYToStage = gsap.quickTo(stageRef.current, "rotationY", { duration: 0.7, ease: "power2.out" });

      const xToBg = gsap.quickTo(bgRef.current, "x", { duration: 0.9, ease: "power2.out" });
      const yToBg = gsap.quickTo(bgRef.current, "y", { duration: 0.9, ease: "power2.out" });

      const xToPerson = gsap.quickTo(personRef.current, "x", { duration: 0.75, ease: "power2.out" });
      const yToPerson = gsap.quickTo(personRef.current, "y", { duration: 0.75, ease: "power2.out" });

      const xToUpper1 = gsap.quickTo(upper1Ref.current, "x", { duration: 0.65, ease: "power2.out" });
      const yToUpper1 = gsap.quickTo(upper1Ref.current, "y", { duration: 0.65, ease: "power2.out" });

      const xToUpper2 = gsap.quickTo(upper2Ref.current, "x", { duration: 0.6, ease: "power2.out" });
      const yToUpper2 = gsap.quickTo(upper2Ref.current, "y", { duration: 0.6, ease: "power2.out" });

      const xToStickers = gsap.quickTo(stickersWrapRef.current, "x", { duration: 0.6, ease: "power2.out" });
      const yToStickers = gsap.quickTo(stickersWrapRef.current, "y", { duration: 0.6, ease: "power2.out" });

      const xToHeader = gsap.quickTo(headerRef.current, "x", { duration: 0.8, ease: "power2.out" });
      const yToHeader = gsap.quickTo(headerRef.current, "y", { duration: 0.8, ease: "power2.out" });

      const xToCta = gsap.quickTo(ctaRef.current, "x", { duration: 0.7, ease: "power2.out" });
      const yToCta = gsap.quickTo(ctaRef.current, "y", { duration: 0.7, ease: "power2.out" });

      // State tracking for tilt and physical shake impulses
      let tiltX = 0;
      let tiltY = 0;
      let shakeX = 0;
      let shakeY = 0;
      let initialBeta: number | null = null;
      let lastShakeJiggleTime = 0;

      // Coordinate tilt + shake impulse into multi-plane depth
      const applyParallax = () => {
        const totalX = Math.max(-1.4, Math.min(1.4, tiltX + shakeX * 0.035));
        const totalY = Math.max(-1.4, Math.min(1.4, tiltY + shakeY * 0.035));

        // 3D stage rotation (tilting sensation)
        rotYToStage(totalX * 6.5);
        rotXToStage(-totalY * 5.5);

        // Background: deep layer moves counter
        xToBg(-totalX * 8 + shakeX * 0.15);
        yToBg(-totalY * 6 + shakeY * 0.15);

        // Person: midground depth
        xToPerson(totalX * 14 + shakeX * 0.45);
        yToPerson(totalY * 10 + shakeY * 0.45);

        // Upper 1: foreground decorative frame
        xToUpper1(totalX * 22 + shakeX * 0.75);
        yToUpper1(totalY * 16 + shakeY * 0.75);

        // Upper 2: closest foreground floral frame
        xToUpper2(totalX * 30 + shakeX * 1.0);
        yToUpper2(totalY * 22 + shakeY * 1.0);

        // Reaction stickers: floating popups
        xToStickers(totalX * 34 + shakeX * 1.15);
        yToStickers(totalY * 25 + shakeY * 1.15);

        // Header & CTA: subtle UI float
        xToHeader(totalX * 10 + shakeX * 0.25);
        yToHeader(totalY * 7 + shakeY * 0.25);

        xToCta(totalX * 12 + shakeX * 0.3);
        yToCta(totalY * 8 + shakeX * 0.3);
      };

      // Shake damping loop via GSAP ticker
      const tickerCallback = () => {
        if (Math.abs(shakeX) > 0.02 || Math.abs(shakeY) > 0.02) {
          shakeX *= 0.86;
          shakeY *= 0.86;
          applyParallax();
        }
      };
      gsap.ticker.add(tickerCallback);

      // Handle mobile physical shake (devicemotion)
      let gravX = 0;
      let gravY = 0;
      let gravityInitialized = false;

      const handleMotion = (e: DeviceMotionEvent) => {
        let lx = 0;
        let ly = 0;

        if (e.acceleration && e.acceleration.x !== null) {
          lx = e.acceleration.x;
          ly = e.acceleration.y ?? 0;
        } else if (e.accelerationIncludingGravity && e.accelerationIncludingGravity.x !== null) {
          const rx = e.accelerationIncludingGravity.x;
          const ry = e.accelerationIncludingGravity.y ?? 0;
          if (!gravityInitialized) {
            gravX = rx;
            gravY = ry;
            gravityInitialized = true;
          }
          // High-pass filter isolates fast movement delta from steady 1G gravity
          const alpha = 0.82;
          gravX = alpha * gravX + (1 - alpha) * rx;
          gravY = alpha * gravY + (1 - alpha) * ry;
          lx = rx - gravX;
          ly = ry - gravY;
        }

        const force = Math.hypot(lx, ly);
        // Shake threshold: deliberate shake is force > 2.8 m/s^2
        if (force > 2.8) {
          shakeX += lx * 2.5;
          shakeY += -ly * 2.5;

          // Clamp maximum impulse to maintain visual safety margins
          shakeX = Math.max(-28, Math.min(28, shakeX));
          shakeY = Math.max(-28, Math.min(28, shakeY));

          applyParallax();

          // If vigorous shake (force > 7.0), trigger cheerful sticker jiggle
          const now = performance.now();
          if (force > 7.0 && now - lastShakeJiggleTime > 450) {
            lastShakeJiggleTime = now;
            gsap.to(".gate-reaction", {
              rotation: (idx: number) => (idx % 2 === 0 ? 12 : -12),
              scale: 1.14,
              duration: 0.16,
              yoyo: true,
              repeat: 1,
              stagger: 0.03,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        }
      };

      // Handle mobile device tilt (gyroscope orientation)
      const handleOrientation = (e: DeviceOrientationEvent) => {
        if (e.gamma === null || e.beta === null) return;

        // Calibrate baseline holding pitch so it's centered at whatever angle user holds their phone
        if (initialBeta === null) {
          initialBeta = Math.max(25, Math.min(65, e.beta));
        }

        // Gamma: left-right tilt (-28 to +28 deg normalized to -1..1)
        const nx = Math.max(-1, Math.min(1, e.gamma / 28));

        // Beta: front-back tilt relative to user holding angle (-24 to +24 deg normalized)
        const ny = Math.max(-1, Math.min(1, (e.beta - initialBeta) / 24));

        tiltX = nx;
        tiltY = ny;
        applyParallax();
      };

      // Handle pointer movement and desktop mouse flick simulation
      let lastPx = 0;
      let lastPy = 0;
      let lastPTime = 0;

      const handlePointerMove = (e: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

        const now = performance.now();
        const dt = Math.max(16, now - lastPTime);
        const vx = ((e.clientX - lastPx) / dt) * 16;
        const vy = ((e.clientY - lastPy) / dt) * 16;
        lastPx = e.clientX;
        lastPy = e.clientY;
        lastPTime = now;

        // Simulate shake bounce on swift mouse flick
        if (Math.hypot(vx, vy) > 22) {
          shakeX += Math.max(-14, Math.min(14, vx * 0.35));
          shakeY += Math.max(-14, Math.min(14, vy * 0.35));
        }

        tiltX = Math.max(-1, Math.min(1, nx));
        tiltY = Math.max(-1, Math.min(1, ny));
        applyParallax();
      };

      // iOS permission requester for gyroscope & accelerometer on user interaction
      let hasRequestedPermissions = false;
      const requestPermissions = async () => {
        if (hasRequestedPermissions) return;
        hasRequestedPermissions = true;
        try {
          if (
            typeof DeviceOrientationEvent !== "undefined" &&
            typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
              .requestPermission === "function"
          ) {
            await (
              DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
            ).requestPermission();
          }
          if (
            typeof DeviceMotionEvent !== "undefined" &&
            typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> })
              .requestPermission === "function"
          ) {
            await (
              DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }
            ).requestPermission();
          }
        } catch {
          // Silently caught if denied or unsupported
        }
      };

      // 4. Smooth, cute, and slow circular orbit revolving around the central bride character
      const orbitState = { progress: 0 };
      const orbitDuration = 28; // 28 seconds: smooth, slow, and relaxing pace

      const getOrbitMetrics = () => {
        const stage = stageRef.current;
        const w = stage?.offsetWidth || 390;
        const h = stage?.offsetHeight || 844;
        const cx = w * 0.5;
        const cy = h * 0.48; // Centered gracefully around character
        const rx = Math.max(122, Math.min(156, w * 0.40));
        const ry = Math.max(195, Math.min(265, h * 0.30));
        return { cx, cy, rx, ry };
      };

      let metrics = getOrbitMetrics();
      const onResize = () => {
        metrics = getOrbitMetrics();
      };
      window.addEventListener("resize", onResize, { passive: true });

      const updateOrbit = () => {
        const count = reactionStickers.length;
        if (count === 0) return;

        const currentP = orbitState.progress;

        orbitSlotsRef.current.forEach((slot, index) => {
          if (!slot) return;
          const baseAngle = (index / count) * Math.PI * 2;
          const angle = baseAngle + currentP * Math.PI * 2;

          const x = metrics.cx + metrics.rx * Math.cos(angle);
          const y = metrics.cy + metrics.ry * Math.sin(angle);

          // Rhythmic bouncy bobbing (cute hop / breathing wave)
          const bob = Math.sin(currentP * Math.PI * 8 + index) * 4;

          // Playful side-to-side head tilt as each bestie travels the orbit
          const tilt = Math.sin(angle) * 7.5 + Math.cos(currentP * Math.PI * 6 + index) * 3;

          // 3D carousel depth scaling: larger in front, slightly smaller behind
          const depthProgress = (Math.sin(angle) + 1) / 2; // 0 (top/back) to 1 (bottom/front)
          const scale = 0.93 + 0.13 * depthProgress;
          const zIndex = Math.sin(angle) > 0 ? 35 : 22;

          gsap.set(slot, {
            x,
            y: y + bob,
            rotation: tilt,
            scale,
            zIndex,
            xPercent: -50,
            yPercent: -50,
          });
        });
      };

      // Set initial positions immediately
      updateOrbit();

      // Continuous slow revolution
      gsap.to(orbitState, {
        progress: 1,
        duration: orbitDuration,
        ease: "none",
        repeat: -1,
        onUpdate: updateOrbit,
      });

      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      if (typeof window !== "undefined") {
        if ("DeviceOrientationEvent" in window) {
          window.addEventListener("deviceorientation", handleOrientation, { passive: true });
        }
        if ("DeviceMotionEvent" in window) {
          window.addEventListener("devicemotion", handleMotion, { passive: true });
        }
      }
      container.addEventListener("pointerdown", requestPermissions, { passive: true });
      window.addEventListener("touchstart", requestPermissions, { passive: true, once: true });

      return () => {
        window.removeEventListener("resize", onResize);
        gsap.ticker.remove(tickerCallback);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("deviceorientation", handleOrientation);
        window.removeEventListener("devicemotion", handleMotion);
        container.removeEventListener("pointerdown", requestPermissions);
        window.removeEventListener("touchstart", requestPermissions);
      };
    }, containerRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  // Handle open invitation callback with a cinematic GSAP dissolve transition
  const handleOpenTriggered = useCallback(() => {
    if (isOpening) return;
    setIsOpening(true);

    if (reduceMotion) {
      onOpened();
      return;
    }

    // GSAP dissolve & bloom animation: layers dissolve seamlessly without cutting off
    const tl = gsap.timeline({
      onComplete: () => {
        onOpened();
      },
    });

    tl.to(ctaRef.current, { scale: 0.9, opacity: 0, duration: 0.3, ease: "power2.in" }, 0)
      .to(
        [upper1Ref.current, upper2Ref.current],
        {
          scale: 1.06,
          opacity: 0,
          duration: 0.75,
          ease: "power2.inOut",
          stagger: 0.04,
        },
        0.05
      )
      .to(
        personRef.current,
        {
          scale: 1.03,
          y: 10,
          opacity: 0.3,
          duration: 0.75,
          ease: "power2.inOut",
        },
        0.08
      )
      .to(
        bgRef.current,
        {
          scale: 1.04,
          opacity: 0.3,
          duration: 0.8,
          ease: "power2.inOut",
        },
        0.08
      )
      .to(
        [".gate-orbit-slot", ".gate-reaction"],
        {
          scale: 0.5,
          opacity: 0,
          y: -15,
          stagger: 0.03,
          duration: 0.45,
          ease: "power2.in",
        },
        0.1
      )
      .to(
        headerRef.current,
        {
          y: -20,
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
        },
        0.1
      );
  }, [isOpening, onOpened, reduceMotion]);

  return (
    <div
      ref={containerRef}
      className={`gate-parallax-container ${isOpening ? "is-opening" : ""}`}
      style={{ perspective: "1000px" }}
    >
      {/* ── Parallax Image Stage ───────────────────────────────── */}
      <div ref={stageRef} className="gate-parallax-stage" aria-hidden="true">
        {/* Layer 1: Background */}
        <div ref={bgRef} className="parallax-layer parallax-layer-bg">
          <img
            src="/assets/BG.png"
            alt="Background perayaan"
            className="parallax-img"
            loading="eager"
          />
        </div>

        {/* Soft atmosphere gradient overlay */}
        <div className="parallax-layer-atmosphere" />

        {/* Layer 2: Person (Cutout) */}
        <div ref={personRef} className="parallax-layer parallax-layer-person">
          <img
            src="/assets/person.png"
            alt="Bridal figure"
            className="parallax-img"
            loading="eager"
          />
        </div>

        {/* Cinematic depth lighting */}
        <div className="parallax-layer-vignette" />

        {/* Layer 3: Upper 1 (Foreground decorative accent) */}
        <div ref={upper1Ref} className="parallax-layer parallax-layer-upper1">
          <img
            src="/assets/upper1.png"
            alt=""
            className="parallax-img"
            loading="eager"
          />
        </div>

        {/* Layer 4: Upper 2 (Foreground frame accent) */}
        <div ref={upper2Ref} className="parallax-layer parallax-layer-upper2">
          <img
            src="/assets/upper2.png"
            alt=""
            className="parallax-img"
            loading="eager"
          />
        </div>
      </div>

      {/* ── Top Header Text ────────────────────────────────────── */}
      <div ref={headerRef} className="gate-header">
        <div className="gate-kicker-badge">
          <span className="gate-kicker-star">✦</span>
          <p className="gate-kicker">You are invited to join the event</p>
          <span className="gate-kicker-star">✦</span>
        </div>
        <div className="gate-for-name">
          <span className="gate-for">Specially for</span>
          <h2 className="gate-guest" id="gate-title">
            {guestName}
          </h2>
        </div>
      </div>

      {/* ── Surrounding Animated Reaction Stickers Revolving in Orbit ─────────────── */}
      <div
        ref={stickersWrapRef}
        className="gate-reactions-wrap"
        aria-hidden="true"
      >
        {reactionStickers.map((sticker, index) => (
          <div
            key={sticker.src}
            ref={(el) => {
              orbitSlotsRef.current[index] = el;
            }}
            className={`gate-orbit-slot gate-orbit-slot-${index + 1}`}
          >
            <ReactionSticker
              src={sticker.src}
              className={sticker.className}
              index={index}
              frame={(reactionFrame + index) % 3}
              reduceMotion={Boolean(reduceMotion)}
            />
          </div>
        ))}
      </div>

      {/* ── Interactive Open Invitation CTA Button ─────────────── */}
      <div className="gate-cta-stage">
        <button
          ref={ctaRef}
          type="button"
          className="gate-open-cta"
          onClick={handleOpenTriggered}
          aria-label="Open surprise bridal shower invitation"
        >
          <span className="cta-sparkle" aria-hidden="true">✦</span>
          <span className="cta-text">Open Invitation</span>
          <span className="cta-sparkle" aria-hidden="true">✦</span>
        </button>
      </div>
    </div>
  );
}
