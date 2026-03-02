"use client"

import React from "react"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Heart,
  Stethoscope,
  Pill,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"

interface AppShellProps {
  children: React.ReactNode
  onLogout: () => void
}

export function AppShell({ children, onLogout }: AppShellProps) {
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getRoleIcon = () => {
    switch (user?.role) {
      case "health_worker":
        return <Heart className="w-5 h-5" />
      case "doctor":
        return <Stethoscope className="w-5 h-5" />
      case "pharmacist":
        return <Pill className="w-5 h-5" />
      default:
        return <User className="w-5 h-5" />
    }
  }

  const getRoleLabel = () => {
    switch (user?.role) {
      case "health_worker":
        return "Health Worker"
      case "doctor":
        return "Doctor"
      case "pharmacist":
        return "Pharmacist"
      default:
        return "User"
    }
  }

  const getRoleColor = () => {
    switch (user?.role) {
      case "health_worker":
        return "bg-primary/10 text-primary"
      case "doctor":
        return "bg-accent/20 text-accent"
      case "pharmacist":
        return "bg-chart-4/20 text-chart-4"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground leading-none">
                  RuralCare
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Healthcare Portal
                </p>
              </div>
            </div>

            {/* Role Badge - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getRoleColor()}`}
              >
                {getRoleIcon()}
                <span>{getRoleLabel()}</span>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <User className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <span className="hidden sm:inline-block text-sm font-medium">
                      {user?.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Mobile Role Badge */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pb-4">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getRoleColor()}`}
            >
              {getRoleIcon()}
              <span>{getRoleLabel()}</span>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}
