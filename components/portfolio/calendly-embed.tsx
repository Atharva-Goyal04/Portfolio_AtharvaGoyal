import { CALENDLY_URL } from "@/lib/utils";

export default function CalendlyEmbed() {
  if (!CALENDLY_URL) return null;

  return (
    <div className="h-[720px] w-full overflow-hidden rounded-2xl border border-line bg-surface">
      <iframe
        src={`${CALENDLY_URL}?hide_gdpr_banner=1`}
        title="Book a session"
        className="h-full w-full"
        loading="lazy"
        allow="payment"
      />
    </div>
  );
}