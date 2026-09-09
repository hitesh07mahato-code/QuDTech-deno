import type { QuantumResult } from "@/lib/quantum";

/** Schematic render of the variational circuit with live per-qubit expectation values. */
export function CircuitView({
  result,
  layers,
  running,
}: {
  result: QuantumResult;
  layers: number;
  running: boolean;
}) {
  const gates = Array.from({ length: layers });

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5">
      {running && (
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-transparent via-primary/15 to-transparent sweep-line" />
      )}
      <div className="flex items-center justify-between">
        <p className="eyebrow">Variational circuit</p>
        <p className="font-mono text-xs text-muted-foreground">
          {result.qubits.length} qubits · depth {result.circuitDepth} · {result.shots} shots
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {result.qubits.map((q, i) => (
          <div key={q.label} className="flex items-center gap-3">
            <span className="w-8 shrink-0 font-mono text-[0.7rem] text-muted-foreground">
              q{i}
            </span>
            <span className="hidden w-40 shrink-0 truncate text-xs text-muted-foreground sm:block">
              {q.label}
            </span>
            <div className="relative flex h-8 flex-1 items-center">
              <div className="absolute inset-x-0 h-px bg-border" />
              <div className="relative flex w-full items-center justify-between">
                <span className="rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[0.65rem] text-primary">
                  R<sub>y</sub>({q.theta.toFixed(2)})
                </span>
                {gates.map((_, g) => (
                  <span
                    key={g}
                    className="size-2.5 rounded-full bg-accent/70"
                    style={{ animationDelay: `${(i * 0.15 + g * 0.1).toFixed(2)}s` }}
                  />
                ))}
                <span
                  className={`size-3 rounded-full ${running ? "qubit-pulse" : ""}`}
                  style={{
                    backgroundColor:
                      q.expectation > 0 ? "var(--color-alert)" : "var(--color-signal)",
                  }}
                />
              </div>
            </div>
            <span className="w-14 shrink-0 text-right font-mono text-[0.7rem] text-foreground">
              {q.expectation >= 0 ? "+" : ""}
              {q.expectation.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs sm:grid-cols-3">
        <Stat label="⟨Z⟩ readout" value={(result.probability * 2 - 1).toFixed(3)} />
        <Stat label="Shannon entropy" value={`${result.entanglementEntropy.toFixed(3)} bits`} />
        <Stat label="Backend" value="statevector-sim" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.68rem] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-sm text-foreground">{value}</p>
    </div>
  );
}
