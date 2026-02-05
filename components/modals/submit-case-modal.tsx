"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { createCase } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle2 } from "lucide-react"

interface SubmitCaseModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const COMMON_SYMPTOMS = [
  "Fever",
  "Headache",
  "Body ache",
  "Cough",
  "Cold",
  "Sore throat",
  "Vomiting",
  "Diarrhea",
  "Stomach pain",
  "Chest pain",
  "Shortness of breath",
  "Dizziness",
  "Weakness",
  "Loss of appetite",
  "Skin rash",
]

export function SubmitCaseModal({ open, onClose, onSuccess }: SubmitCaseModalProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Form state
  const [patientName, setPatientName] = useState("")
  const [patientAge, setPatientAge] = useState("")
  const [patientGender, setPatientGender] = useState<"Male" | "Female" | "Other">("Male")
  const [patientPhone, setPatientPhone] = useState("")
  const [patientVillage, setPatientVillage] = useState("")
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [customSymptom, setCustomSymptom] = useState("")
  const [temperature, setTemperature] = useState("")
  const [bloodPressure, setBloodPressure] = useState("")
  const [pulseRate, setPulseRate] = useState("")
  const [oxygenLevel, setOxygenLevel] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    )
  }

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms([...selectedSymptoms, customSymptom.trim()])
      setCustomSymptom("")
    }
  }

  const handleSubmit = async () => {
    if (!user) return

    setIsSubmitting(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    createCase({
      patientName,
      patientAge: parseInt(patientAge),
      patientGender,
      patientPhone,
      patientVillage,
      symptoms: selectedSymptoms,
      vitals: {
        temperature: temperature ? parseFloat(temperature) : undefined,
        bloodPressure: bloodPressure || undefined,
        pulseRate: pulseRate ? parseInt(pulseRate) : undefined,
        oxygenLevel: oxygenLevel ? parseInt(oxygenLevel) : undefined,
      },
      additionalNotes: additionalNotes || undefined,
      healthWorkerId: user.id,
      healthWorkerName: user.name,
    })

    setIsSubmitting(false)
    setIsSuccess(true)

    setTimeout(() => {
      onSuccess()
    }, 1500)
  }

  const canProceedStep1 =
    patientName && patientAge && patientPhone && patientVillage

  const canProceedStep2 = selectedSymptoms.length > 0

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Case Submitted Successfully
            </h3>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              The case has been sent for doctor review. You will be notified once reviewed.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit New Patient Case</DialogTitle>
          <DialogDescription>
            Step {step} of 3:{" "}
            {step === 1
              ? "Patient Information"
              : step === 2
                ? "Symptoms"
                : "Vitals & Notes"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                s <= step ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Patient Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name *</Label>
              <Input
                id="patientName"
                placeholder="Enter patient's full name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientAge">Age *</Label>
                <Input
                  id="patientAge"
                  type="number"
                  placeholder="Age in years"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender *</Label>
                <Select
                  value={patientGender}
                  onValueChange={(v) => setPatientGender(v as "Male" | "Female" | "Other")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientPhone">Phone Number *</Label>
              <Input
                id="patientPhone"
                placeholder="+91 XXXXX XXXXX"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientVillage">Village/Area *</Label>
              <Input
                id="patientVillage"
                placeholder="Enter village or area name"
                value={patientVillage}
                onChange={(e) => setPatientVillage(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2: Symptoms */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="mb-3 block">Select Symptoms *</Label>
              <div className="grid grid-cols-2 gap-2">
                {COMMON_SYMPTOMS.map((symptom) => (
                  <div
                    key={symptom}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={symptom}
                      checked={selectedSymptoms.includes(symptom)}
                      onCheckedChange={() => toggleSymptom(symptom)}
                    />
                    <Label
                      htmlFor={symptom}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {symptom}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Add Custom Symptom</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Other symptom"
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomSymptom()}
                />
                <Button type="button" variant="outline" onClick={addCustomSymptom}>
                  Add
                </Button>
              </div>
            </div>

            {selectedSymptoms.length > 0 && (
              <div className="p-3 bg-secondary rounded-lg">
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Selected Symptoms:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map((symptom) => (
                    <span
                      key={symptom}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-md"
                    >
                      {symptom}
                      <button
                        type="button"
                        onClick={() => toggleSymptom(symptom)}
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Vitals & Notes */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (°F)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 98.6"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodPressure">Blood Pressure</Label>
                <Input
                  id="bloodPressure"
                  placeholder="e.g., 120/80"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pulseRate">Pulse Rate (bpm)</Label>
                <Input
                  id="pulseRate"
                  type="number"
                  placeholder="e.g., 72"
                  value={pulseRate}
                  onChange={(e) => setPulseRate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oxygenLevel">SpO2 Level (%)</Label>
                <Input
                  id="oxygenLevel"
                  type="number"
                  placeholder="e.g., 98"
                  value={oxygenLevel}
                  onChange={(e) => setOxygenLevel(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                placeholder="Any additional observations, patient history, allergies, etc."
                rows={4}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))}
            >
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button
              type="button"
              onClick={() => setStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s))}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Case"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
