import type {
  CaseDecision,
  Medicine,
  MedicineSearchResult,
  PatientCase,
  PrebookingRequest,
  RiskLevel,
  User,
} from "@/lib/types"

type ApiMethod = "GET" | "POST" | "PATCH"

async function apiRequest<T>(
  path: string,
  method: ApiMethod = "GET",
  body?: unknown
): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      (data && typeof data.error === "string" && data.error) ||
      `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return data as T
}

export interface CreateCasePayload {
  patientName: string
  patientAge: number
  patientGender: "Male" | "Female" | "Other"
  patientPhone: string
  patientVillage: string
  symptoms: string[]
  vitals: {
    temperature?: number
    bloodPressure?: string
    pulseRate?: number
    oxygenLevel?: number
  }
  additionalNotes?: string
  healthWorkerId: string
  healthWorkerName: string
}

export interface CaseReviewPayload {
  doctorId: string
  doctorName: string
  doctorRiskOverride?: RiskLevel
  overrideReason?: string
  decision: CaseDecision
  medicalAdvice: string
  prescription: string
}

export interface CreatePrebookingPayload {
  medicineId: string
  medicineName: string
  requestedQuantity: number
  patientName: string
  patientPhone: string
  healthWorkerId: string
  healthWorkerName: string
  pharmacyId: string
  pharmacyName: string
}

export interface RespondToPrebookingPayload {
  status: "confirmed" | "rejected"
  expectedAvailabilityDate?: string
}

export async function loginUser(
  email: string,
  password: string
): Promise<User | null> {
  return apiRequest<User | null>("/api/auth/login", "POST", { email, password })
}

export async function getCasesByHealthWorker(
  healthWorkerId: string
): Promise<PatientCase[]> {
  return apiRequest<PatientCase[]>(
    `/api/cases?healthWorkerId=${encodeURIComponent(healthWorkerId)}`
  )
}

export async function getPendingCases(): Promise<PatientCase[]> {
  return apiRequest<PatientCase[]>("/api/cases?status=pending")
}

export async function getReviewedCases(): Promise<PatientCase[]> {
  return apiRequest<PatientCase[]>("/api/cases?status=reviewed")
}

export async function createCase(
  payload: CreateCasePayload
): Promise<PatientCase> {
  return apiRequest<PatientCase>("/api/cases", "POST", payload)
}

export async function updateCaseReview(
  caseId: string,
  payload: CaseReviewPayload
): Promise<PatientCase> {
  return apiRequest<PatientCase>(`/api/cases/${caseId}/review`, "PATCH", payload)
}

export async function getMedicinesByPharmacy(
  pharmacyId: string
): Promise<Medicine[]> {
  return apiRequest<Medicine[]>(
    `/api/medicines?pharmacyId=${encodeURIComponent(pharmacyId)}`
  )
}

export async function searchMedicines(query: string): Promise<MedicineSearchResult[]> {
  return apiRequest<MedicineSearchResult[]>(
    `/api/medicines?query=${encodeURIComponent(query)}`
  )
}

export async function addMedicine(
  name: string,
  quantity: number,
  pharmacyId: string
): Promise<Medicine> {
  return apiRequest<Medicine>("/api/medicines", "POST", {
    name,
    quantity,
    pharmacyId,
  })
}

export async function updateMedicineStock(
  medicineId: string,
  quantity: number
): Promise<Medicine> {
  return apiRequest<Medicine>(`/api/medicines/${medicineId}`, "PATCH", { quantity })
}

export async function getPrebookingsByHealthWorker(
  healthWorkerId: string
): Promise<PrebookingRequest[]> {
  return apiRequest<PrebookingRequest[]>(
    `/api/prebookings?healthWorkerId=${encodeURIComponent(healthWorkerId)}`
  )
}

export async function getPrebookingsByPharmacy(
  pharmacyId: string
): Promise<PrebookingRequest[]> {
  return apiRequest<PrebookingRequest[]>(
    `/api/prebookings?pharmacyId=${encodeURIComponent(pharmacyId)}`
  )
}

export async function createPrebooking(
  payload: CreatePrebookingPayload
): Promise<PrebookingRequest> {
  return apiRequest<PrebookingRequest>("/api/prebookings", "POST", payload)
}

export async function respondToPrebooking(
  prebookingId: string,
  payload: RespondToPrebookingPayload
): Promise<PrebookingRequest> {
  return apiRequest<PrebookingRequest>(
    `/api/prebookings/${prebookingId}/response`,
    "PATCH",
    payload
  )
}
