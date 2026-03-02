import { NextResponse } from "next/server"
import {
  createPrebookingInDb,
  getPrebookingsByHealthWorkerFromDb,
  getPrebookingsByPharmacyFromDb,
  getPrebookingsFromDb,
} from "@/backend/medicine-prebooking-db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const healthWorkerId = searchParams.get("healthWorkerId")
  const pharmacyId = searchParams.get("pharmacyId")

  if (healthWorkerId) {
    return NextResponse.json(await getPrebookingsByHealthWorkerFromDb(healthWorkerId))
  }

  if (pharmacyId) {
    return NextResponse.json(await getPrebookingsByPharmacyFromDb(pharmacyId))
  }

  return NextResponse.json(await getPrebookingsFromDb())
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
    "actorId",
  ]

  const missing = requiredFields.filter((field) => body[field] === undefined)
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    )
  }

  try {
    const prebooking = await createPrebookingInDb({
      medicineId: String(body.medicineId),
      medicineName: String(body.medicineName),
      requestedQuantity: Number(body.requestedQuantity),
      patientName: String(body.patientName),
      patientPhone: String(body.patientPhone),
      healthWorkerId: String(body.healthWorkerId),
      healthWorkerName: String(body.healthWorkerName),
      pharmacyId: String(body.pharmacyId),
      pharmacyName: String(body.pharmacyName),
      actorId: String(body.actorId),
    })

    return NextResponse.json(prebooking, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create prebooking"
    const status =
      message.includes("Only health worker") || message.includes("mismatch") ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
