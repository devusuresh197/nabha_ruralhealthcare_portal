import { NextResponse } from "next/server"
import {
  addMedicine,
  getMedicines,
  getMedicinesByPharmacy,
  searchMedicines,
} from "@/lib/data-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
  const pharmacyId = searchParams.get("pharmacyId")

  if (query !== null) {
    return NextResponse.json(searchMedicines(query))
  }

  if (pharmacyId) {
    return NextResponse.json(getMedicinesByPharmacy(pharmacyId))
  }

  return NextResponse.json(getMedicines())
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.name || body.quantity === undefined || !body.pharmacyId) {
    return NextResponse.json(
      { error: "name, quantity, and pharmacyId are required" },
      { status: 400 }
    )
  }

  const medicine = addMedicine(
    String(body.name),
    Number(body.quantity),
    String(body.pharmacyId)
  )
  return NextResponse.json(medicine, { status: 201 })
}
