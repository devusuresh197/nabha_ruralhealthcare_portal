import { NextResponse } from "next/server"
import { updateCaseReview } from "@/lib/data-store"

interface RouteParams {
  params: Promise<{ caseId: string }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { caseId } = await params
  const body = await request.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const requiredFields = [
    "doctorId",
    "doctorName",
    "decision",
    "medicalAdvice",
    "prescription",
  ]

  const missing = requiredFields.filter((field) => body[field] === undefined)
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    )
  }

  const updatedCase = updateCaseReview(caseId, {
    doctorId: body.doctorId,
    doctorName: body.doctorName,
    doctorRiskOverride: body.doctorRiskOverride,
    overrideReason: body.overrideReason,
    decision: body.decision,
    medicalAdvice: body.medicalAdvice,
    prescription: body.prescription,
  })

  if (!updatedCase) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 })
  }

  return NextResponse.json(updatedCase)
}
