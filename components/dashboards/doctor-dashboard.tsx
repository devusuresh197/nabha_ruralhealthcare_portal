"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getPendingCases, getReviewedCases } from "@/lib/api-client"
import type { PatientCase } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
} from "lucide-react"
import { CaseReviewModal } from "@/components/modals/case-review-modal"

export function DoctorDashboard() {
  const { user } = useAuth()
  const [pendingCases, setPendingCases] = useState<PatientCase[]>([])
  const [reviewedCases, setReviewedCases] = useState<PatientCase[]>([])
  const [selectedCase, setSelectedCase] = useState<PatientCase | null>(null)
  const [activeTab, setActiveTab] = useState<"pending" | "reviewed">("pending")

  const loadData = async () => {
    try {
      const [pending, reviewed] = await Promise.all([
        getPendingCases(),
        getReviewedCases(),
      ])
      setPendingCases(pending)
      setReviewedCases(reviewed)
    } catch (_error) {
      setPendingCases([])
      setReviewedCases([])
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Sort pending cases by risk priority
  const sortedPendingCases = [...pendingCases].sort((a, b) => {
    const riskOrder = { High: 0, Medium: 1, Low: 2 }
    return riskOrder[a.aiRiskLevel] - riskOrder[b.aiRiskLevel]
  })

  const highRiskCount = pendingCases.filter((c) => c.aiRiskLevel === "High").length
  const mediumRiskCount = pendingCases.filter((c) => c.aiRiskLevel === "Medium").length

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {user?.name}
        </h1>
        <p className="text-muted-foreground">
          Doctor Case Review Dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-chart-4/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {pendingCases.length}
                </p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{highRiskCount}</p>
                <p className="text-sm text-muted-foreground">High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mediumRiskCount}</p>
                <p className="text-sm text-muted-foreground">Medium Risk</p>
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
                <p className="text-2xl font-bold text-foreground">
                  {reviewedCases.length}
                </p>
                <p className="text-sm text-muted-foreground">Reviewed Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-3">
        <Button
          variant={activeTab === "pending" ? "default" : "outline"}
          onClick={() => setActiveTab("pending")}
          className="gap-2"
        >
          <ClipboardList className="w-4 h-4" />
          Pending Cases ({pendingCases.length})
        </Button>
        <Button
          variant={activeTab === "reviewed" ? "default" : "outline"}
          onClick={() => setActiveTab("reviewed")}
          className="gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Reviewed Cases
        </Button>
      </div>

      {/* Cases List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {activeTab === "pending" ? (
              <>
                <Clock className="w-5 h-5" />
                Cases Awaiting Review
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Recently Reviewed Cases
              </>
            )}
          </CardTitle>
          <CardDescription>
            {activeTab === "pending"
              ? "Sorted by AI risk priority (High → Medium → Low)"
              : "Cases you have reviewed"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTab === "pending" ? (
            sortedPendingCases.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-3" />
                <p className="text-muted-foreground">No pending cases</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All cases have been reviewed
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedPendingCases.map((patientCase) => (
                  <div
                    key={patientCase.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      patientCase.aiRiskLevel === "High"
                        ? "border-destructive/30 bg-destructive/5 hover:bg-destructive/10"
                        : patientCase.aiRiskLevel === "Medium"
                          ? "border-chart-4/30 bg-chart-4/5 hover:bg-chart-4/10"
                          : "border-border hover:bg-secondary/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">
                          {patientCase.patientName}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          ({patientCase.patientAge}y, {patientCase.patientGender})
                        </span>
                        <span className="text-muted-foreground text-sm">
                          • {patientCase.patientVillage}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge
                          variant={getRiskBadgeVariant(patientCase.aiRiskLevel)}
                          className="gap-1"
                        >
                          {getRiskIcon(patientCase.aiRiskLevel)}
                          {patientCase.aiRiskLevel} Risk (AI)
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(patientCase.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        Symptoms: {patientCase.symptoms.join(", ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted by: {patientCase.healthWorkerName}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setSelectedCase(patientCase)}
                      className="ml-2 shrink-0"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            )
          ) : reviewedCases.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No reviewed cases yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviewedCases.map((patientCase) => (
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
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Reviewed
                      </Badge>
                      <Badge variant="outline">
                        {patientCase.decision === "home_care"
                          ? "Home Care"
                          : patientCase.decision === "scheduled_visit"
                            ? "Scheduled Visit"
                            : "Emergency Referral"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {patientCase.reviewedAt && formatDate(patientCase.reviewedAt)}
                      </span>
                    </div>
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

      {/* Case Review Modal */}
      {selectedCase && (
        <CaseReviewModal
          open={!!selectedCase}
          onClose={() => setSelectedCase(null)}
          patientCase={selectedCase}
          onReviewComplete={() => {
            setSelectedCase(null)
            loadData()
          }}
        />
      )}
    </div>
  )
}
