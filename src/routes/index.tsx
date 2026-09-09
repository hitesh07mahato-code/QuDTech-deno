import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  HeartPulse,
  Layers,
  Microscope,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";

import heroImage from "@/assets/hero-quantum.jpg";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { DISEASE_MODELS } from "@/lib/quantum";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QuDTech — Hybrid Quantum ML for Early Disease Detection" },
      {
        name: "description",
        content:
          "QuDTech pairs variational quantum circuits with classical models to surface pre-symptomatic disease signals across metabolic, cardiac and oncology panels. Smart India Hackathon 2026 — SIH26139.",
      },
      { property: "og:title", content: "QuDTech — Hybrid Quantum ML for Early Disease Detection" },
      {
        property: "og:description",
        content:
          "Explore a hybrid quantum-classical screening engine with a live, interactive risk demo.",
      },
    ],
  }),
  component: Home,
});

const ICONS = {
  diabetes: Activity,
  cardio: HeartPulse,
  oncology: Microscope,
} as const;

function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="mesh-bg relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="size-3.5" /> Smart India Hackathon 2026 · PS SIH26139
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
                Detect disease <span className="text-quantum">before symptoms</span> appear.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
                QuDTech encodes routine biomarker panels into variational quantum circuits and
                fuses the readout with classical baselines — XGBoost, Random Forest, SVM — finding
                the faint, entangled correlations that flat statistical screening misses.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/demo"
                  className="quantum-gradient inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
                >
                  Run a live screening <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/technology"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
                >
                  How the circuit works
                </Link>
              </div>

              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
                {[
                  ["6", "qubit ansatz"],
                  ["3", "cohort models"],
                  ["8192", "shots / inference"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <dt className="font-display text-2xl font-semibold text-foreground">{v}</dt>
                    <dd className="mt-1 text-xs text-muted-foreground">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-primary/8 blur-3xl" />
              <img
                src={heroImage}
                alt="Quantum circuit lattice interwoven with a human anatomical silhouette and biomarker data ribbons"
                width={1600}
                height={1104}
                className="relative rounded-2xl border border-border shadow-lift"
              />
            </div>
          </div>
        </section>

        {/* Cohorts */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <p className="eyebrow">Screening cohorts</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Three panels, one hybrid engine
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Each cohort has its own encoding map and ansatz depth, tuned on synthetic longitudinal
            data so the demo behaves like a real screening pipeline.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {DISEASE_MODELS.map((m) => {
              const Icon = ICONS[m.id];
              return (
                <article key={m.id} className="surface-card p-6 transition-shadow hover:shadow-lift">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <p className="eyebrow mt-5">{m.short}</p>
                  <h3 className="mt-1 text-lg font-semibold">{m.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.blurb}</p>
                  <p className="mt-5 font-mono text-xs text-muted-foreground">
                    {m.qubits} qubits · {m.layers} layers · {m.fields.length} markers
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Pipeline */}
        <section className="border-y border-border bg-card/50">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <p className="eyebrow">Pipeline</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Classical pre-processing, quantum feature space, clinical narrative
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-4">
              {[
                {
                  icon: Layers,
                  title: "Normalise",
                  body: "Markers are standardised against cohort reference ranges and clipped to stable rotation bounds.",
                },
                {
                  icon: Waves,
                  title: "Encode",
                  body: "Each feature becomes an Ry rotation angle on its own qubit — an angle-encoded feature map.",
                },
                {
                  icon: BrainCircuit,
                  title: "Entangle",
                  body: "A CZ-ring ansatz couples neighbouring markers so joint effects, not just single values, shape the readout.",
                },
                {
                  icon: ShieldCheck,
                  title: "Interpret",
                  body: "The Pauli-Z expectation maps to a risk probability, then AI drafts a clinician-readable narrative.",
                },
              ].map((s, i) => (
                <div key={s.title} className="surface-card p-6">
                  <span className="font-mono text-xs text-primary">0{i + 1}</span>
                  <s.icon className="mt-4 size-5 text-primary" />
                  <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="quantum-gradient relative overflow-hidden rounded-2xl px-8 py-14 text-center shadow-glow">
            <h2 className="text-3xl font-semibold text-primary-foreground sm:text-4xl">
              See the circuit run on your own numbers
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-primary-foreground/85">
              Adjust a biomarker panel and watch the qubit expectation values, risk band and
              AI-generated interpretation update in real time.
            </p>
            <Link
              to="/demo"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-lift transition-transform hover:-translate-y-0.5"
            >
              Open the live demo <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
