import { NextResponse } from "next/server"
import { respondToPrebookingInDb } from "@/backend/medicine-prebooking-db"

interface RouteParams {
  params: Promise<{ prebookingId: string }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { prebookingId } = await params
  const body = await request.json().catch(() => null)

  if (!body || !body.status || !body.actorId) {
    return NextResponse.json(
      { error: "status and actorId are required" },
      { status: 400 }
    )
  }

  try {
    const updated = await respondToPrebookingInDb({
      prebookingId,
      status: body.status,
      expectedAvailabilityDate: body.expectedAvailabilityDate,
      actorId: String(body.actorId),
    })

    if (!updated) {
      return NextResponse.json({ error: "Prebooking not found" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to respond to prebooking"
    const status =
      message.includes("Only pharmacist") || message.includes("pharmacy")
        ? 403
        : 500
    return NextResponse.json({ error: message }, { status })
  }
}
