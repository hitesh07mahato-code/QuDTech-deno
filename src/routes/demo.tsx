import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Loader2, RotateCcw, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

import { CircuitView } from "@/components/circuit-view";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { explainRisk, type ClinicalNarrative } from "@/lib/analysis.functions";
import {
  BAND_COPY,
  DISEASE_MODELS,
  getModel,
  runHybridInference,
  type DiseaseId,
} from "@/lib/quantum";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Live Screening Demo — Hybrid Quantum Risk Engine | QubitDx" },
      {
        name: "description",
        content:
          "Adjust a biomarker panel and watch a simulated variational quantum classifier produce a risk band, per-qubit attributions and an AI-drafted clinical interpretation.",
      },
      { property: "og:title", content: "Live Screening Demo | QubitDx" },
      {
        property: "og:description",
        content:
          "Interactive hybrid quantum-classical risk screening across diabetes, cardiovascular and breast cancer panels.",
      },
    ],
  }),
  component: Demo,
});

const BAND_COLOR: Record<string, string> = {
  low: "var(--color-signal)",
  moderate: "var(--color-accent)",
  elevated: "var(--color-caution)",
  high: "var(--color-alert)",
};

function Demo() {
  const [diseaseId, setDiseaseId] = useState<DiseaseId>("diabetes");
  const model = getModel(diseaseId);

  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(model.fields.map((f) => [f.key, f.default])),
  );
  const [narrative, setNarrative] = useState<ClinicalNarrative | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const explain = useServerFn(explainRisk);

  const result = useMemo(() => runHybridInference(model, values), [model, values]);
  const band = BAND_COPY[result.band];
  const pct = Math.round(result.probability * 100);

  function switchDisease(id: DiseaseId) {
    const next = getModel(id);
    setDiseaseId(id);
    setValues(Object.fromEntries(next.fields.map((f) => [f.key, f.default])));
    setNarrative(null);
    setError(null);
  }

  function reset() {
    setValues(Object.fromEntries(model.fields.map((f) => [f.key, f.default])));
    setNarrative(null);
    setError(null);
  }

  async function interpret() {
    setLoading(true);
    setError(null);
    try {
      const res = await explain({
        data: {
          disease: model.name,
          probability: result.probability,
          band: result.band,
          markers: result.contributions,
        },
      });
      setNarrative(res);
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : "The interpretation service is unavailable right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mesh-bg">
        <div className="mx-auto max-w-6xl px-5 py-12 lg:py-16">
          <p className="eyebrow">Live demo</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Hybrid screening console</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Move the sliders to build a biomarker panel. The circuit re-runs instantly; the AI
            interpretation is generated on demand.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {DISEASE_MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => switchDisease(m.id)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                  m.id === diseaseId
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            {/* Inputs */}
            <section className="surface-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Biomarker panel</h2>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" /> Reset
                </button>
              </div>

              <div className="mt-6 space-y-6">
                {model.fields.map((f) => {
                  const v = values[f.key] ?? f.default;
                  return (
                    <div key={f.key}>
                      <div className="flex items-baseline justify-between">
                        <label htmlFor={f.key} className="text-sm font-medium">
                          {f.label}
                        </label>
                        <span className="font-mono text-xs text-foreground">
                          {v}
                          {f.unit ? ` ${f.unit}` : ""}
                        </span>
                      </div>
                      <input
                        id={f.key}
                        type="range"
                        min={f.min}
                        max={f.max}
                        step={f.step}
                        value={v}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [f.key]: Number(e.target.value) }))
                        }
                        className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
                      />
                      <p className="mt-1.5 font-mono text-[0.65rem] text-muted-foreground">
                        reference ≈ {f.ref}
                        {f.unit ? ` ${f.unit}` : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Output */}
            <section className="space-y-6">
              <div className="surface-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Readout</p>
                    <h2 className="mt-1 text-lg font-semibold">{model.name}</h2>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: `color-mix(in oklab, ${BAND_COLOR[result.band]} 18%, transparent)`,
                      color: BAND_COLOR[result.band],
                    }}
                  >
                    {band.label}
                  </span>
                </div>

                <div className="mt-6 flex items-end gap-3">
                  <span className="font-display text-5xl font-semibold tabular-nums">{pct}%</span>
                  <span className="pb-2 text-sm text-muted-foreground">
                    modelled risk probability
                  </span>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: BAND_COLOR[result.band] }}
                  />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{band.note}</p>

                <div className="mt-6 border-t border-border pt-5">
                  <p className="eyebrow">Top marker attributions</p>
                  <ul className="mt-3 space-y-2.5">
                    {result.contributions.slice(0, 4).map((c) => (
                      <li key={c.label} className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex items-center gap-2">
                          {c.impact >= 0 ? (
                            <TrendingUp className="size-3.5 text-destructive" />
                          ) : (
                            <TrendingDown className="size-3.5 text-primary" />
                          )}
                          {c.label}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {c.impact >= 0 ? "+" : ""}
                          {c.impact.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <CircuitView result={result} layers={model.layers} running={loading} />

              <div className="surface-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="eyebrow">AI clinical interpretation</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Turns the readout into a clinician-style narrative.
                    </p>
                  </div>
                  <button
                    onClick={interpret}
                    disabled={loading}
                    className="quantum-gradient inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    {loading ? "Interpreting…" : "Generate interpretation"}
                  </button>
                </div>

                {error && (
                  <p className="mt-4 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    {error}
                  </p>
                )}

                {narrative && (
                  <div className="mt-5 space-y-5 border-t border-border pt-5">
                    <p className="text-sm leading-relaxed">{narrative.summary}</p>
                    {narrative.drivers.length > 0 && (
                      <div>
                        <p className="eyebrow">Signal drivers</p>
                        <ul className="mt-2 space-y-1.5">
                          {narrative.drivers.map((d, i) => (
                            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                              <span className="text-primary">•</span>
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {narrative.actions.length > 0 && (
                      <div>
                        <p className="eyebrow">Suggested next steps</p>
                        <ul className="mt-2 space-y-1.5">
                          {narrative.actions.map((a, i) => (
                            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                              <span className="text-accent">•</span>
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                Demonstration only. Outputs come from a simulated circuit with illustrative weights
                and must not be used for diagnosis or treatment decisions.
              </p>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
