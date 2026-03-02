import { NextResponse } from "next/server"
import { updateMedicineStock } from "@/lib/data-store"

interface RouteParams {
  params: Promise<{ medicineId: string }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { medicineId } = await params
  const body = await request.json().catch(() => null)

  if (!body || body.quantity === undefined) {
    return NextResponse.json({ error: "quantity is required" }, { status: 400 })
  }

  const medicine = updateMedicineStock(medicineId, Number(body.quantity))
  if (!medicine) {
    return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
  }

  return NextResponse.json(medicine)
}
