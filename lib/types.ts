export type UserRole = "health_worker" | "doctor" | "pharmacist"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  pharmacyId?: string
  pharmacyName?: string
}

export type RiskLevel = "Low" | "Medium" | "High"

export type CaseStatus = "pending" | "reviewed" | "completed"

export type CaseDecision = "home_care" | "scheduled_visit" | "emergency_referral"

export interface PatientCase {
  id: string
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
  aiRiskLevel: RiskLevel
  doctorRiskOverride?: RiskLevel
  overrideReason?: string
  status: CaseStatus
  decision?: CaseDecision
  medicalAdvice?: string
  prescription?: string
  healthWorkerId: string
  healthWorkerName: string
  doctorId?: string
  doctorName?: string
  createdAt: string
  reviewedAt?: string
}

export interface Medicine {
  id: string
  name: string
  quantity: number
  pharmacyId: string
  pharmacyName: string
  updatedAt: string
}

export interface Pharmacy {
  id: string
  name: string
  address: string
  phone: string
}

export interface PrebookingRequest {
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
  createdAt: string
  respondedAt?: string
}

export interface MedicineSearchResult {
  pharmacyId: string
  pharmacyName: string
  pharmacyAddress: string
  medicineId: string
  medicineName: string
  available: boolean
  quantity: number
}
