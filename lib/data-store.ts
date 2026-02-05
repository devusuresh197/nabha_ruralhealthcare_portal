import type {
  PatientCase,
  Medicine,
  PrebookingRequest,
  MedicineSearchResult,
  RiskLevel,
  CaseDecision,
} from "./types"
import {
  mockCases,
  mockMedicines,
  mockPrebookings,
  mockPharmacies,
} from "./mock-data"

// In-memory data store (simulating backend)
let cases: PatientCase[] = [...mockCases]
let medicines: Medicine[] = [...mockMedicines]
let prebookings: PrebookingRequest[] = [...mockPrebookings]

// ============ CASE FUNCTIONS ============

export function getCases(): PatientCase[] {
  return cases.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getCasesByHealthWorker(healthWorkerId: string): PatientCase[] {
  return getCases().filter((c) => c.healthWorkerId === healthWorkerId)
}

export function getPendingCases(): PatientCase[] {
  return getCases().filter((c) => c.status === "pending")
}

export function getReviewedCases(): PatientCase[] {
  return getCases().filter((c) => c.status === "reviewed" || c.status === "completed")
}

export function getCaseById(caseId: string): PatientCase | undefined {
  return cases.find((c) => c.id === caseId)
}

export function createCase(
  caseData: Omit<PatientCase, "id" | "createdAt" | "status" | "aiRiskLevel">
): PatientCase {
  const aiRiskLevel = calculateAIRisk(caseData)
  
  const newCase: PatientCase = {
    ...caseData,
    id: `case-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "pending",
    aiRiskLevel,
  }
  
  cases = [newCase, ...cases]
  return newCase
}

export function updateCaseReview(
  caseId: string,
  review: {
    doctorId: string
    doctorName: string
    doctorRiskOverride?: RiskLevel
    overrideReason?: string
    decision: CaseDecision
    medicalAdvice: string
    prescription: string
  }
): PatientCase | undefined {
  const caseIndex = cases.findIndex((c) => c.id === caseId)
  if (caseIndex === -1) return undefined
  
  cases[caseIndex] = {
    ...cases[caseIndex],
    ...review,
    status: "reviewed",
    reviewedAt: new Date().toISOString(),
  }
  
  return cases[caseIndex]
}

// Simple rule-based AI risk calculation
function calculateAIRisk(
  caseData: Omit<PatientCase, "id" | "createdAt" | "status" | "aiRiskLevel">
): RiskLevel {
  let riskScore = 0
  
  // Age factors
  if (caseData.patientAge < 5 || caseData.patientAge > 65) riskScore += 2
  
  // Vital signs
  if (caseData.vitals.temperature && caseData.vitals.temperature > 102) riskScore += 2
  if (caseData.vitals.temperature && caseData.vitals.temperature > 100) riskScore += 1
  if (caseData.vitals.oxygenLevel && caseData.vitals.oxygenLevel < 94) riskScore += 3
  if (caseData.vitals.oxygenLevel && caseData.vitals.oxygenLevel < 96) riskScore += 1
  if (caseData.vitals.pulseRate && caseData.vitals.pulseRate > 100) riskScore += 1
  
  // High-risk symptoms
  const highRiskSymptoms = ["chest pain", "shortness of breath", "unconscious", "severe bleeding", "stroke symptoms"]
  const mediumRiskSymptoms = ["high fever", "vomiting", "dizziness", "dehydration"]
  
  const symptomsLower = caseData.symptoms.map((s) => s.toLowerCase())
  
  highRiskSymptoms.forEach((symptom) => {
    if (symptomsLower.some((s) => s.includes(symptom))) riskScore += 3
  })
  
  mediumRiskSymptoms.forEach((symptom) => {
    if (symptomsLower.some((s) => s.includes(symptom))) riskScore += 1
  })
  
  if (riskScore >= 5) return "High"
  if (riskScore >= 2) return "Medium"
  return "Low"
}

// ============ MEDICINE FUNCTIONS ============

export function getMedicines(): Medicine[] {
  return medicines
}

export function getMedicinesByPharmacy(pharmacyId: string): Medicine[] {
  return medicines.filter((m) => m.pharmacyId === pharmacyId)
}

export function searchMedicines(query: string): MedicineSearchResult[] {
  if (!query.trim()) return []
  
  const queryLower = query.toLowerCase()
  const matchingMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(queryLower)
  )
  
  return matchingMedicines.map((m) => {
    const pharmacy = mockPharmacies.find((p) => p.id === m.pharmacyId)
    return {
      pharmacyId: m.pharmacyId,
      pharmacyName: m.pharmacyName,
      pharmacyAddress: pharmacy?.address || "",
      medicineId: m.id,
      medicineName: m.name,
      available: m.quantity > 0,
      quantity: m.quantity,
    }
  })
}

export function updateMedicineStock(
  medicineId: string,
  quantity: number
): Medicine | undefined {
  const index = medicines.findIndex((m) => m.id === medicineId)
  if (index === -1) return undefined
  
  medicines[index] = {
    ...medicines[index],
    quantity,
    updatedAt: new Date().toISOString(),
  }
  
  return medicines[index]
}

export function addMedicine(
  name: string,
  quantity: number,
  pharmacyId: string
): Medicine {
  const pharmacy = mockPharmacies.find((p) => p.id === pharmacyId)
  
  const newMedicine: Medicine = {
    id: `med-${Date.now()}`,
    name,
    quantity,
    pharmacyId,
    pharmacyName: pharmacy?.name || "Unknown Pharmacy",
    updatedAt: new Date().toISOString(),
  }
  
  medicines = [...medicines, newMedicine]
  return newMedicine
}

// ============ PREBOOKING FUNCTIONS ============

export function getPrebookings(): PrebookingRequest[] {
  return prebookings.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getPrebookingsByPharmacy(pharmacyId: string): PrebookingRequest[] {
  return getPrebookings().filter((p) => p.pharmacyId === pharmacyId)
}

export function getPrebookingsByHealthWorker(healthWorkerId: string): PrebookingRequest[] {
  return getPrebookings().filter((p) => p.healthWorkerId === healthWorkerId)
}

export function createPrebooking(
  prebookingData: Omit<PrebookingRequest, "id" | "createdAt" | "status">
): PrebookingRequest {
  const newPrebooking: PrebookingRequest = {
    ...prebookingData,
    id: `pb-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "pending",
  }
  
  prebookings = [newPrebooking, ...prebookings]
  return newPrebooking
}

export function respondToPrebooking(
  prebookingId: string,
  response: {
    status: "confirmed" | "rejected"
    expectedAvailabilityDate?: string
  }
): PrebookingRequest | undefined {
  const index = prebookings.findIndex((p) => p.id === prebookingId)
  if (index === -1) return undefined
  
  prebookings[index] = {
    ...prebookings[index],
    ...response,
    respondedAt: new Date().toISOString(),
  }
  
  return prebookings[index]
}
