"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Heart, Send } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const rsvpSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  attendance: z.enum(["yes", "no"], { message: "Please select your attendance." }),
  dietary: z.string().trim().max(180, "Maximum 180 characters."),
  message: z.string().trim().max(300, "Maximum 300 characters."),
  contact: z.string().trim().max(80, "Maximum 80 characters."),
  company: z.string().max(0, ""),
});

type RSVPValues = z.infer<typeof rsvpSchema>;

export function LoveNotes() {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = note.trim();
    if (!clean) return;
    const current = JSON.parse(localStorage.getItem("pinky-love-notes") ?? "[]") as string[];
    localStorage.setItem("pinky-love-notes", JSON.stringify([...current, clean].slice(-12)));
    setSaved(true);
    setNote("");
  }

  return (
    <form className="note-form" onSubmit={submit}>
      <label htmlFor="love-note">Write something she will cherish forever…</label>
      <textarea
        id="love-note"
        value={note}
        onChange={(event) => {
          setNote(event.target.value.slice(0, 280));
          setSaved(false);
        }}
        placeholder="Share a memory, a warm wish, or a sweet secret…"
        rows={4}
        required
      />
      <div className="form-footer">
        <span>{note.length}/280</span>
        <button type="submit" className="dark-button">
          Send with love <Heart size={16} aria-hidden="true" />
        </button>
      </div>
      <p className="local-note">Private note: messages are stored locally on this device.</p>
      <p className="form-status" aria-live="polite">
        {saved ? <><Check size={16} aria-hidden="true" /> Saved — sealed with a pinky promise.</> : null}
      </p>
    </form>
  );
}

export function RSVPForm() {
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RSVPValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: { name: "", attendance: undefined, dietary: "", message: "", contact: "", company: "" },
  });

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 7000);
    return () => window.clearTimeout(timer);
  }, [saved]);

  const submit = handleSubmit(async (values) => {
    await new Promise((resolve) => window.setTimeout(resolve, 550));
    const existing = JSON.parse(localStorage.getItem("pinky-rsvp") ?? "[]") as RSVPValues[];
    localStorage.setItem("pinky-rsvp", JSON.stringify([...existing, values].slice(-20)));
    setSaved(true);
    reset();
  });

  return (
    <form className={`rsvp-form ${saved ? "is-success" : ""}`} onSubmit={submit} noValidate>
      <div className="field field-wide">
        <label htmlFor="rsvp-name">Name</label>
        <input id="rsvp-name" autoComplete="name" placeholder="Your full name" aria-invalid={Boolean(errors.name)} {...register("name")} />
        {errors.name && <span className="field-error">{errors.name.message}</span>}
      </div>

      <fieldset className="field field-wide attendance-field">
        <legend>Are you coming ?</legend>
        <label className="choice-card">
          <input type="radio" value="yes" {...register("attendance")} />
          <span>Absolutely wouldn’t miss it</span>
          <small>Ready to celebrate with Shaula!</small>
        </label>
        <label className="choice-card">
          <input type="radio" value="no" {...register("attendance")} />
          <span>Can’t make it this time</span>
          <small>Sending love and sweetest wishes from afar.</small>
        </label>
        {errors.attendance && <span className="field-error">{errors.attendance.message}</span>}
      </fieldset>

      <div className="field">
        <label htmlFor="rsvp-contact">WhatsApp or email <small>optional</small></label>
        <input id="rsvp-contact" autoComplete="tel" placeholder="For event updates" {...register("contact")} />
        {errors.contact && <span className="field-error">{errors.contact.message}</span>}
      </div>
      <div className="field">
        <label htmlFor="rsvp-diet">Dietary restrictions <small>optional</small></label>
        <input id="rsvp-diet" placeholder="e.g. vegetarian, nut allergy" {...register("dietary")} />
        {errors.dietary && <span className="field-error">{errors.dietary.message}</span>}
      </div>
      <div className="field field-wide">
        <label htmlFor="rsvp-message">A sweet note for Shaula <small>optional</small></label>
        <textarea id="rsvp-message" rows={3} placeholder="A little blessing or excitement…" {...register("message")} />
        {errors.message && <span className="field-error">{errors.message.message}</span>}
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>
      <div className="form-submit field-wide">
        <p>Private RSVP · saved locally on this device.</p>
        <button type="submit" className="pink-button" disabled={isSubmitting}>
          {isSubmitting ? "Adding you to the pink list…" : "Seal my RSVP"}
          <Send size={16} aria-hidden="true" />
        </button>
      </div>
      <output className="rsvp-success" aria-live="polite">
        {saved ? <><span>✓</span><strong>You&apos;re on the pink list!</strong><small>See you on Tuesday, 15 September 2026 at Krema de Bruge.</small></> : null}
      </output>
    </form>
  );
}
