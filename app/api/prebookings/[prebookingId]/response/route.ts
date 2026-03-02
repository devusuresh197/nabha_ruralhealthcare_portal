import { NextResponse } from "next/server"
import { respondToPrebooking } from "@/lib/data-store"

interface RouteParams {
  params: Promise<{ prebookingId: string }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { prebookingId } = await params
  const body = await request.json().catch(() => null)

  if (!body || !body.status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 })
  }

  const updated = respondToPrebooking(prebookingId, {
    status: body.status,
    expectedAvailabilityDate: body.expectedAvailabilityDate,
  })

  if (!updated) {
    return NextResponse.json({ error: "Prebooking not found" }, { status: 404 })
  }

  return NextResponse.json(updated)
}
