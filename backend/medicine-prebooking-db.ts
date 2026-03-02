import { MongoClient, type Collection } from "mongodb"
import type { Medicine, MedicineSearchResult, PrebookingRequest, UserRole } from "@/lib/types"
import { mockMedicines, mockPharmacies, mockPrebookings } from "@/lib/mock-data"
import { getAuthUserById } from "@/backend/auth-db"

interface MedicineDocument {
  id: string
  name: string
  quantity: number
  pharmacyId: string
  pharmacyName: string
  updatedAt: Date
}

interface PrebookingDocument {
  id: string
  medicineId: string
  medicineName: string
  requestedQuantity: number
  patientName: string
  patientPhone: string
  healthWorkerId: string
  healthWorkerName: string
  pharmacyId: string
  pharmacyName: string
  status: "pending" | "confirmed" | "rejected"
  expectedAvailabilityDate?: string
  createdAt: Date
  respondedAt?: Date
}

declare global {
  // eslint-disable-next-line no-var
  var __inventoryMongoClient: MongoClient | undefined
  // eslint-disable-next-line no-var
  var __inventoryMongoInitPromise: Promise<void> | undefined
}

function getMongoUri() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("MONGODB_URI is required for medicines/prebookings")
  }
  return uri
}

function getDbName() {
  return process.env.MONGODB_DB_NAME || "rural_health_portal"
}

async function getMongoClient() {
  if (global.__inventoryMongoClient) return global.__inventoryMongoClient
  const client = new MongoClient(getMongoUri())
  await client.connect()
  global.__inventoryMongoClient = client
  return client
}

async function getCollections(): Promise<{
  medicines: Collection<MedicineDocument>
  prebookings: Collection<PrebookingDocument>
}> {
  const client = await getMongoClient()
  const db = client.db(getDbName())
  return {
    medicines: db.collection<MedicineDocument>("medicines"),
    prebookings: db.collection<PrebookingDocument>("prebookings"),
  }
}

async function ensureSchemaAndSeed() {
  if (!global.__inventoryMongoInitPromise) {
    global.__inventoryMongoInitPromise = (async () => {
      const { medicines, prebookings } = await getCollections()
      await medicines.createIndex({ id: 1 }, { unique: true })
      await medicines.createIndex({ pharmacyId: 1, name: 1 })
      await prebookings.createIndex({ id: 1 }, { unique: true })
      await prebookings.createIndex({ pharmacyId: 1, status: 1, createdAt: -1 })
      await prebookings.createIndex({ healthWorkerId: 1, createdAt: -1 })

      const medicineCount = await medicines.countDocuments()
      if (medicineCount === 0) {
        await medicines.insertMany(
          mockMedicines.map((m) => ({
            ...m,
            updatedAt: new Date(m.updatedAt),
          }))
        )
      }

      const prebookingCount = await prebookings.countDocuments()
      if (prebookingCount === 0) {
        await prebookings.insertMany(
          mockPrebookings.map((p) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            respondedAt: p.respondedAt ? new Date(p.respondedAt) : undefined,
          }))
        )
      }
    })()
  }

  await global.__inventoryMongoInitPromise
}

async function assertRole(userId: string, requiredRole: UserRole) {
  const user = await getAuthUserById(userId)
  if (!user || user.role !== requiredRole) {
    throw new Error(`Only ${requiredRole.replace("_", " ")} can perform this action`)
  }
  return user
}

function medicineToApi(doc: MedicineDocument): Medicine {
  return {
    id: doc.id,
    name: doc.name,
    quantity: doc.quantity,
    pharmacyId: doc.pharmacyId,
    pharmacyName: doc.pharmacyName,
    updatedAt: doc.updatedAt.toISOString(),
  }
}

function prebookingToApi(doc: PrebookingDocument): PrebookingRequest {
  return {
    id: doc.id,
    medicineId: doc.medicineId,
    medicineName: doc.medicineName,
    requestedQuantity: doc.requestedQuantity,
    patientName: doc.patientName,
    patientPhone: doc.patientPhone,
    healthWorkerId: doc.healthWorkerId,
    healthWorkerName: doc.healthWorkerName,
    pharmacyId: doc.pharmacyId,
    pharmacyName: doc.pharmacyName,
    status: doc.status,
    expectedAvailabilityDate: doc.expectedAvailabilityDate,
    createdAt: doc.createdAt.toISOString(),
    respondedAt: doc.respondedAt?.toISOString(),
  }
}

export async function getMedicinesFromDb(): Promise<Medicine[]> {
  await ensureSchemaAndSeed()
  const { medicines } = await getCollections()
  const docs = await medicines.find({}).sort({ updatedAt: -1 }).toArray()
  return docs.map(medicineToApi)
}

export async function getMedicinesByPharmacyFromDb(pharmacyId: string): Promise<Medicine[]> {
  await ensureSchemaAndSeed()
  const { medicines } = await getCollections()
  const docs = await medicines.find({ pharmacyId }).sort({ updatedAt: -1 }).toArray()
  return docs.map(medicineToApi)
}

