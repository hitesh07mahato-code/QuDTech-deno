import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CircuitBoard, Cpu, Gauge, GitBranch, Lock, Sigma } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const Route = createFileRoute("/technology")({
  head: () => ({
    meta: [
      { title: "Technology — Variational Circuits & Hybrid Inference | QubitDx" },
      {
        name: "description",
        content:
          "How QubitDx encodes biomarkers as rotation angles, entangles them through a CZ-ring ansatz, and converts Pauli-Z expectations into calibrated risk probabilities.",
      },
      { property: "og:title", content: "Technology — Hybrid Quantum Inference | QubitDx" },
      {
        property: "og:description",
        content:
          "Angle encoding, CZ-ring ansatz, Pauli-Z readout and AI-drafted clinical narratives, explained.",
      },
    ],
  }),
  component: Technology,
});

function Technology() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="mesh-bg border-b border-border">
          <div className="mx-auto max-w-3xl px-5 py-20 text-center">
            <p className="eyebrow">Architecture</p>
            <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
              A quantum feature map wrapped in classical rigour
            </h1>
            <p className="mt-5 text-muted-foreground">
              QubitDx is a hybrid pipeline: classical layers handle normalisation and calibration,
              while a parameterised quantum circuit provides a high-dimensional feature space that
              captures interactions between markers.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-20">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                icon: Sigma,
                title: "Angle encoding",
                body: "Every biomarker is z-scored against its cohort reference and mapped to an Ry rotation on a dedicated qubit, bounded to ±π/2 so the encoding stays numerically stable.",
                code: "θᵢ = clip((xᵢ − refᵢ) / (rangeᵢ/2), −π/2, π/2)",
              },
              {
                icon: CircuitBoard,
                title: "CZ-ring ansatz",
                body: "Layers of parameterised rotations alternate with a ring of controlled-Z gates, so each qubit's amplitude is modulated by its neighbour — the source of the model's interaction sensitivity.",
                code: "|ψ⟩ = ∏ₗ U(θ,wₗ) · CZ-ring |0⟩⊗ⁿ",
              },
              {
                icon: Gauge,
                title: "Pauli-Z readout",
                body: "Expectation values across the register are summed with a learned bias and squashed through a logistic link to produce a calibrated risk probability with an explicit band.",
                code: "p = σ( b + Σᵢ 0.9·⟨Z⟩ᵢ )",
              },
              {
                icon: GitBranch,
                title: "Attribution",
                body: "Per-qubit contributions are ranked by magnitude, giving a transparent view of which markers moved the readout and in which direction.",
                code: "impactᵢ = ⟨Z⟩ᵢ · wᵢ",
              },
              {
                icon: Cpu,
                title: "Simulated backend",
                body: "This demonstration runs a deterministic statevector-style simulation in the browser — identical inputs always produce identical outputs, which makes the behaviour easy to inspect.",
                code: "backend = statevector-sim · shots = 8192",
              },
              {
                icon: Lock,
                title: "Narrative layer",
                body: "The readout and its attributions are sent server-side to an integrated AI engine, which drafts a clinician-style summary. No patient data is stored anywhere.",
                code: "readout → LLM → {summary, drivers, actions}",
              },
            ].map((c) => (
              <article key={c.title} className="surface-card p-6">
                <c.icon className="size-5 text-primary" />
                <h2 className="mt-4 text-lg font-semibold">{c.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                <pre className="mt-4 overflow-x-auto rounded-lg bg-secondary px-3 py-2 font-mono text-xs text-secondary-foreground">
                  {c.code}
                </pre>
              </article>
            ))}
          </div>

          <div className="surface-card mt-10 border-caution/40 bg-caution/8 p-6">
            <h2 className="text-base font-semibold">Scientific honesty</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              No quantum hardware is involved, and the model weights are illustrative rather than
              trained on clinical cohorts. The platform demonstrates the shape of a hybrid quantum
              machine learning workflow — encoding, entanglement, readout, attribution and
              interpretation — not validated diagnostic performance.
            </p>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/demo"
              className="quantum-gradient inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
            >
              Try it on a live panel <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
