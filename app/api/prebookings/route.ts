import { NextResponse } from "next/server"
import {
  createPrebooking,
  getPrebookings,
  getPrebookingsByHealthWorker,
  getPrebookingsByPharmacy,
} from "@/lib/data-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const healthWorkerId = searchParams.get("healthWorkerId")
  const pharmacyId = searchParams.get("pharmacyId")

  if (healthWorkerId) {
    return NextResponse.json(getPrebookingsByHealthWorker(healthWorkerId))
  }

  if (pharmacyId) {
    return NextResponse.json(getPrebookingsByPharmacy(pharmacyId))
  }

  return NextResponse.json(getPrebookings())
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const requiredFields = [
    "medicineId",
    "medicineName",
    "requestedQuantity",
    "patientName",
    "patientPhone",
    "healthWorkerId",
    "healthWorkerName",
    "pharmacyId",
    "pharmacyName",
  ]

  const missing = requiredFields.filter((field) => body[field] === undefined)
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    )
  }

  const prebooking = createPrebooking({
    medicineId: String(body.medicineId),
    medicineName: String(body.medicineName),
    requestedQuantity: Number(body.requestedQuantity),
    patientName: String(body.patientName),
    patientPhone: String(body.patientPhone),
    healthWorkerId: String(body.healthWorkerId),
    healthWorkerName: String(body.healthWorkerName),
    pharmacyId: String(body.pharmacyId),
    pharmacyName: String(body.pharmacyName),
  })

  return NextResponse.json(prebooking, { status: 201 })
}
