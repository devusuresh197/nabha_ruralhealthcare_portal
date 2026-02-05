"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  getCasesByHealthWorker,
  getPrebookingsByHealthWorker,
} from "@/lib/data-store"
import type { PatientCase, PrebookingRequest } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Plus,
  Eye,
  Search,
  Package,
} from "lucide-react"
import { SubmitCaseModal } from "@/components/modals/submit-case-modal"
import { MedicineSearch } from "@/components/health-worker/medicine-search"
import { CaseDetailsModal } from "@/components/modals/case-details-modal"
import { PrebookingsList } from "@/components/health-worker/prebookings-list"

export function HealthWorkerDashboard() {
  const { user } = useAuth()
  const [cases, setCases] = useState<PatientCase[]>([])
  const [prebookings, setPrebookings] = useState<PrebookingRequest[]>([])
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [selectedCase, setSelectedCase] = useState<PatientCase | null>(null)
  const [activeTab, setActiveTab] = useState<"cases" | "medicine" | "prebookings">("cases")

  const loadData = () => {
    if (user) {
      setCases(getCasesByHealthWorker(user.id))
      setPrebookings(getPrebookingsByHealthWorker(user.id))
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const pendingCount = cases.filter((c) => c.status === "pending").length
  const reviewedCount = cases.filter((c) => c.status === "reviewed" || c.status === "completed").length

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "reviewed":
      case "completed":
        return "default"
      default:
        return "secondary"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {user?.name}
        </h1>
        <p className="text-muted-foreground">
          Community Health Worker Dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-chart-4/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{reviewedCount}</p>
                <p className="text-sm text-muted-foreground">Doctor Reviewed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{prebookings.length}</p>
                <p className="text-sm text-muted-foreground">Prebookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setShowSubmitModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Submit New Case
        </Button>
        <Button
          variant={activeTab === "cases" ? "secondary" : "outline"}
          onClick={() => setActiveTab("cases")}
          className="gap-2"
        >
          <ClipboardList className="w-4 h-4" />
          View All Cases
        </Button>
        <Button
          variant={activeTab === "medicine" ? "secondary" : "outline"}
          onClick={() => setActiveTab("medicine")}
          className="gap-2"
        >
          <Search className="w-4 h-4" />
          Medicine Search
        </Button>
        <Button
          variant={activeTab === "prebookings" ? "secondary" : "outline"}
          onClick={() => setActiveTab("prebookings")}
          className="gap-2"
        >
          <Package className="w-4 h-4" />
          My Prebookings
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "cases" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Patient Cases
            </CardTitle>
            <CardDescription>
              All cases submitted by you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cases.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No cases submitted yet</p>
                <Button
                  variant="link"
                  onClick={() => setShowSubmitModal(true)}
                  className="mt-2"
                >
                  Submit your first case
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {cases.map((patientCase) => (
                  <div
                    key={patientCase.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">
                          {patientCase.patientName}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          ({patientCase.patientAge}y, {patientCase.patientGender})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant={getRiskBadgeVariant(patientCase.aiRiskLevel)}>
                          {patientCase.aiRiskLevel} Risk
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(patientCase.status)}>
                          {patientCase.status === "pending" ? "Pending Review" : "Reviewed"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(patientCase.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {patientCase.symptoms.join(", ")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCase(patientCase)}
                      className="ml-2 shrink-0"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "medicine" && (
        <MedicineSearch onPrebookingCreated={loadData} />
      )}

      {activeTab === "prebookings" && (
        <PrebookingsList prebookings={prebookings} />
      )}

      {/* Modals */}
      {showSubmitModal && (
        <SubmitCaseModal
          open={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => {
            setShowSubmitModal(false)
            loadData()
          }}
        />
      )}

      {selectedCase && (
        <CaseDetailsModal
          open={!!selectedCase}
          onClose={() => setSelectedCase(null)}
          patientCase={selectedCase}
        />
      )}
    </div>
  )
}
