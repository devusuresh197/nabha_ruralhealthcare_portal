"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { updateCaseReview } from "@/lib/api-client"
import type { PatientCase, RiskLevel, CaseDecision } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  User,
  Phone,
  MapPin,
  Thermometer,
  Heart,
  Activity,
  Wind,
  Brain,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Clock,
} from "lucide-react"

interface CaseReviewModalProps {
  open: boolean
  onClose: () => void
  patientCase: PatientCase
  onReviewComplete: () => void
}

const OVERRIDE_REASONS = [
  "Insufficient symptoms",
  "Patient history considered",
  "False positive",
  "Clinical judgement",
  "Other",
]

export function CaseReviewModal({
  open,
  onClose,
  patientCase,
  onReviewComplete,
}: CaseReviewModalProps) {
  const { user } = useAuth()
  const [acceptAI, setAcceptAI] = useState(true)
  const [overrideRisk, setOverrideRisk] = useState<RiskLevel>(patientCase.aiRiskLevel)
  const [overrideReason, setOverrideReason] = useState("")
  const [decision, setDecision] = useState<CaseDecision | "">("")
  const [medicalAdvice, setMedicalAdvice] = useState("")
  const [prescription, setPrescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const isAlreadyReviewed = patientCase.status === "reviewed"

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "High":
        return "destructive"
      case "Medium":
        return "default"
      default:
        return "secondary"
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "High":
        return <AlertTriangle className="w-4 h-4" />
      case "Medium":
        return <Clock className="w-4 h-4" />
      default:
        return <CheckCircle2 className="w-4 h-4" />
    }
  }

  const handleSubmit = async () => {
    if (!user || !decision) return

    setIsSubmitting(true)
    await updateCaseReview(patientCase.id, {
      doctorId: user.id,
      doctorName: user.name,
      doctorRiskOverride: !acceptAI ? overrideRisk : undefined,
      overrideReason: !acceptAI ? overrideReason : undefined,
      decision,
      medicalAdvice,
      prescription,
    })

    setIsSubmitting(false)
    setIsSuccess(true)

    setTimeout(() => {
      onReviewComplete()
    }, 1500)
  }

  const canSubmit = decision && medicalAdvice && (!acceptAI ? overrideReason : true)

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Case Review Submitted
            </h3>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              The health worker will be notified of your decision.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            {isAlreadyReviewed ? "Case Details" : "Review Case"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Information */}
          <div className="p-4 bg-secondary rounded-lg">
            <h3 className="font-semibold text-foreground mb-3">
              Patient Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">
                  {patientCase.patientName}
                </span>
                <span className="text-muted-foreground">
                  ({patientCase.patientAge}y, {patientCase.patientGender})
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{patientCase.patientPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{patientCase.patientVillage}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Submitted by: {patientCase.healthWorkerName}
              </div>
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">Symptoms</h3>
            <div className="flex flex-wrap gap-2">
              {patientCase.symptoms.map((symptom) => (
                <Badge key={symptom} variant="outline">
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>

          {/* Vitals */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Vitals</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {patientCase.vitals.temperature && (
                <div className="p-3 bg-secondary rounded-lg text-center">
                  <Thermometer className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-lg font-semibold text-foreground">
                    {patientCase.vitals.temperature}°F
                  </p>
                  <p className="text-xs text-muted-foreground">Temperature</p>
                </div>
              )}
              {patientCase.vitals.bloodPressure && (
                <div className="p-3 bg-secondary rounded-lg text-center">
                  <Activity className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-lg font-semibold text-foreground">
                    {patientCase.vitals.bloodPressure}
                  </p>
                  <p className="text-xs text-muted-foreground">Blood Pressure</p>
                </div>
              )}
              {patientCase.vitals.pulseRate && (
                <div className="p-3 bg-secondary rounded-lg text-center">
                  <Heart className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-lg font-semibold text-foreground">
                    {patientCase.vitals.pulseRate}
                  </p>
                  <p className="text-xs text-muted-foreground">Pulse (bpm)</p>
                </div>
              )}
              {patientCase.vitals.oxygenLevel && (
                <div className="p-3 bg-secondary rounded-lg text-center">
                  <Wind className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-lg font-semibold text-foreground">
                    {patientCase.vitals.oxygenLevel}%
                  </p>
                  <p className="text-xs text-muted-foreground">SpO2</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          {patientCase.additionalNotes && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Additional Notes from Health Worker
              </h3>
              <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-lg">
                {patientCase.additionalNotes}
              </p>
            </div>
          )}

          {/* AI Risk Priority Badge */}
          <div
            className={`p-4 rounded-lg border ${
              patientCase.aiRiskLevel === "High"
                ? "border-destructive/30 bg-destructive/5"
                : patientCase.aiRiskLevel === "Medium"
                  ? "border-chart-4/30 bg-chart-4/5"
                  : "border-accent/30 bg-accent/5"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">AI Risk Assessment</h3>
            </div>
            <Badge
              variant={getRiskBadgeVariant(patientCase.aiRiskLevel)}
              className="gap-1 text-base px-3 py-1"
            >
              {getRiskIcon(patientCase.aiRiskLevel)}
              {patientCase.aiRiskLevel} Risk Priority
            </Badge>
          </div>

          {/* Doctor Review Section - Only show if not already reviewed */}
          {!isAlreadyReviewed && (
            <>
              {/* AI Risk Review Section */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">AI Risk Review</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  AI has suggested this case as{" "}
                  <span className="font-medium text-foreground">
                    {patientCase.aiRiskLevel} Risk
                  </span>
                  . Doctor may accept or override this suggestion.
                </p>

                <RadioGroup
                  value={acceptAI ? "accept" : "override"}
                  onValueChange={(v) => setAcceptAI(v === "accept")}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="accept" id="accept" />
                    <Label htmlFor="accept" className="cursor-pointer">
                      Accept AI Suggestion ({patientCase.aiRiskLevel} Risk)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="override" id="override" />
                    <Label htmlFor="override" className="cursor-pointer">
                      Override AI Suggestion
                    </Label>
                  </div>
                </RadioGroup>

                {!acceptAI && (
                  <div className="mt-4 pl-6 space-y-3">
                    <div className="space-y-2">
                      <Label>New Risk Level</Label>
                      <Select
                        value={overrideRisk}
                        onValueChange={(v) => setOverrideRisk(v as RiskLevel)}
                      >
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low Risk</SelectItem>
                          <SelectItem value="Medium">Medium Risk</SelectItem>
                          <SelectItem value="High">High Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Reason for Override *</Label>
                      <Select
                        value={overrideReason}
                        onValueChange={setOverrideReason}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {OVERRIDE_REASONS.map((reason) => (
                            <SelectItem key={reason} value={reason}>
                              {reason}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Medical Advice & Prescription */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medicalAdvice">Medical Advice *</Label>
                  <Textarea
                    id="medicalAdvice"
                    placeholder="Enter medical advice for the patient..."
                    rows={3}
                    value={medicalAdvice}
                    onChange={(e) => setMedicalAdvice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prescription">Prescription</Label>
                  <Textarea
                    id="prescription"
                    placeholder="Enter prescription details (medicine name, dosage, frequency, duration)..."
                    rows={4}
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Final Decision */}
              <div className="space-y-3">
                <Label>Final Decision *</Label>
                <RadioGroup
                  value={decision}
                  onValueChange={(v) => setDecision(v as CaseDecision)}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  <div
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer ${
                      decision === "home_care"
                        ? "border-accent bg-accent/10"
                        : "border-border hover:bg-secondary"
                    }`}
                    onClick={() => setDecision("home_care")}
                  >
                    <RadioGroupItem value="home_care" id="home_care" />
                    <Label htmlFor="home_care" className="cursor-pointer">
                      Home Care
                    </Label>
                  </div>
                  <div
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer ${
                      decision === "scheduled_visit"
                        ? "border-chart-4 bg-chart-4/10"
                        : "border-border hover:bg-secondary"
                    }`}
                    onClick={() => setDecision("scheduled_visit")}
                  >
                    <RadioGroupItem value="scheduled_visit" id="scheduled_visit" />
                    <Label htmlFor="scheduled_visit" className="cursor-pointer">
                      Scheduled Visit
                    </Label>
                  </div>
                  <div
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer ${
                      decision === "emergency_referral"
                        ? "border-destructive bg-destructive/10"
                        : "border-border hover:bg-secondary"
                    }`}
                    onClick={() => setDecision("emergency_referral")}
                  >
                    <RadioGroupItem value="emergency_referral" id="emergency_referral" />
                    <Label htmlFor="emergency_referral" className="cursor-pointer">
                      Emergency Referral
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}

          {/* Show existing review if already reviewed */}
          {isAlreadyReviewed && (
            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Doctor Review</h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Decision:{" "}
                    {patientCase.decision === "home_care"
                      ? "Home Care"
                      : patientCase.decision === "scheduled_visit"
                        ? "Scheduled Hospital Visit"
                        : "Emergency Referral"}
                  </p>
                  {patientCase.doctorRiskOverride && (
                    <p className="text-xs text-muted-foreground">
                      Risk level overridden from {patientCase.aiRiskLevel} to{" "}
                      {patientCase.doctorRiskOverride}
                      {patientCase.overrideReason && ` (${patientCase.overrideReason})`}
                    </p>
                  )}
                </div>

                {patientCase.medicalAdvice && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">
                      Medical Advice
                    </h4>
                    <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-lg">
                      {patientCase.medicalAdvice}
                    </p>
                  </div>
                )}

                {patientCase.prescription && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">
                      Prescription
                    </h4>
                    <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-lg whitespace-pre-wrap">
                      {patientCase.prescription}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            {isAlreadyReviewed ? "Close" : "Cancel"}
          </Button>
          {!isAlreadyReviewed && (
            <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
