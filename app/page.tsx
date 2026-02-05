"use client"

import { useState } from "react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { AppShell } from "@/components/app-shell"
import { HealthWorkerDashboard } from "@/components/dashboards/health-worker-dashboard"
import { DoctorDashboard } from "@/components/dashboards/doctor-dashboard"
import { PharmacyDashboard } from "@/components/dashboards/pharmacy-dashboard"

function AppContent() {
  const { user, logout } = useAuth()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // If not logged in, show login form
  if (!isLoggedIn || !user) {
    return (
      <LoginForm
        onLoginSuccess={() => setIsLoggedIn(true)}
      />
    )
  }

  // Render role-specific dashboard
  const renderDashboard = () => {
    switch (user.role) {
      case "health_worker":
        return <HealthWorkerDashboard />
      case "doctor":
        return <DoctorDashboard />
      case "pharmacist":
        return <PharmacyDashboard />
      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Unknown role: {user.role}</p>
          </div>
        )
    }
  }

  return (
    <AppShell
      onLogout={() => {
        logout()
        setIsLoggedIn(false)
      }}
    >
      {renderDashboard()}
    </AppShell>
  )
}

export default function RuralCarePortal() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
