import { NextResponse } from "next/server"
import { updateMedicineStockInDb } from "@/backend/medicine-prebooking-db"

interface RouteParams {
  params: Promise<{ medicineId: string }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { medicineId } = await params
  const body = await request.json().catch(() => null)

  if (!body || body.quantity === undefined || !body.actorId) {
    return NextResponse.json(
      { error: "quantity and actorId are required" },
      { status: 400 }
    )
  }

  try {
    const medicine = await updateMedicineStockInDb({
      medicineId,
      quantity: Number(body.quantity),
      actorId: String(body.actorId),
    })
    if (!medicine) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
    }

    return NextResponse.json(medicine)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update medicine"
    const status =
      message.includes("Only pharmacist") || message.includes("pharmacy")
        ? 403
        : 500
    return NextResponse.json({ error: message }, { status })
  }
}
