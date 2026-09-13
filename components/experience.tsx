"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { CalendarPlus, ChevronDown, Gift, MapPin, Share2, Sparkles } from "lucide-react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import Lenis from "lenis";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { Countdown } from "@/components/countdown";
import { FloatingBalloons } from "@/components/floating-balloons";
import { LoveNotes } from "@/components/forms";
import { ReactionSticker } from "@/components/reaction-sticker";
import { event, gallery, rundown, shades } from "@/src/data/event";

const SatinCanvas = dynamic(
  () => import("@/components/satin-canvas").then((module) => module.SatinCanvas),
  { ssr: false, loading: () => <div className="canvas-poster" aria-hidden="true" /> },
);

const EnvelopeParallaxGate = dynamic(
  () => import("@/components/envelope-parallax-gate").then((module) => module.EnvelopeParallaxGate),
  { ssr: false, loading: () => <div className="envelope-loading" aria-hidden="true" /> },
);

const ButterflyTransition = dynamic(
  () => import("@/components/butterfly-transition").then((module) => module.ButterflyTransition),
  { ssr: false },
);

const MusicPlayer = dynamic(
  () => import("@/components/music-player").then((module) => module.MusicPlayer),
  { ssr: false },
);

function RibbonDivider({ light = false }: { light?: boolean }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={`section-divider ${light ? "light" : ""}`}
      aria-hidden="true"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.68, y: 16 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <svg width="46" height="20" viewBox="0 0 46 20" fill="none" className="divider-bow">
        <path
          d="M23 10 C19 4, 9 2, 4 8 C-1 14, 8 18, 21 11 L23 10 L25 11 C38 18, 47 14, 42 8 C37 2, 27 4, 23 10 Z"
          fill={light ? "rgba(255, 255, 255, 0.4)" : "rgba(243, 53, 140, 0.35)"}
        />
        <circle cx="23" cy="10" r="2.2" fill={light ? "#ffffff" : "var(--rose)"} />
      </svg>
    </motion.div>
  );
}

const reactionStickers = [
  { src: "/images/reactions/back-left.png", className: "gate-reaction-1" },
  { src: "/images/reactions/back-center.png", className: "gate-reaction-2" },
  { src: "/images/reactions/back-right.png", className: "gate-reaction-3" },
  { src: "/images/reactions/front-left.png", className: "gate-reaction-4" },
  { src: "/images/reactions/front-center.png", className: "gate-reaction-5" },
  { src: "/images/reactions/front-right.png", className: "gate-reaction-6" },
];

const stageReactionStickers = [
  { src: "/images/reactions/back-left.png", className: "stage-reaction stage-reaction-1" },
  { src: "/images/reactions/back-center.png", className: "stage-reaction stage-reaction-2" },
  { src: "/images/reactions/back-right.png", className: "stage-reaction stage-reaction-3" },
  { src: "/images/reactions/front-left.png", className: "stage-reaction stage-reaction-4" },
  { src: "/images/reactions/front-center.png", className: "stage-reaction stage-reaction-5" },
  { src: "/images/reactions/front-right.png", className: "stage-reaction stage-reaction-6" },
];

