"use client";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CheckIcon } from "@/components/ui/Icons";

const TOPICS = [
  { value: "general", label: "General question" },
  { value: "custom", label: "Custom beat (from €400)" },
  { value: "exclusive", label: "Exclusive rights offer" },
  { value: "content-id", label: "Content ID claim / whitelist" },
  { value: "split-sheet", label: "Send a split sheet" },
  { value: "licensing", label: "Licensing question" },
];

export function ContactForm() {
  const params = useSearchParams();
  const initialTopic = TOPICS.some((t) => t.value === params.get("topic")) ? params.get("topic")! : "general";
  const beat = params.get("beat");
  const [topic, setTopic] = useState(initialTopic);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          email: f.get("email"),
          topic: f.get("topic"),
          beat,
          offer: f.get("offer"),
          message: f.get("message"),
          website: f.get("website"),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Couldn't send that.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div role="status" className="flex items-start gap-4">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-coral text-deep">
          <CheckIcon />
        </span>
        <div>
          <p className="text-lg font-semibold">Message sent</p>
          <p className="mt-1 text-mute">
            {topic === "exclusive"
              ? "Offers usually get an answer within a day or two."
              : "I read everything — expect a reply soon."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2 grid-cols-1">
      <div className="sm:col-span-1">
        <label htmlFor="c-name" className="eyebrow mb-2 block">
          Name
        </label>
        <input id="c-name" name="name" required autoComplete="name" className="input" />
      </div>
      <div className="sm:col-span-1">
        <label htmlFor="c-email" className="eyebrow mb-2 block">
          Email
        </label>
        <input id="c-email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="c-topic" className="eyebrow mb-2 block">
          Topic
        </label>
        <select
          id="c-topic"
          name="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="select !h-[52px] w-full"
        >
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      {topic === "exclusive" && (
        <div className="sm:col-span-2">
          <label htmlFor="c-offer" className="eyebrow mb-2 block">
            Your offer (EUR)
          </label>
          <input
            id="c-offer"
            name="offer"
            type="number"
            min={100}
            step={50}
            placeholder="999"
            className="input"
          />
          <p className="mt-2 text-xs text-mute">
            Exclusives start at €999. Make an offer and I&apos;ll come back to you — earlier leases on the
            beat stay valid, and I&apos;ll tell you how many there are.
          </p>
        </div>
      )}
      <div className="sm:col-span-2">
        <label htmlFor="c-msg" className="eyebrow mb-2 block">
          Message
        </label>
        <textarea
          id="c-msg"
          name="message"
          required
          rows={6}
          defaultValue={beat ? `Beat: ${beat}\nMy offer: ` : ""}
          className="input !h-auto py-4"
          placeholder="Video link / order number / offer / project details…"
        />
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {error && (
        <p role="alert" className="text-sm text-coral sm:col-span-2">
          {error}
        </p>
      )}
      <div className="flex items-center justify-between gap-4 sm:col-span-2">
        <p className="text-xs text-mute">Replies within 1–2 business days.</p>
        <button type="submit" disabled={busy} className="btn btn-primary">
          {busy ? "Sending…" : topic === "exclusive" ? "Send offer" : "Send message"}
        </button>
      </div>
    </form>
  );
}
