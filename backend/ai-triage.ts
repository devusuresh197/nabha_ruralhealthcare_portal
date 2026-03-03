import type { RiskLevel } from "@/lib/types"
import type { CaseInputForRisk } from "@/backend/data-store"

interface AITriageResponse {
  riskLevel: RiskLevel
  reason: string
}

const SYSTEM_PROMPT = `
You are a rural clinical triage assistant.
Task: classify case priority into exactly one label: Low, Medium, High.
This is queue prioritization support only, not a diagnosis.
Use vitals, age, and symptoms carefully.
When uncertain, choose the safer higher-priority level.
Return strict JSON only.
`.trim()

function parseRiskLevel(value: unknown): RiskLevel | null {
  if (value === "Low" || value === "Medium" || value === "High") return value
  return null
}

export async function assessCaseRiskWithAI(
  input: CaseInputForRisk
): Promise<AITriageResponse | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash"

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: JSON.stringify({
                patientAge: input.patientAge,
                patientGender: input.patientGender,
                symptoms: input.symptoms,
                vitals: input.vitals,
                additionalNotes: input.additionalNotes || "",
              }),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            riskLevel: { type: "STRING", enum: ["Low", "Medium", "High"] },
            reason: { type: "STRING" },
          },
          required: ["riskLevel", "reason"],
          propertyOrdering: ["riskLevel", "reason"],
        },
      },
    }),
  }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini triage failed: ${response.status} ${errorText}`)
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>
      }
    }>
  }
  const text = payload.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim()
  if (!text) {
    throw new Error("Gemini triage returned empty output")
  }

  const parsed = JSON.parse(text) as {
    riskLevel?: unknown
    reason?: unknown
  }

  const riskLevel = parseRiskLevel(parsed.riskLevel)
  if (!riskLevel) {
    throw new Error("Gemini triage returned invalid risk level")
  }

  return {
    riskLevel,
    reason: typeof parsed.reason === "string" ? parsed.reason : "",
  }
}