function Reveal({
  children,
  className = "",
  delay = 0,
  y = 24,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.72, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionReveal({
  children,
  className = "",
  id,
  role,
  "aria-labelledby": ariaLabelledby,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  role?: string;
  "aria-labelledby"?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section
      id={id}
      role={role}
      aria-labelledby={ariaLabelledby}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05, margin: "0px 0px -20px 0px" }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.section>
  );
}

function InteractiveStickerStage({ reduceMotion }: { reduceMotion: boolean }) {
  const [stageFrame, setStageFrame] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      setStageFrame((current) => (current + 1) % 3);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const nextFace = () => {
    setStageFrame((current) => (current + 1) % 3);
  };

  return (
    <div
      className="sticker-stage"
      onClick={nextFace}
      role="button"
      tabIndex={0}
      aria-label="Interactive bestie appreciation corner. Tap to switch faces."
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          nextFace();
        }
      }}
    >
      <div className="sticker-copy">
        <span>six besties</span>
        <strong>one pink corner</strong>
        <i>୨୧</i>
        <span className="sticker-subhint">tap to change faces ✦</span>
      </div>
      {stageReactionStickers.map((sticker, index) => (
        <ReactionSticker
          key={`stage-${sticker.src}`}
          src={sticker.src}
          frame={(stageFrame + index) % 3}
          className={sticker.className}
          index={index}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  );
}

function downloadCalendar() {
  const day = event.dateISO.replaceAll("-", "");
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pinky Promise//Bridal Shower//EN",
    "BEGIN:VEVENT",
    `UID:pinky-promise-${day}@shaula`,
    `DTSTAMP:${day}T120000Z`,
    `DTSTART;TZID=Asia/Jakarta:${day}T190000`,
    `DTEND;TZID=Asia/Jakarta:${day}T220000`,
    "SUMMARY:Surprise Bridal Shower for Shaula Putri",
    "DESCRIPTION:Please join us for a surprise bridal shower for Shaula Putri (Yudistira & Shaula Putri Andana) at Krema de Bruge.",
    "LOCATION:Krema de Bruge",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([calendar], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "shaula-bridal-shower-15-september-2026.ics";
  link.click();
  URL.revokeObjectURL(url);
}

export function Experience() {
  const reduceMotion = useReducedMotion();
  const [opened, setOpened] = useState(false);
  const [gateGone, setGateGone] = useState(false);
  const [guestName, setGuestName] = useState("Bestie");
  const [accent, setAccent] = useState(shades[1].color);
  const [surprise, setSurprise] = useState(false);
  const [bowTaps, setBowTaps] = useState(0);
  const [shareStatus, setShareStatus] = useState("");
  const [canvasActive, setCanvasActive] = useState(true);
  const [gateReactionFrame, setGateReactionFrame] = useState(0);
  const gateRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("to");
    const clean = raw?.replace(/[<>]/g, "").trim().slice(0, 48);
    const frame = window.requestAnimationFrame(() => {
      if (clean) setGuestName(clean);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const content = mainRef.current;
    document.body.style.overflow = opened ? "" : "hidden";
    if (opened) content?.removeAttribute("inert");
    else content?.setAttribute("inert", "");
    return () => {
      document.body.style.overflow = "";
      content?.removeAttribute("inert");
    };
  }, [opened]);

  useEffect(() => {
    if (reduceMotion) return;
    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: true,
      syncTouchLerp: 0.09,
      touchInertiaExponent: 1.6,
      touchMultiplier: 1.25,
    });
    lenisRef.current = lenis;
    lenis.stop();
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    lenis.on("scroll", ({ progress }: { progress: number }) => {
      progressRef.current?.style.setProperty("--page-progress", String(progress));
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (opened) lenisRef.current?.start();
    else lenisRef.current?.stop();
  }, [opened]);

  // Only animate gate reactions while the entrance gate is visible
  useEffect(() => {
    if (reduceMotion || gateGone) return;
    const timer = window.setInterval(() => {
      setGateReactionFrame((current) => (current + 1) % 3);
    }, 1800);
    return () => window.clearInterval(timer);
  }, [reduceMotion, gateGone]);

  useEffect(() => {
    const hero = document.querySelector(".hero");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setCanvasActive(entry.isIntersecting), { rootMargin: "120px" });
    observer.observe(hero);
    const onVisibility = () => setCanvasActive(!document.hidden && Boolean(observer));
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  function openInvitation() {
    setOpened(true);
    // The 3D envelope has already done its opening animation.
    // Give the AnimatePresence exit animation a moment before unmounting.
    window.setTimeout(() => {
      setGateGone(true);
      heroTitleRef.current?.focus();
    }, reduceMotion ? 30 : 800);
  }

  function moveGateReactions(event: React.PointerEvent<HTMLElement>) {
    if (reduceMotion || !gateRef.current) return;
    const bounds = gateRef.current.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - .5) * 12;
    const y = ((event.clientY - bounds.top) / bounds.height - .5) * 9;
    gateRef.current.style.setProperty("--gate-x", `${x}px`);
    gateRef.current.style.setProperty("--gate-y", `${y}px`);
  }

  function resetGateReactions() {
    gateRef.current?.style.setProperty("--gate-x", "0px");
    gateRef.current?.style.setProperty("--gate-y", "0px");
  }

  function scrollTo(id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    if (reduceMotion || !lenisRef.current) target.scrollIntoView();
    else lenisRef.current.scrollTo(target, { offset: -12 });
  }

  function tapBow() {
    const next = bowTaps + 1;
    setBowTaps(next);
    if (next >= 3) {
      setSurprise(true);
      setBowTaps(0);
      window.setTimeout(() => setSurprise(false), 3600);
    }
  }

  async function shareInvitation() {
    const data = {
      title: "Surprise Bridal Shower for Shaula Putri",
      text: "Please join us for a surprise bridal shower for Shaula Putri (Yudistira & Shaula) · Tuesday, 15 September 2026 at Krema de Bruge",
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(data.url);
        setShareStatus("Invitation link copied to clipboard!");
      }
    } catch {
      setShareStatus("");
    }
  }

  const rootStyle = { "--active-pink": accent } as CSSProperties;

  return (
    <main className="invitation-shell" style={rootStyle}>
      <a className="skip-link" href="#details">Skip to event details</a>

      <AnimatePresence>
        {!gateGone && (
          <motion.section
            key="envelope-gate"
            className={`invitation-gate envelope-gate ${opened ? "is-open" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="gate-title"
            exit={{
              opacity: 0,
              scale: 1.06,
              filter: "blur(18px)",
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            }}
          >
            <EnvelopeParallaxGate
              guestName={guestName}
              onOpened={openInvitation}
              reduceMotion={Boolean(reduceMotion)}
              reactionFrame={gateReactionFrame}
              reactionStickers={reactionStickers}
            />
          </motion.section>
        )}
      </AnimatePresence>

      <div ref={mainRef} data-main-content>
        {opened && <ButterflyTransition />}
        <MusicPlayer opened={opened} />

        <div className="page-progress" ref={progressRef} aria-hidden="true">
          <span />
          {[0, 1, 2, 3, 4].map((dot) => <i key={dot} />)}
        </div>

        <section className="hero" id="hero" aria-labelledby="hero-title">
          <Image
            className="hero-image"
            src="/assets/Bghero.png"
            alt="Dreamy glowing pink aura hearts and sparkle stars backdrop"
            fill
            priority
            sizes="(max-width: 430px) 100vw, 390px"
          />
          <div className="hero-wash" aria-hidden="true" />
          <div className="hero-canvas" aria-hidden="true">
            <div className="canvas-poster" />
            {!reduceMotion && <SatinCanvas accent={accent} opened={opened} active={canvasActive} />}
          </div>
          <div className="hero-content">
            <div className="hero-eyebrow-container">
              <span className="hero-pill-badge">
                <span className="pill-sparkle">✦</span>
                <span>Surprise Bridal Shower</span>
                <span className="pill-sparkle">✦</span>
              </span>
              <p className="hero-invitation-lead">Please join us to celebrate our bride-to-be</p>
            </div>

            <h1 id="hero-title" ref={heroTitleRef} tabIndex={-1} className="hero-title-badge">
              <span className="sr-only">Shaula Putri</span>
              <Image
                src="/assets/Shaula.png"
                alt="Shaula Putri"
                width={360}
                height={360}
                className="hero-name-graphic"
                priority
              />
            </h1>

            <div className="hero-taglines">
              <p className="hero-script-tagline">She said yes for forever</p>
              <p className="hero-commemorate-text">
                To celebrate and commemorate the milestone of<br />
                <strong className="hero-couple-highlight">Yudistira &amp; Shaula Putri Andana</strong>
              </p>
            </div>

            <div className="hero-info-ticket">
              <div className="ticket-top-row">
                <div className="ticket-col">
                  <span className="ticket-dim-label">DATE</span>
                  <span className="ticket-bold-val">Tuesday, 15 Sept 2026</span>
                </div>
                <div className="ticket-vert-line" />
                <div className="ticket-col">
                  <span className="ticket-dim-label">TIME</span>
                  <span className="ticket-bold-val">19:00 PM</span>
                </div>
              </div>
              <div className="ticket-bottom-row">
                <MapPin size={13} className="ticket-icon" aria-hidden="true" />
                <span>Krema de Bruge</span>
              </div>
            </div>

            <button className="hero-cta" type="button" onClick={() => scrollTo("details")}>
              <span>See Event Details</span>
              <span className="hero-cta-chevron" aria-hidden="true">
                <ChevronDown size={15} />
              </span>
            </button>

            <div className="hero-bottom-bar">
              <button className="hero-bow" type="button" onClick={tapBow} aria-label="Tap the bow for a secret surprise">
                <span aria-hidden="true">୨୧</span>
              </button>
              <p className="hero-whisper">she said yes for forever — now let&apos;s make her blush.</p>
            </div>
          </div>
        </section>

        <div className="ticker" aria-hidden="true">
          <div>SURPRISE BRIDAL SHOWER · SHAULA PUTRI · YUDISTIRA &amp; SHAULA · 15.09.2026 · KREMA DE BRUGE · SHE SAID YES FOR FOREVER ·</div>
        </div>

        <SectionReveal className="intro-section" id="details">
          <Reveal className="section-label"><span>01</span><p>Celebrating our favorite girl</p></Reveal>
          <div className="intro-grid">
            <Reveal className="intro-copy" delay={0.06}>
              <p className="mini-kicker">One unforgettable evening</p>
              <h2>To celebrate &amp; commemorate <em>their love.</em></h2>
              <p className="intro-body">
                She said yes for forever! Yudistira and Shaula Putri Andana are embarking on their forever journey,
                and we&apos;re gathering her closest girls for a secret evening of laughter, cake, sweet memories, and happy tears.
              </p>
            </Reveal>
            <Reveal className="intro-photo-wrap" delay={0.14}>
              <figure className="intro-photo">
                <Image src="/assets/Couple.png" alt="Yudistira &amp; Shaula Putri Andana" fill sizes="(max-width: 767px) 84vw, 38vw" />
              </figure>
              <p className="photo-note">come for the bride,<br />stay for the cake.</p>
            </Reveal>
          </div>
        </SectionReveal>

        <RibbonDivider />

        <SectionReveal className="date-section" aria-labelledby="date-heading">
          <FloatingBalloons />
          <Reveal className="date-seal-card" delay={0.06}>
            <div className="date-seal-header">
              <span className="seal-bow" aria-hidden="true">୨୧</span>
              <span className="seal-tag">THE OFFICIAL DATE</span>
              <span className="seal-sparkle" aria-hidden="true">✦</span>
            </div>
            <div className="date-seal-main">
              <span className="date-seal-day">15</span>
              <div className="date-seal-info">
                <span className="date-seal-month">September</span>
                <span className="date-seal-year">Tuesday · 2026</span>
              </div>
            </div>
            <div className="date-seal-footer">
              <span className="seal-dot" />
              <p>mark your calendar · she said yes</p>
              <span className="seal-dot" />
            </div>
          </Reveal>
          <Reveal className="date-content" delay={0.12}>
            <div className="date-heading-wrap">
              <p className="mini-kicker">Save the date</p>
              <h2 id="date-heading">It&apos;s almost time <em>to celebrate.</em></h2>
            </div>
            <Countdown />
            <div className="event-detail-cards">
              <div className="event-detail-card">
                <div className="detail-card-icon" aria-hidden="true">
                  <CalendarPlus size={18} />
                </div>
                <div className="detail-card-text">
                  <span className="detail-card-label">WHEN</span>
                  <strong className="detail-card-val">Tuesday, 15 September 2026</strong>
                  <span className="detail-card-sub">19:00 PM WIB (Evening)</span>
                </div>
              </div>
              <div className="event-detail-card">
                <div className="detail-card-icon" aria-hidden="true">
                  <MapPin size={18} />
                </div>
                <div className="detail-card-text">
                  <span className="detail-card-label">WHERE</span>
                  <strong className="detail-card-val">Krema de Bruge</strong>
                  <span className="detail-card-sub">Jl. Panglima Polim, Jakarta Selatan</span>
                </div>
              </div>
            </div>
            <div className="date-action-group">
              <a
                className="pink-button"
                href={event.mapsUrl ?? "https://www.google.com/maps/search/?api=1&query=Krema+de+Bruge"}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <MapPin size={17} aria-hidden="true" /> Open in Google Maps
              </a>
              <button className="outline-button" type="button" onClick={downloadCalendar}>
                <CalendarPlus size={17} aria-hidden="true" /> Add to calendar
              </button>
            </div>
          </Reveal>
        </SectionReveal>

        <RibbonDivider light />

        <SectionReveal className="gallery-section" id="gallery" aria-labelledby="gallery-heading">
          <Reveal className="gallery-heading">
            <div className="section-label light"><span>02</span><p>Camera roll incoming</p></div>
            <h2 id="gallery-heading">The Bride<br /><em>Appreciation Club.</em></h2>
            <p>Swipe slowly — every frame comes with pure main character energy for Shaula.</p>
          </Reveal>
          <InteractiveStickerStage reduceMotion={Boolean(reduceMotion)} />
          <div className="gallery-track" aria-label="Bridal shower photo gallery">
            {gallery.map((item, index) => (
              <motion.figure
                key={item.src}
                className={`gallery-card gallery-card-${index + 1}`}
                tabIndex={0}
                initial={reduceMotion ? false : { opacity: 0, y: 28, rotate: index === 1 ? 1.5 : -1.5 }}
                whileInView={{ opacity: 1, y: 0, rotate: index === 1 ? 1.5 : -1.5 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ duration: 0.65, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="gallery-image">
                  <Image src={item.src} alt={item.alt} fill sizes="(max-width: 767px) 82vw, 30vw" />
                  <div className="gallery-photo-sticker" aria-hidden="true">
                    {index === 0 && <span className="photo-sticker-pill">୨୧ The Girls</span>}
                    {index === 1 && <span className="photo-sticker-pill">♥ Forever Love</span>}
                    {index === 2 && <span className="photo-sticker-pill">✦ Best Memories ✦</span>}
                  </div>
                </div>
                <figcaption><span>0{index + 1}</span>{item.caption}</figcaption>
              </motion.figure>
            ))}
          </div>
        </SectionReveal>

        <SectionReveal className="rundown-section" aria-labelledby="rundown-heading">
          <Reveal className="rundown-title">
            <div className="section-label"><span>03</span><p>The pink plan</p></div>
            <p className="mini-kicker">A little plan, a lot of fun</p>
            <h2 id="rundown-heading">The pink<br /><em>agenda.</em></h2>
          </Reveal>
          <ol className="timeline">
            {rundown.map((item, index) => (
              <motion.li
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.58, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <span>0{index + 1}</span>
                <div><h3>{item.title}</h3><p>{item.copy}</p></div>
              </motion.li>
            ))}
          </ol>
          <Reveal delay={0.16}><p className="schedule-note">Order of events is set; timing will flow naturally with the laughter.</p></Reveal>
        </SectionReveal>

        <RibbonDivider />

        <SectionReveal className="dress-section" aria-labelledby="dress-heading">
          <Reveal className="dress-photo" delay={0.05}>
            <Image src="/images/place-setting-detail.jpg" alt="Romantic pastel table setting as dress code palette inspiration" fill sizes="(max-width: 767px) 100vw, 46vw" />
            <span>wear<br />the mood</span>
          </Reveal>
          <Reveal className="dress-copy" delay={0.12}>
            <div className="section-label"><span>04</span><p>Dress code</p></div>
            <p className="mini-kicker">Think romantic, polished &amp; playful</p>
            <h2 id="dress-heading">Come dressed in your<br /><em>best pink dresses.</em></h2>
            <p>I can&apos;t wait to celebrate this beautiful moment with you in true pink style.</p>
            <p style={{ fontSize: "0.88rem", opacity: 0.85, marginTop: "-12px" }}>
              Choose blush, petal, rose, berry, or soft ivory. Pure white is lovingly reserved for the bride.
            </p>
            <div className="swatches" aria-label="Dress code color palette">
              {shades.map((shade) => (
                <button
                  type="button"
                  key={shade.name}
                  className={accent === shade.color ? "is-active" : ""}
                  onClick={() => setAccent(shade.color)}
                  aria-pressed={accent === shade.color}
                >
                  <i style={{ backgroundColor: shade.color }} aria-hidden="true" />
                  <span>{shade.name}</span>
                </button>
              ))}
            </div>
            <p className="tap-note">Tap a shade to try the mood.</p>
          </Reveal>
        </SectionReveal>

        <RibbonDivider light />

        <SectionReveal className="notes-section" aria-labelledby="notes-heading">
          <Reveal className="notes-copy">
            <div className="section-label light"><span>05</span><p>Love-note wall</p></div>
            <p className="mini-kicker">A tiny letter for Shaula</p>
            <h2 id="notes-heading">Dear bride, <em>with all our love.</em></h2>
            <p>Leave a sentence for Shaula to read whenever she needs a smile — a heartfelt prayer, a funny memory, or an inside joke only you two share.</p>
          </Reveal>
          <Reveal delay={0.1}><LoveNotes /></Reveal>
        </SectionReveal>

        <RibbonDivider />

        <SectionReveal className="gift-section">
          <div className="gift-image">
            <Image src="/images/garden-party-table.jpg" alt="Garden celebration table with soft floral arrangements" fill sizes="100vw" />
          </div>
          <Reveal className="gift-card" delay={0.1}>
            <Gift size={24} aria-hidden="true" />
            <p className="mini-kicker">A gentle note</p>
            <h2>Your presence is the <em>prettiest present.</em></h2>
            <p>There is no obligation to bring a gift. Your presence, warm hugs, and cherished time together are more than enough.</p>
          </Reveal>
        </SectionReveal>

        <SectionReveal className="closing-section">
          <Image src="/images/pink-raspberry-cake.jpg" alt="Artisanal pink cake topped with fresh raspberries" fill sizes="100vw" />
          <div className="closing-wash" aria-hidden="true" />
          <Reveal className="closing-content" delay={0.1}>
            <Sparkles size={24} aria-hidden="true" />
            <p className="mini-kicker">15 · 09 · 2026</p>
            <h2>Come for the bride,<br /><em>stay for the cake.</em></h2>
            <p>Can&apos;t wait to celebrate with you!</p>
            <p className="signature">With love,<br /><strong>the girls</strong></p>
            <button type="button" className="glass-button" onClick={shareInvitation}>
              <Share2 size={17} aria-hidden="true" /> Share invitation
            </button>
            <span className="share-status" aria-live="polite">{shareStatus}</span>
          </Reveal>
          <footer>made with love, bows &amp; a suspicious amount of pink</footer>
        </SectionReveal>
      </div>

      {surprise && (
        <div className="surprise-toast" role="status">
          <span aria-hidden="true">✦ ୨୧ ✦</span>
          You found the something pink!
        </div>
      )}
    </main>
  );
}
