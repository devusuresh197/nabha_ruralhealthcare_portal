import { NextResponse } from "next/server"
import {
  createCase,
  getCases,
  getCasesByHealthWorker,
  getPendingCases,
  getReviewedCases,
} from "@/lib/data-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const healthWorkerId = searchParams.get("healthWorkerId")
  const status = searchParams.get("status")

  if (healthWorkerId) {
    return NextResponse.json(getCasesByHealthWorker(healthWorkerId))
  }

  if (status === "pending") {
    return NextResponse.json(getPendingCases())
  }

  if (status === "reviewed") {
    return NextResponse.json(getReviewedCases())
  }

  return NextResponse.json(getCases())
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const requiredFields = [
    "patientName",
    "patientAge",
    "patientGender",
    "patientPhone",
    "patientVillage",
    "symptoms",
    "vitals",
    "healthWorkerId",
    "healthWorkerName",
  ]

  const missing = requiredFields.filter((field) => body[field] === undefined)
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    )
  }

  const createdCase = createCase({
    patientName: body.patientName,
    patientAge: Number(body.patientAge),
    patientGender: body.patientGender,
    patientPhone: body.patientPhone,
    patientVillage: body.patientVillage,
    symptoms: body.symptoms,
    vitals: body.vitals,
    additionalNotes: body.additionalNotes,
    healthWorkerId: body.healthWorkerId,
    healthWorkerName: body.healthWorkerName,
  })

  return NextResponse.json(createdCase, { status: 201 })
}
