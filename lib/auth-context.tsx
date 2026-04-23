'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, UserRole } from './types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: UserRole) => boolean
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Usuários de demonstração
const DEMO_USERS: { email: string; password: string; user: User }[] = [
  {
    email: 'aluno@etec.sp.gov.br',
    password: 'aluno123',
    user: {
      id: '1',
      email: 'aluno@etec.sp.gov.br',
      name: 'João Silva',
      role: 'aluno',
      course: 'Desenvolvimento de Sistemas',
    },
  },
  {
    email: 'supervisor@etec.sp.gov.br',
    password: 'supervisor123',
    user: {
      id: '2',
      email: 'supervisor@etec.sp.gov.br',
      name: 'Maria Santos',
      role: 'supervisor',
    },
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('afterclass_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = (email: string, password: string, role: UserRole): boolean => {
    const foundUser = DEMO_USERS.find(
      (u) => u.email === email && u.password === password && u.user.role === role
    )

    if (foundUser) {
      setUser(foundUser.user)
      localStorage.setItem('afterclass_user', JSON.stringify(foundUser.user))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('afterclass_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
