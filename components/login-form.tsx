"use client"

import React from "react"
import { useState } from "react"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ChevronDown, Heart, Home, Search } from "lucide-react"

interface LoginFormProps {
  onLoginSuccess: () => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [heroImageSrc, setHeroImageSrc] = useState("/ii.jpg")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const success = await login(email, password)
    if (success) {
      onLoginSuccess()
    } else {
      setError("Invalid email or password, or access is not granted.")
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header>
        <div className="h-12 bg-[#1f4f97] text-white">
          <div className="mx-auto flex h-full w-full max-w-[1400px] items-center justify-between px-4 text-sm font-medium">
            <div className="flex items-center gap-8">
              <span>Global</span>
              <span className="inline-flex items-center gap-1">
                Regions <ChevronDown className="h-3 w-3" />
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Search className="h-5 w-5" />
              <span className="inline-flex items-center gap-1">
                Select language <ChevronDown className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#0d6cb8] text-white">
                <Heart className="h-7 w-7" />
              </div>
              <div>
                <p className="text-3xl font-bold leading-none text-[#0d6cb8]">RuralCare</p>
                <p className="text-sm text-slate-600">Official Rural Health Coordination Platform</p>
              </div>
            </div>
            <div className="inline-flex items-center rounded-md border border-[#0E3A8A]/20 bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#0E3A8A]">
              Rural Public Health Mission
            </div>
          </div>
        </div>

        <div className="h-14 bg-[#133c7f] text-white">
          <div className="mx-auto flex h-full w-full max-w-[1400px] items-center justify-between px-4 text-sm font-semibold sm:text-base">
            <div className="inline-flex items-center gap-2">
              <Home className="h-5 w-5" /> Home
            </div>
            <div className="hidden items-center gap-10 md:flex">
              <span className="inline-flex items-center gap-1">
                Health Topics <ChevronDown className="h-3 w-3" />
              </span>
              <span className="inline-flex items-center gap-1">
                Countries <ChevronDown className="h-3 w-3" />
              </span>
              <span className="inline-flex items-center gap-1">
                Newsroom <ChevronDown className="h-3 w-3" />
              </span>
              <span className="inline-flex items-center gap-1">
                Data <ChevronDown className="h-3 w-3" />
              </span>
              <span className="inline-flex items-center gap-1">
                About RuralCare <ChevronDown className="h-3 w-3" />
              </span>
            </div>
            <div className="md:hidden">Menu</div>
          </div>
        </div>
      </header>

      <section className="relative h-[220px] w-full sm:h-[320px] md:h-[380px] lg:h-[460px]">
        <Image
          src={heroImageSrc}
          alt="Rural healthcare support banner"
          fill
          className="object-cover"
          priority
          onError={() => setHeroImageSrc("/placeholder.jpg")}
        />
        <div className="absolute inset-0 bg-slate-900/20" />
      </section>

      <main className="mx-auto w-full max-w-[1400px] px-4 py-10">
        <div className="mx-auto max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#133c7f]">Sign In</h2>
            <p className="mt-2 text-sm text-slate-600">
              Access healthcare support workflows for Nabha rural communities.
            </p>
          </div>

          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Authorized Access</CardTitle>
              <CardDescription>Use your approved email and password.</CardDescription>
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
                  <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

                <Button type="submit" className="w-full bg-[#133c7f] hover:bg-[#102f65]" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-2 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>RuralCare: Supporting low-income families across Nabha villages with trusted care access.</p>
          <p>Official Community Health Platform</p>
        </div>
      </footer>
    </div>
  )
}
