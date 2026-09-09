/**
 * Simulated hybrid quantum-classical inference engine.
 *
 * This is a deterministic, fully client-safe simulation of a variational
 * quantum classifier (VQC): a classical feature-scaling layer feeds angle
 * encodings into a 6-qubit parameterised circuit with entangling CZ rings,
 * and the expectation value of the Pauli-Z measurement on the readout qubit
 * is mapped to a risk probability. It is a demonstration, not a medical device.
 */

export type DiseaseId = "diabetes" | "cardio" | "oncology";

export type FieldDef = {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  default: number;
  /** value considered "healthy" reference */
  ref: number;
  /** how strongly the marker pushes risk up (positive) or down (negative) */
  weight: number;
};

export type DiseaseModel = {
  id: DiseaseId;
  name: string;
  short: string;
  blurb: string;
  qubits: number;
  layers: number;
  fields: FieldDef[];
  /** classical bias term for the readout */
  bias: number;
};

export const DISEASE_MODELS: DiseaseModel[] = [
  {
    id: "diabetes",
    name: "Type 2 Diabetes",
    short: "Metabolic",
    blurb:
      "Angle-encoded metabolic panel evaluated on a 6-qubit variational classifier trained on synthetic longitudinal cohorts.",
    qubits: 6,
    layers: 3,
    bias: -1.89,
    fields: [
      { key: "hba1c", label: "HbA1c", unit: "%", min: 4, max: 12, step: 0.1, default: 5.6, ref: 5.2, weight: 1.5 },
      { key: "glucose", label: "Fasting glucose", unit: "mg/dL", min: 60, max: 220, step: 1, default: 95, ref: 88, weight: 1.1 },
      { key: "bmi", label: "BMI", unit: "kg/m²", min: 15, max: 50, step: 0.1, default: 25, ref: 22, weight: 0.9 },
      { key: "waist", label: "Waist circumference", unit: "cm", min: 55, max: 150, step: 1, default: 88, ref: 80, weight: 0.7 },
      { key: "trig", label: "Triglycerides", unit: "mg/dL", min: 40, max: 500, step: 1, default: 130, ref: 110, weight: 0.6 },
      { key: "age", label: "Age", unit: "yrs", min: 18, max: 95, step: 1, default: 45, ref: 35, weight: 0.5 },
    ],
  },
  {
    id: "cardio",
    name: "Cardiovascular Disease",
    short: "Cardiac",
    blurb:
      "Haemodynamic and lipid markers entangled across a CZ-ring ansatz to surface pre-symptomatic cardiac risk.",
    qubits: 6,
    layers: 4,
    bias: -2.19,
    fields: [
      { key: "sbp", label: "Systolic BP", unit: "mmHg", min: 85, max: 210, step: 1, default: 124, ref: 115, weight: 1.3 },
      { key: "ldl", label: "LDL cholesterol", unit: "mg/dL", min: 40, max: 260, step: 1, default: 118, ref: 95, weight: 1.2 },
      { key: "hdl", label: "HDL cholesterol", unit: "mg/dL", min: 20, max: 100, step: 1, default: 52, ref: 60, weight: -1.0 },
      { key: "crp", label: "hs-CRP", unit: "mg/L", min: 0, max: 15, step: 0.1, default: 1.4, ref: 0.9, weight: 0.9 },
      { key: "rhr", label: "Resting heart rate", unit: "bpm", min: 40, max: 130, step: 1, default: 70, ref: 62, weight: 0.6 },
      { key: "age", label: "Age", unit: "yrs", min: 18, max: 95, step: 1, default: 52, ref: 40, weight: 0.8 },
    ],
  },
  {
    id: "oncology",
    name: "Breast Cancer",
    short: "Oncology",
    blurb:
      "Imaging-derived morphology descriptors amplitude-scaled into a hybrid kernel for early lesion stratification.",
    qubits: 6,
    layers: 4,
    bias: -2.26,
    fields: [
      { key: "radius", label: "Mean nucleus radius", unit: "µm", min: 6, max: 30, step: 0.1, default: 13.5, ref: 11.5, weight: 1.3 },
      { key: "texture", label: "Texture (SD grey-scale)", unit: "", min: 8, max: 40, step: 0.1, default: 18.5, ref: 15, weight: 0.8 },
      { key: "concavity", label: "Concavity index", unit: "", min: 0, max: 0.45, step: 0.005, default: 0.09, ref: 0.05, weight: 1.4 },
      { key: "symmetry", label: "Symmetry index", unit: "", min: 0.1, max: 0.35, step: 0.005, default: 0.18, ref: 0.16, weight: 0.7 },
      { key: "density", label: "Mammographic density", unit: "%", min: 5, max: 90, step: 1, default: 40, ref: 28, weight: 0.9 },
      { key: "age", label: "Age", unit: "yrs", min: 18, max: 95, step: 1, default: 48, ref: 38, weight: 0.5 },
    ],
  },
];

