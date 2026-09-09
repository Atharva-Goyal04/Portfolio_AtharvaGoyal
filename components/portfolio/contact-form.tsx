"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FORMSPREE_ENDPOINT } from "@/lib/utils";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputCls =
    "w-full rounded-xl border border-line bg-canvas px-4 py-3 font-body outline-none transition-colors focus:border-brand";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div>
        <label htmlFor="name" className="eyebrow mb-2 block text-brand">
          Name
        </label>
        <input id="name" name="name" type="text" required placeholder="Your name" className={inputCls} />
      </div>
      <div>
        <label htmlFor="email" className="eyebrow mb-2 block text-brand">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="your@email.com"
          className={inputCls}
        />
      </div>
      <div>
        <label htmlFor="inquiry" className="eyebrow mb-2 block text-brand">
          Inquiry Type
        </label>
        <select
          id="inquiry"
          name="inquiry"
          required
          className={inputCls}
        >
          <option value="" disabled>
            Select an option
          </option>
          <option value="Photoshoot — Portraits">
            Photoshoot — Portraits
          </option>
          <option value="Photoshoot — Graduation">
            Photoshoot — Graduation
          </option>
          <option value="Photoshoot — Event">
            Photoshoot — Event
          </option>
          <option value="General Question">
            General Question
          </option>
          <option value="Collaboration / Business">
            Collaboration / Business
          </option>
          <option value="Other">
            Other
          </option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="eyebrow mb-2 block text-brand">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell me about your project or session…"
          className={`${inputCls} resize-none`}
        />
      </div>

      {status === "success" && (
        <p className="flex items-center gap-2 rounded-xl bg-brand/10 px-4 py-3 font-mono text-xs uppercase tracking-wider text-brand">
          <CheckCircle2 className="h-4 w-4" /> Message sent — I&apos;ll get back to you soon.
        </p>
      )}
      {status === "error" && (
        <p className="rounded-xl bg-red-500/10 px-4 py-3 font-mono text-xs uppercase tracking-wider text-red-500">
          Something went wrong. Please try again.
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={status === "submitting" || status === "success"}
        className="w-full"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> Send Message
          </>
        )}
      </Button>
    </form>
  );
}