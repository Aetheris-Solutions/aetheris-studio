"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContact, type ContactState } from "@/app/actions/contact";

const INITIAL: ContactState = { status: "idle", message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary justify-center disabled:opacity-60 disabled:cursor-wait"
    >
      {pending ? (
        <>
          <span
            aria-hidden
            className="inline-block w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"
          />
          Invio in corso…
        </>
      ) : (
        <>
          Prenota la call
          <span className="arrow" aria-hidden>
            →
          </span>
        </>
      )}
    </button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useActionState(submitContact, INITIAL);

  if (state.status === "success") {
    return (
      <div className="surface p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <span className="font-mono text-[11px] text-ink-mute tracking-widest">
            ~/aetheris/contact.form
          </span>
          <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
            200 OK
          </span>
        </div>

        <div className="py-6">
          <div
            aria-hidden
            className="w-12 h-12 rounded-full border border-ink-gold/40 flex items-center justify-center mb-6 text-ink-gold text-2xl"
          >
            ✓
          </div>
          <h3 className="display text-3xl md:text-4xl text-ink-paper mb-4">
            Richiesta ricevuta.
          </h3>
          <p className="text-ink-paper/80 text-[15.5px] leading-relaxed max-w-md">
            {state.message}
          </p>
          <p className="fine mt-6">
            Nel frattempo, dai un&apos;occhiata ai nostri{" "}
            <a
              href="#cases"
              className="text-ink-paper underline underline-offset-4 decoration-ink-gold/60 hover:decoration-ink-gold"
            >
              case study
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="surface p-6 md:p-8" noValidate>
      <div className="flex items-center justify-between mb-6">
        <span className="font-mono text-[11px] text-ink-mute tracking-widest">
          ~/aetheris/contact.form
        </span>
        <span className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-white/15" />
          <span className="w-2 h-2 rounded-full bg-white/15" />
          <span className="w-2 h-2 rounded-full bg-white/15" />
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2">
          <span className="font-mono text-[10.5px] text-ink-mute tracking-widest">
            NOME *
          </span>
          <input
            name="name"
            placeholder="Mario Rossi"
            required
            autoComplete="name"
            className="input"
            aria-invalid={!!state.fieldErrors?.name || undefined}
          />
          {state.fieldErrors?.name && (
            <span className="text-[12px] text-red-400">
              {state.fieldErrors.name}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-mono text-[10.5px] text-ink-mute tracking-widest">
            EMAIL *
          </span>
          <input
            name="email"
            type="email"
            placeholder="mario@azienda.it"
            required
            autoComplete="email"
            className="input"
            aria-invalid={!!state.fieldErrors?.email || undefined}
          />
          {state.fieldErrors?.email && (
            <span className="text-[12px] text-red-400">
              {state.fieldErrors.email}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="font-mono text-[10.5px] text-ink-mute tracking-widest">
            AZIENDA
          </span>
          <input
            name="company"
            placeholder="Nome azienda · settore"
            autoComplete="organization"
            className="input"
          />
        </label>

        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="font-mono text-[10.5px] text-ink-mute tracking-widest">
            AGENTE D&apos;INTERESSE
          </span>
          <select name="agent" className="input" defaultValue="">
            <option value="" disabled>
              Seleziona un agente…
            </option>
            <option value="hermes">Hermes — Lead Qualifier</option>
            <option value="vulcano">Vulcano — Operations Engine</option>
            <option value="minerva">Minerva — Data Analyst</option>
            <option value="custos">Custos — Customer Care</option>
            <option value="custom">Agente custom</option>
            <option value="dontknow">Non sono sicuro / consigliami</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="font-mono text-[10.5px] text-ink-mute tracking-widest">
            COSA VUOI AUTOMATIZZARE
          </span>
          <textarea
            name="message"
            rows={4}
            placeholder="Es: voglio automatizzare le risposte ai lead su WhatsApp e prenotare le call sul calendario…"
            className="input resize-none"
          />
        </label>

        {/* Honeypot — invisible to humans, bots fill it */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="absolute left-[-9999px] w-px h-px opacity-0 pointer-events-none"
          aria-hidden="true"
        />
        <input type="hidden" name="source" value="homepage" />
      </div>

      {state.status === "error" && !state.fieldErrors && (
        <div
          role="alert"
          className="mt-6 p-4 rounded-lg border border-red-500/30 bg-red-500/5 text-red-300 text-[13.5px]"
        >
          {state.message}
        </div>
      )}

      <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:justify-between">
        <p className="fine">
          Cliccando invia accetti la nostra Privacy Policy.
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
