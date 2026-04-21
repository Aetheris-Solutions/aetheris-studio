const items = [
  "OpenAI GPT-5",
  "Anthropic Claude 4.6",
  "WhatsApp Business API",
  "n8n",
  "Make",
  "Zapier",
  "Supabase",
  "Pinecone",
  "HubSpot",
  "Salesforce",
  "Shopify",
  "Stripe",
  "Cal.com",
  "Telegram Bot API",
  "Twilio",
  "Google Workspace",
  "Microsoft 365",
];

export default function TrustBar() {
  // duplicate the list once for a seamless loop
  const loop = [...items, ...items];

  return (
    <section
      aria-label="Stack tecnologico"
      className="relative border-y border-white/8 py-8 overflow-hidden"
    >
      <div className="container-narrow flex items-center gap-8">
        <span className="eyebrow shrink-0 hidden md:inline">
          Tech&nbsp;Stack
        </span>
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
          <div className="marquee-track gap-12">
            {loop.map((it, i) => (
              <span
                key={`${it}-${i}`}
                className="font-mono text-[13px] tracking-wide text-ink-fog/85 whitespace-nowrap flex items-center gap-12"
              >
                {it}
                <span className="w-1 h-1 rounded-full bg-ink-gold/60" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
