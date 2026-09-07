import type { Metadata } from "next";
import { ArrowUpRight, Instagram, Mail } from "lucide-react";
import SectionHeading from "@/components/shared/section-heading";
import Reveal from "@/components/shared/reveal";
import ContactForm from "@/components/portfolio/contact-form";
import { CONTACT_EMAIL, INSTAGRAM_PERSONAL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book a session with Atharva Goyal — graduations, portraits, events, or just to say hello.",
};

const contacts = [
  {
    name: "Email",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    icon: Mail,
  },
  {
    name: "Instagram",
    value: "@atharva__goyal",
    href: INSTAGRAM_PERSONAL,
    icon: Instagram,
  },
];

export default function ContactPage() {
  return (
    <section className="min-h-screen pt-28 md:pt-36">
      <div className="container-site pb-24">
        <div className="mb-16 max-w-3xl">
          <SectionHeading
            eyebrow="Contact"
            title="Let's"
            highlight="connect"
            description="Have a session in mind or just want to say hello? I'd love to hear from you."
          />
        </div>

        <div className="grid gap-16 lg:grid-cols-2">
          <Reveal className="flex flex-col gap-8">
            <p className="text-lg leading-relaxed text-muted">
              Bookings stay open for graduations, portraits, events, and editorial work across
              the Phoenix metro — I usually reply within a day.
            </p>
            <div className="flex flex-col gap-4">
              {contacts.map((c) => (
                <a
                  key={c.name}
                  href={c.href}
                  target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={c.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                  className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="eyebrow text-muted">{c.name}</p>
                    <p className="truncate font-body text-ink/80">{c.value}</p>
                  </div>
                  <ArrowUpRight className="ml-auto h-4 w-4 text-ink/40 transition-all group-hover:text-brand group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              ))}
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted/70">
              Client galleries appear here once your session ships — private, downloadable,
              and easy to share.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="rounded-2xl border border-line bg-surface p-8">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}