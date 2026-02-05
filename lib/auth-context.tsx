"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import type { User, UserRole } from "./types"
import { mockUsers } from "./mock-data"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  switchRole: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true)
    
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    // Find user by email (mock authentication)
    const foundUser = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    )
    
    if (foundUser) {
      setUser(foundUser)
      setIsLoading(false)
      return true
    }
    
    setIsLoading(false)
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  // For demo purposes: switch between roles easily
  const switchRole = useCallback((role: UserRole) => {
    const userWithRole = mockUsers.find((u) => u.role === role)
    if (userWithRole) {
      setUser(userWithRole)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
