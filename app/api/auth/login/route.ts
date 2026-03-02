import { NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth-db"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body?.email || !body?.password) {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 }
    )
  }

  try {
    const user = await authenticateUser(String(body.email), String(body.password))
    return NextResponse.json(user ?? null)
  } catch (_error) {
    return NextResponse.json(
      { error: "Authentication service unavailable. Check MongoDB connection and MONGODB_URI." },
      { status: 500 }
    )
  }
}