export async function searchMedicinesFromDb(query: string): Promise<MedicineSearchResult[]> {
  await ensureSchemaAndSeed()
  if (!query.trim()) return []

  const { medicines } = await getCollections()
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const docs = await medicines
    .find({ name: { $regex: escaped, $options: "i" } })
    .sort({ updatedAt: -1 })
    .toArray()

  return docs.map((doc) => {
    const pharmacy = mockPharmacies.find((p) => p.id === doc.pharmacyId)
    return {
      pharmacyId: doc.pharmacyId,
      pharmacyName: doc.pharmacyName,
      pharmacyAddress: pharmacy?.address || "",
      medicineId: doc.id,
      medicineName: doc.name,
      available: doc.quantity > 0,
      quantity: doc.quantity,
    }
  })
}

export async function addMedicineInDb(input: {
  name: string
  quantity: number
  pharmacyId: string
  actorId: string
}): Promise<Medicine> {
  await ensureSchemaAndSeed()
  const actor = await assertRole(input.actorId, "pharmacist")
  if (!actor.pharmacyId) {
    throw new Error("Pharmacist is not assigned to a pharmacy")
  }
  if (actor.pharmacyId !== input.pharmacyId) {
    throw new Error("You can add stock only for your assigned pharmacy")
  }

  const { medicines } = await getCollections()
  const pharmacy = mockPharmacies.find((p) => p.id === actor.pharmacyId)
  const doc: MedicineDocument = {
    id: `med-${Date.now()}`,
    name: input.name.trim(),
    quantity: input.quantity,
    pharmacyId: actor.pharmacyId,
    pharmacyName: actor.pharmacyName || pharmacy?.name || "Unknown Pharmacy",
    updatedAt: new Date(),
  }

  await medicines.insertOne(doc)
  return medicineToApi(doc)
}

export async function updateMedicineStockInDb(input: {
  medicineId: string
  quantity: number
  actorId: string
}): Promise<Medicine | null> {
  await ensureSchemaAndSeed()
  const actor = await assertRole(input.actorId, "pharmacist")
  if (!actor.pharmacyId) {
    throw new Error("Pharmacist is not assigned to a pharmacy")
  }
  const { medicines } = await getCollections()

  await medicines.updateOne(
    { id: input.medicineId, pharmacyId: actor.pharmacyId },
    { $set: { quantity: input.quantity, updatedAt: new Date() } }
  )

  const doc = await medicines.findOne({ id: input.medicineId, pharmacyId: actor.pharmacyId })
  return doc ? medicineToApi(doc) : null
}

export async function getPrebookingsFromDb(): Promise<PrebookingRequest[]> {
  await ensureSchemaAndSeed()
  const { prebookings } = await getCollections()
  const docs = await prebookings.find({}).sort({ createdAt: -1 }).toArray()
  return docs.map(prebookingToApi)
}

export async function getPrebookingsByPharmacyFromDb(
  pharmacyId: string
): Promise<PrebookingRequest[]> {
  await ensureSchemaAndSeed()
  const { prebookings } = await getCollections()
  const docs = await prebookings.find({ pharmacyId }).sort({ createdAt: -1 }).toArray()
  return docs.map(prebookingToApi)
}

export async function getPrebookingsByHealthWorkerFromDb(
  healthWorkerId: string
): Promise<PrebookingRequest[]> {
  await ensureSchemaAndSeed()
  const { prebookings } = await getCollections()
  const docs = await prebookings.find({ healthWorkerId }).sort({ createdAt: -1 }).toArray()
  return docs.map(prebookingToApi)
}

export async function createPrebookingInDb(
  input: Omit<PrebookingRequest, "id" | "createdAt" | "status" | "respondedAt"> & {
    actorId: string
  }
): Promise<PrebookingRequest> {
  await ensureSchemaAndSeed()
  const actor = await assertRole(input.actorId, "health_worker")
  if (actor.id !== input.healthWorkerId) {
    throw new Error("Health worker mismatch for prebooking request")
  }

  const { prebookings } = await getCollections()
  const doc: PrebookingDocument = {
    id: `pb-${Date.now()}`,
    medicineId: input.medicineId,
    medicineName: input.medicineName,
    requestedQuantity: input.requestedQuantity,
    patientName: input.patientName,
    patientPhone: input.patientPhone,
    healthWorkerId: input.healthWorkerId,
    healthWorkerName: input.healthWorkerName,
    pharmacyId: input.pharmacyId,
    pharmacyName: input.pharmacyName,
    status: "pending",
    createdAt: new Date(),
  }

  await prebookings.insertOne(doc)
  return prebookingToApi(doc)
}

export async function respondToPrebookingInDb(input: {
  prebookingId: string
  status: "confirmed" | "rejected"
  expectedAvailabilityDate?: string
  actorId: string
}): Promise<PrebookingRequest | null> {
  await ensureSchemaAndSeed()
  const actor = await assertRole(input.actorId, "pharmacist")
  if (!actor.pharmacyId) {
    throw new Error("Pharmacist is not assigned to a pharmacy")
  }

  const { prebookings } = await getCollections()
  const target = await prebookings.findOne({ id: input.prebookingId })
  if (!target) return null
  if (target.pharmacyId !== actor.pharmacyId) {
    throw new Error("You can respond only to prebookings for your assigned pharmacy")
  }

  await prebookings.updateOne(
    { id: input.prebookingId, pharmacyId: actor.pharmacyId },
    {
      $set: {
        status: input.status,
        expectedAvailabilityDate:
          input.status === "confirmed" ? input.expectedAvailabilityDate : undefined,
        respondedAt: new Date(),
      },
    }
  )

  const doc = await prebookings.findOne({ id: input.prebookingId, pharmacyId: actor.pharmacyId })
  return doc ? prebookingToApi(doc) : null
}
