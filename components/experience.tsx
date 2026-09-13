"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { CalendarPlus, ChevronDown, Gift, Heart, Share2, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Lenis from "lenis";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { Countdown } from "@/components/countdown";
import { LoveNotes, RSVPForm } from "@/components/forms";
import { event, gallery, rundown, shades } from "@/src/data/event";

const SatinCanvas = dynamic(
  () => import("@/components/satin-canvas").then((module) => module.SatinCanvas),
  { ssr: false, loading: () => <div className="canvas-poster" aria-hidden="true" /> },
);

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reveal}
      initial={reduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: .18 }}
      transition={{ duration: .78, ease: [.16, 1, .3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function downloadCalendar() {
  const day = event.dateISO.replaceAll("-", "");
  const nextDay = "20260916";
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pinky Promise//Bridal Shower//ID",
    "BEGIN:VEVENT",
    `UID:pinky-promise-${day}@local`,
    `DTSTAMP:${day}T000000Z`,
    `DTSTART;VALUE=DATE:${day}`,
    `DTEND;VALUE=DATE:${nextDay}`,
    "SUMMARY:Pinky Promise — Bridal Shower",
    "DESCRIPTION:A little pink, a lot of love, one forever promise.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([calendar], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "pinky-promise-15-september-2026.ics";
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
  const mainRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("to");
    const clean = raw?.replace(/[<>]/g, "").trim().slice(0, 48);
    if (clean) setGuestName(clean);
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
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false });
    lenisRef.current = lenis;
    if (!opened) lenis.stop();
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
  }, [opened]);

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
    window.setTimeout(() => {
      setGateGone(true);
      heroTitleRef.current?.focus();
    }, reduceMotion ? 30 : 1000);
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
      title: "Pinky Promise — Bridal Shower",
      text: "A little pink, a lot of love · 15 September 2026",
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(data.url);
        setShareStatus("Link sudah disalin.");
      }
    } catch {
      setShareStatus("");
    }
  }

  const rootStyle = { "--active-pink": accent } as CSSProperties;

  return (
    <main className="invitation-shell" style={rootStyle}>
      <a className="skip-link" href="#details">Lewati ke detail acara</a>

      {!gateGone && (
        <section
          className={`invitation-gate ${opened ? "is-open" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gate-title"
        >
          <div className="gate-grain" aria-hidden="true" />
          <div className="gate-orbit gate-orbit-one" aria-hidden="true" />
          <div className="gate-orbit gate-orbit-two" aria-hidden="true" />
          <p className="gate-kicker">A little something lovely has arrived</p>
          <div className="gate-card">
            <p className="gate-for">Khusus untuk</p>
            <h2 className="gate-guest" id="gate-title">{guestName}</h2>
            <span className="gate-rule" aria-hidden="true" />
            <p className="gate-copy">You&apos;re invited to celebrate our favorite bride-to-be.</p>
            <button type="button" className="seal-button" onClick={openInvitation} autoFocus>
              <span className="seal-shine" aria-hidden="true" />
              <span className="seal-mark">P</span>
              <span className="sr-only">Buka undangan</span>
            </button>
            <button type="button" className="open-button" onClick={openInvitation}>
              Buka undangannya <span aria-hidden="true">↗</span>
            </button>
            <p className="gate-note">open the pink envelope</p>
          </div>
        </section>
      )}

      <div ref={mainRef} data-main-content>
        <div className="page-progress" ref={progressRef} aria-hidden="true">
          <span />
          {[0, 1, 2, 3, 4, 5].map((dot) => <i key={dot} />)}
        </div>

        <section className="hero" id="hero" aria-labelledby="hero-title">
          <Image
            className="hero-image"
            src="/images/hero-pink-tablescape.jpg"
            alt="Meja perayaan bernuansa pink dengan bunga, piring, dan gelas"
            fill
            priority
            sizes="100vw"
          />
          <div className="hero-wash" aria-hidden="true" />
          <div className="hero-canvas" aria-hidden="true">
            <div className="canvas-poster" />
            {!reduceMotion && <SatinCanvas accent={accent} opened={opened} active={canvasActive} />}
          </div>
          <nav className="hero-nav" aria-label="Navigasi utama">
            <span className="monogram">PP</span>
            <span className="nav-date">15 · 09 · 26</span>
          </nav>
          <div className="hero-content">
            <p className="eyebrow">A bridal shower for</p>
            <h1 id="hero-title" ref={heroTitleRef} tabIndex={-1}>
              Pinky <em>Promise</em>
            </h1>
            <p className="hero-copy">
              Sebelum ia berkata “I do”, mari rayakan satu sore penuh tawa,
              cake, happy tears, dan semua perempuan yang paling menyayanginya.
            </p>
            <div className="hero-date">
              <span>Selasa / Tuesday</span>
              <strong>15 September 2026</strong>
            </div>
            <button className="hero-cta" type="button" onClick={() => scrollTo("details")}>
              Lihat detail acara <ChevronDown size={17} aria-hidden="true" />
            </button>
          </div>
          <button className="hero-bow" type="button" onClick={tapBow} aria-label="Pita kecil dengan kejutan tersembunyi">
            <span aria-hidden="true">୨୧</span>
          </button>
          <p className="hero-whisper">she found her forever — now let&apos;s make her blush.</p>
        </section>

        <div className="ticker" aria-hidden="true">
          <div>BRIDE TO BE · PINKY PROMISE · HAPPY TEARS · 15.09.2026 · BRIDE TO BE · PINKY PROMISE · HAPPY TEARS · 15.09.2026 ·</div>
        </div>

        <section className="intro-section" id="details">
          <Reveal className="section-label"><span>01</span><p>For our favorite girl</p></Reveal>
          <div className="intro-grid">
            <Reveal className="intro-copy">
              <p className="mini-kicker">One pink afternoon</p>
              <h2>For the girl entering her <em>forever era.</em></h2>
              <p className="intro-body">
                She found her person. Sekarang waktunya kita mengelilinginya dengan cinta,
                cerita lama, doa baik, dan beberapa kejutan berwarna pink.
              </p>
            </Reveal>
            <Reveal className="intro-photo-wrap">
              <figure className="intro-photo">
                <Image src="/images/pink-bouquet-macro.jpg" alt="Bouquet mawar pink dalam close-up editorial" fill sizes="(max-width: 767px) 84vw, 38vw" />
              </figure>
              <p className="photo-note">come for the bride,<br />stay for the cake.</p>
            </Reveal>
          </div>
        </section>

        <section className="date-section" aria-labelledby="date-heading">
          <Reveal className="date-art" aria-hidden="true">
            <span>15</span>
            <p>September<br />twenty twenty-six</p>
          </Reveal>
          <Reveal className="date-content">
            <p className="mini-kicker">Counting down to her sweetest yes</p>
            <h2 id="date-heading">Save the <em>pink date.</em></h2>
            <Countdown />
            <dl className="event-facts">
              <div><dt>When</dt><dd>{event.dateLabel}<br /><span>Detail waktu segera diumumkan</span></dd></div>
              <div><dt>Where</dt><dd>Tempat cantik pilihan kami<br /><span>Detail lokasi segera diumumkan</span></dd></div>
            </dl>
            <button className="outline-button" type="button" onClick={downloadCalendar}>
              <CalendarPlus size={17} aria-hidden="true" /> Simpan ke kalender
            </button>
          </Reveal>
        </section>

        <section className="gallery-section" aria-labelledby="gallery-heading">
          <Reveal className="gallery-heading">
            <div className="section-label light"><span>02</span><p>Camera roll incoming</p></div>
            <h2 id="gallery-heading">The Bride<br /><em>Appreciation Club.</em></h2>
            <p>Swipe pelan-pelan—setiap frame datang dengan sedikit main character energy.</p>
          </Reveal>
          <div className="gallery-track" aria-label="Galeri foto bridal shower">
            {gallery.map((item, index) => (
              <motion.figure
                key={item.src}
                className={`gallery-card gallery-card-${index + 1}`}
                tabIndex={0}
                initial={reduceMotion ? false : { opacity: 0, y: 44, rotate: index === 1 ? 2 : -2 }}
                whileInView={{ opacity: 1, y: 0, rotate: index === 1 ? 2 : -2 }}
                viewport={{ once: true, amount: .22 }}
                transition={{ duration: .8, delay: index * .08, ease: [.16, 1, .3, 1] }}
              >
                <div className="gallery-image">
                  <Image src={item.src} alt={item.alt} fill sizes="(max-width: 767px) 82vw, 30vw" />
                </div>
                <figcaption><span>0{index + 1}</span>{item.caption}</figcaption>
              </motion.figure>
            ))}
          </div>
        </section>

        <section className="rundown-section" aria-labelledby="rundown-heading">
          <Reveal className="rundown-title">
            <div className="section-label"><span>03</span><p>The little plan</p></div>
            <p className="mini-kicker">A little plan, a lot of fun</p>
            <h2 id="rundown-heading">The pink<br /><em>agenda.</em></h2>
          </Reveal>
          <ol className="timeline">
            {rundown.map((item, index) => (
              <motion.li
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: .45 }}
                transition={{ duration: .58, delay: index * .04 }}
              >
                <span>0{index + 1}</span>
                <div><h3>{item.title}</h3><p>{item.copy}</p></div>
              </motion.li>
            ))}
          </ol>
          <p className="schedule-note">Urutan acara sudah siap; jam detail akan dibagikan segera.</p>
        </section>

        <section className="dress-section" aria-labelledby="dress-heading">
          <div className="dress-photo">
            <Image src="/images/place-setting-detail.jpg" alt="Detail meja pastel sebagai inspirasi palet dress code" fill sizes="(max-width: 767px) 100vw, 46vw" />
            <span>wear<br />the mood</span>
          </div>
          <Reveal className="dress-copy">
            <div className="section-label"><span>04</span><p>Dress code</p></div>
            <p className="mini-kicker">Think romantic, polished & playful</p>
            <h2 id="dress-heading">Pretty in <em>pink.</em></h2>
            <p>Pilih blush, petal, rose, berry, atau soft ivory. Pure white is lovingly reserved for the bride.</p>
            <div className="swatches" aria-label="Pilihan warna dress code">
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
        </section>

        <section className="notes-section" aria-labelledby="notes-heading">
          <Reveal className="notes-copy">
            <div className="section-label light"><span>05</span><p>Love-note wall</p></div>
            <p className="mini-kicker">A tiny letter for her</p>
            <h2 id="notes-heading">Dear bride, <em>…</em></h2>
            <p>Titip satu kalimat untuk dibaca saat ia membutuhkan senyum—doa, kenangan kecil, atau inside joke yang hanya kalian pahami.</p>
          </Reveal>
          <Reveal><LoveNotes /></Reveal>
        </section>

        <section className="gift-section">
          <div className="gift-image">
            <Image src="/images/garden-party-table.jpg" alt="Meja perayaan di taman dengan bunga-bunga lembut" fill sizes="100vw" />
          </div>
          <Reveal className="gift-card">
            <Gift size={24} aria-hidden="true" />
            <p className="mini-kicker">A little note</p>
            <h2>Your presence is the <em>prettiest present.</em></h2>
            <p>Tidak ada kewajiban membawa hadiah. Kehadiran, pelukan, dan waktu bersamamu sudah lebih dari cukup.</p>
          </Reveal>
        </section>

        <section className="rsvp-section" id="rsvp" aria-labelledby="rsvp-heading">
          <Reveal className="rsvp-heading">
            <div className="section-label"><span>06</span><p>The pink list</p></div>
            <p className="mini-kicker">Will you be in our pink corner?</p>
            <h2 id="rsvp-heading">Save your<br /><em>seat, lovely.</em></h2>
            <p>Konfirmasi kehadiran agar kami bisa menyiapkan kursi, cake, dan sedikit magic khusus untukmu.</p>
          </Reveal>
          <Reveal><RSVPForm /></Reveal>
        </section>

        <section className="closing-section">
          <Image src="/images/pink-raspberry-cake.jpg" alt="Kue pink berhias raspberry" fill sizes="100vw" />
          <div className="closing-wash" aria-hidden="true" />
          <Reveal className="closing-content">
            <Sparkles size={24} aria-hidden="true" />
            <p className="mini-kicker">15 · 09 · 2026</p>
            <h2>Come for the bride,<br /><em>stay for the cake.</em></h2>
            <p>Can&apos;t wait to celebrate with you.</p>
            <p className="signature">With love,<br /><strong>the girls</strong></p>
            <button type="button" className="glass-button" onClick={shareInvitation}>
              <Share2 size={17} aria-hidden="true" /> Bagikan undangan
            </button>
            <span className="share-status" aria-live="polite">{shareStatus}</span>
          </Reveal>
          <footer>made with love, bows &amp; a suspicious amount of pink</footer>
        </section>
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
