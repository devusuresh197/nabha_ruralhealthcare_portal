"use client"

import type { PatientCase } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  User,
  Phone,
  MapPin,
  Thermometer,
  Heart,
  Activity,
  Wind,
  FileText,
  Stethoscope,
  Clock,
  CheckCircle2,
} from "lucide-react"

interface CaseDetailsModalProps {
  open: boolean
  onClose: () => void
  patientCase: PatientCase
}

export function CaseDetailsModal({
  open,
  onClose,
  patientCase,
}: CaseDetailsModalProps) {
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

  const getDecisionLabel = (decision?: string) => {
    switch (decision) {
      case "home_care":
        return "Home Care"
      case "scheduled_visit":
        return "Scheduled Hospital Visit"
      case "emergency_referral":
        return "Emergency Referral"
      default:
        return "Pending"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Case Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-lg ${
              patientCase.status === "reviewed"
                ? "bg-accent/10 border border-accent/20"
                : "bg-chart-4/10 border border-chart-4/20"
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {patientCase.status === "reviewed" ? (
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                ) : (
                  <Clock className="w-5 h-5 text-chart-4" />
                )}
                <span className="font-medium text-foreground">
                  {patientCase.status === "reviewed"
                    ? "Doctor Reviewed"
                    : "Pending Review"}
                </span>
              </div>
              <Badge variant={getRiskBadgeVariant(patientCase.aiRiskLevel)}>
                {patientCase.doctorRiskOverride || patientCase.aiRiskLevel} Risk
              </Badge>
            </div>
          </div>

          {/* Patient Information */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">
              Patient Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium text-foreground">
                  {patientCase.patientName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground ml-6">Age/Gender:</span>
                <span className="font-medium text-foreground">
                  {patientCase.patientAge} years, {patientCase.patientGender}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium text-foreground">
                  {patientCase.patientPhone}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Village:</span>
                <span className="font-medium text-foreground">
                  {patientCase.patientVillage}
                </span>
              </div>
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Symptoms</h3>
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
                Additional Notes
              </h3>
              <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-lg">
                {patientCase.additionalNotes}
              </p>
            </div>
          )}

          {/* Doctor Review Section */}
          {patientCase.status === "reviewed" && (
            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Doctor Review</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Reviewed by:</span>
                  <span className="font-medium text-foreground">
                    {patientCase.doctorName}
                  </span>
                  <span className="text-muted-foreground">on</span>
                  <span className="font-medium text-foreground">
                    {patientCase.reviewedAt && formatDate(patientCase.reviewedAt)}
                  </span>
                </div>

                <div className="p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Decision: {getDecisionLabel(patientCase.decision)}
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

          {/* Timestamps */}
          <div className="border-t border-border pt-4 text-xs text-muted-foreground">
            <p>Submitted: {formatDate(patientCase.createdAt)}</p>
            <p>Health Worker: {patientCase.healthWorkerName}</p>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
