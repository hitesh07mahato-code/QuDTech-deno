import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";

const Input = z.object({
  disease: z.string(),
  probability: z.number(),
  band: z.string(),
  markers: z.array(
    z.object({
      label: z.string(),
      value: z.number(),
      unit: z.string(),
      impact: z.number(),
    }),
  ),
});

export type ClinicalNarrative = {
  summary: string;
  drivers: string[];
  actions: string[];
};

export const explainRisk = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<ClinicalNarrative> => {
    const key = process.env["AI_API_KEY"] || process.env["AI_GATEWAY_API_KEY"] || process.env["OPENAI_API_KEY"];
    if (!key) throw new Error("AI is not configured for this project.");

    const { createAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createAiGatewayProvider(key);

    const markerLines = data.markers
      .map(
        (m) =>
          `- ${m.label}: ${m.value}${m.unit ? " " + m.unit : ""} (circuit contribution ${m.impact.toFixed(2)})`,
      )
      .join("\n");

    const prompt = `A simulated hybrid quantum-classical classifier screened a patient for ${data.disease}.
Readout probability: ${(data.probability * 100).toFixed(1)}% (${data.band} risk band).
Marker panel and per-qubit contributions:
${markerLines}

Write a short clinical-style interpretation for a demonstration platform.
Return STRICT JSON only, no markdown fences, with this exact shape:
{"summary": string, "drivers": string[], "actions": string[]}
- summary: 2 sentences, plain clinical language, mentions the risk band.
- drivers: 3 short bullet strings naming the markers that moved the readout most and why.
- actions: 3 short bullet strings of sensible next screening/lifestyle steps.
Never claim a diagnosis. This is a research demonstration, not medical advice.`;

    const result = streamText({
      model: gateway("google/gemini-3.7-flash"),
      prompt,
    });

    const text = await result.text;
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();

    try {
      const parsed = JSON.parse(cleaned) as ClinicalNarrative;
      return {
        summary: String(parsed.summary ?? ""),
        drivers: (parsed.drivers ?? []).slice(0, 4).map(String),
        actions: (parsed.actions ?? []).slice(0, 4).map(String),
      };
    } catch {
      return { summary: cleaned.slice(0, 600), drivers: [], actions: [] };
    }
  });