export function getModel(id: DiseaseId): DiseaseModel {
  return DISEASE_MODELS.find((m) => m.id === id) ?? (DISEASE_MODELS[0] as DiseaseModel);
}

export type QubitState = {
  label: string;
  /** encoded rotation angle in radians */
  theta: number;
  /** ⟨Z⟩ expectation after the ansatz, in [-1, 1] */
  expectation: number;
};

export type QuantumResult = {
  probability: number; // 0..1
  band: "low" | "moderate" | "elevated" | "high";
  qubits: QubitState[];
  /** per-feature contribution to the readout, sorted by magnitude */
  contributions: { label: string; value: number; unit: string; impact: number }[];
  entanglementEntropy: number;
  circuitDepth: number;
  shots: number;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Deterministic pseudo-random weights so results are reproducible. */
function ansatzWeight(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

export function runHybridInference(
  model: DiseaseModel,
  values: Record<string, number>,
): QuantumResult {
  const qubits: QubitState[] = [];
  const contributions: QuantumResult["contributions"] = [];
  let readout = model.bias;

  model.fields.forEach((f, i) => {
    const raw = values[f.key] ?? f.default;
    // classical pre-processing: standardise against the reference range
    const span = f.max - f.min;
    const z = clamp((raw - f.ref) / (span / 2), -2.5, 2.5);
    // angle encoding
    const theta = clamp(z, -Math.PI / 2, Math.PI / 2);

    // parameterised layers with entangling ring coupling
    let amp = Math.sin(theta) * f.weight;
    for (let l = 0; l < model.layers; l++) {
      const w = ansatzWeight(i * 7 + l * 13 + model.layers);
      const neighbour = model.fields[(i + 1) % model.fields.length] as FieldDef;
      const nRaw = values[neighbour.key] ?? neighbour.default;
      const nz = clamp((nRaw - neighbour.ref) / ((neighbour.max - neighbour.min) / 2), -2.5, 2.5);
      amp += 0.12 * w * Math.sin(theta) * Math.tanh(nz); // CZ-entangled cross term
    }

    const expectation = clamp(Math.tanh(amp), -1, 1);
    readout += expectation * 0.9;

    qubits.push({ label: f.label, theta, expectation });
    contributions.push({
      label: f.label,
      value: raw,
      unit: f.unit,
      impact: expectation * f.weight,
    });
  });

  const probability = clamp(1 / (1 + Math.exp(-readout)), 0.005, 0.995);
  const band: QuantumResult["band"] =
    probability < 0.2 ? "low" : probability < 0.45 ? "moderate" : probability < 0.7 ? "elevated" : "high";

  // von-Neumann-ish entanglement proxy from the readout distribution
  const p = probability;
  const entropy = -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));

  contributions.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return {
    probability,
    band,
    qubits,
    contributions,
    entanglementEntropy: entropy,
    circuitDepth: model.layers * 3 + model.qubits,
    shots: 8192,
  };
}

export const BAND_COPY: Record<QuantumResult["band"], { label: string; note: string }> = {
  low: { label: "Low risk", note: "Markers sit within reference ranges. Routine screening cadence." },
  moderate: { label: "Moderate risk", note: "Some markers drift from reference. Consider a 6-month recheck." },
  elevated: { label: "Elevated risk", note: "Multiple markers out of range. Clinical follow-up advised." },
  high: { label: "High risk", note: "Strong multi-marker signal. Prioritise diagnostic confirmation." },
};
