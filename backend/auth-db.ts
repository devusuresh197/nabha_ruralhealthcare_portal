import crypto from "node:crypto"
import { MongoClient, type Collection } from "mongodb"
import type { User, UserRole } from "@/lib/types"

interface UserDocument {
  id: string
  name: string
  email: string
  passwordHash: string
  role: UserRole
  phone: string | null
  pharmacyId: string | null
  pharmacyName: string | null
  isActive: boolean
  createdAt: Date
}

const roleValues = ["health_worker", "doctor", "pharmacist"] as const

declare global {
  // eslint-disable-next-line no-var
  var __authMongoClient: MongoClient | undefined
  // eslint-disable-next-line no-var
  var __authMongoInitPromise: Promise<void> | undefined
}

function getMongoUri() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("MONGODB_URI is required for MongoDB auth")
  }
  return uri
}

function getDbName() {
  return process.env.MONGODB_DB_NAME || "rural_health_portal"
}

async function getMongoClient() {
  if (global.__authMongoClient) return global.__authMongoClient
  const client = new MongoClient(getMongoUri())
  await client.connect()
  global.__authMongoClient = client
  return client
}

async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const client = await getMongoClient()
  const db = client.db(getDbName())
  return db.collection<UserDocument>("users")
}

async function ensureSchema() {
  if (!global.__authMongoInitPromise) {
    global.__authMongoInitPromise = (async () => {
      const collection = await getUsersCollection()
      await collection.createIndex({ email: 1 }, { unique: true })
      await collection.createIndex({ role: 1, isActive: 1 })
      await collection.updateMany(
        { pharmacyId: { $exists: false } },
        { $set: { pharmacyId: null, pharmacyName: null } }
      )
    })()
  }
  await global.__authMongoInitPromise
}

function toPublicUser(doc: UserDocument): User {
  return {
    id: doc.id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    phone: doc.phone ?? undefined,
    pharmacyId: doc.pharmacyId ?? undefined,
    pharmacyName: doc.pharmacyName ?? undefined,
  }
}

function hashPassword(password: string, salt?: string) {
  const passwordSalt = salt ?? crypto.randomBytes(16).toString("hex")
  const hash = crypto.scryptSync(password, passwordSalt, 64).toString("hex")
  return `${passwordSalt}:${hash}`
}

function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedHash] = passwordHash.split(":")
  if (!salt || !storedHash) return false
  const incomingHash = crypto.scryptSync(password, salt, 64).toString("hex")
  const storedBuffer = Buffer.from(storedHash, "hex")
  const incomingBuffer = Buffer.from(incomingHash, "hex")
  if (storedBuffer.length !== incomingBuffer.length) return false
  return crypto.timingSafeEqual(storedBuffer, incomingBuffer)
}

export async function upsertAuthUser(input: {
  name: string
  email: string
  password: string
  role: UserRole
  phone?: string
  pharmacyId?: string
  pharmacyName?: string
  isActive?: boolean
}) {
  await ensureSchema()

  if (!roleValues.includes(input.role)) {
    throw new Error(`Invalid role: ${input.role}`)
  }

  const collection = await getUsersCollection()
  const normalizedEmail = input.email.trim().toLowerCase()
  const hashed = hashPassword(input.password)
  const existing = await collection.findOne({ email: normalizedEmail })
  const id = existing?.id ?? `usr-${crypto.randomUUID()}`

  await collection.updateOne(
    { email: normalizedEmail },
    {
      $set: {
        name: input.name.trim(),
        email: normalizedEmail,
        passwordHash: hashed,
        role: input.role,
        phone: input.phone?.trim() || null,
        pharmacyId: input.role === "pharmacist" ? input.pharmacyId?.trim() || null : null,
        pharmacyName:
          input.role === "pharmacist" ? input.pharmacyName?.trim() || null : null,
        isActive: input.isActive === false ? false : true,
      },
      $setOnInsert: {
        id,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  )

  const updated = await collection.findOne({ email: normalizedEmail })
  if (!updated) {
    throw new Error("Failed to create or update auth user")
  }
  return toPublicUser(updated)
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  await ensureSchema()
  const collection = await getUsersCollection()
  const doc = await collection.findOne({
    email: email.trim().toLowerCase(),
    isActive: true,
  })

  if (!doc) return null
  if (!verifyPassword(password, doc.passwordHash)) return null
  return toPublicUser(doc)
}

export async function getAuthUsersByRole(role?: UserRole): Promise<User[]> {
  await ensureSchema()
  const collection = await getUsersCollection()
  const query = role ? { role, isActive: true } : { isActive: true }
  const docs = await collection.find(query).sort({ name: 1 }).toArray()
  return docs.map(toPublicUser)
}

export async function getAuthUserById(userId: string): Promise<User | null> {
  await ensureSchema()
  const collection = await getUsersCollection()
  const doc = await collection.findOne({ id: userId, isActive: true })
  return doc ? toPublicUser(doc) : null
}
