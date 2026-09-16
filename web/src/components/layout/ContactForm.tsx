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
  const [sent, setSent] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    // TODO: contact backend (e.g. route handler → email provider / helpdesk). UI only for now.
    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="flex items-start gap-4">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink">
          <CheckIcon />
        </span>
        <div>
          <p className="text-lg font-semibold">Message ready to send</p>
          <p className="mt-1 text-mute">The contact backend isn&apos;t connected yet — this is a design preview.</p>
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
        <select id="c-topic" name="topic" defaultValue={initialTopic} className="select !h-[52px] w-full !rounded-[14px]">
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
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
      <div className="flex items-center justify-between gap-4 sm:col-span-2">
        <p className="text-xs text-mute">We reply within 1–2 business days.</p>
        <button type="submit" className="btn btn-primary">
          Send message
        </button>
      </div>
    </form>
  );
}
