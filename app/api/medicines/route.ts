import { NextResponse } from "next/server"
import {
  addMedicineInDb,
  getMedicinesByPharmacyFromDb,
  getMedicinesFromDb,
  searchMedicinesFromDb,
} from "@/backend/medicine-prebooking-db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
  const pharmacyId = searchParams.get("pharmacyId")

  if (query !== null) {
    return NextResponse.json(await searchMedicinesFromDb(query))
  }

  if (pharmacyId) {
    return NextResponse.json(await getMedicinesByPharmacyFromDb(pharmacyId))
  }

  return NextResponse.json(await getMedicinesFromDb())
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.name || body.quantity === undefined || !body.pharmacyId || !body.actorId) {
    return NextResponse.json(
      { error: "name, quantity, pharmacyId, and actorId are required" },
      { status: 400 }
    )
  }

  try {
    const medicine = await addMedicineInDb({
      name: String(body.name),
      quantity: Number(body.quantity),
      pharmacyId: String(body.pharmacyId),
      actorId: String(body.actorId),
    })
    return NextResponse.json(medicine, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to add medicine"
    const status =
      message.includes("Only pharmacist") || message.includes("pharmacy")
        ? 403
        : 500
    return NextResponse.json({ error: message }, { status })
  }
}
