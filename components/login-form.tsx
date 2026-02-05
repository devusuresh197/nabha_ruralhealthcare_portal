"use client"

import React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Heart, Stethoscope, Pill } from "lucide-react"

interface LoginFormProps {
  onLoginSuccess: () => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const { login, isLoading, switchRole } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    const success = await login(email, password)
    if (success) {
      onLoginSuccess()
    } else {
      setError("Invalid email or password. Try one of the demo accounts.")
    }
  }

  const handleDemoLogin = (role: "health_worker" | "doctor" | "pharmacist") => {
    switchRole(role)
    onLoginSuccess()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">RuralCare Portal</h1>
          <p className="text-muted-foreground">
            Rural Healthcare Coordination Platform
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Demo Access Section */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Demo Access (Click to login)
              </p>
              <div className="grid gap-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 bg-transparent"
                  onClick={() => handleDemoLogin("health_worker")}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Health Worker (ASHA/ANM)</div>
                    <div className="text-xs text-muted-foreground">
                      Submit cases, search medicines, prebook
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 bg-transparent"
                  onClick={() => handleDemoLogin("doctor")}
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Doctor</div>
                    <div className="text-xs text-muted-foreground">
                      Review cases, prescribe, make decisions
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-auto py-3 bg-transparent"
                  onClick={() => handleDemoLogin("pharmacist")}
                >
                  <div className="w-10 h-10 rounded-lg bg-chart-4/20 flex items-center justify-center">
                    <Pill className="w-5 h-5 text-chart-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Pharmacist</div>
                    <div className="text-xs text-muted-foreground">
                      Manage inventory, respond to prebookings
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Designed for rural Punjab healthcare coordination
        </p>
      </div>
    </div>
  )
}
