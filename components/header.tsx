'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Monitor, LogOut, User } from 'lucide-react'

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="bg-etec-blue text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <Monitor className="w-6 h-6 text-etec-blue" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AfterClass</h1>
            <p className="text-xs text-blue-200">Etec de Peruíbe</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
              <User className="w-4 h-4" />
              <div className="text-sm">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-blue-200 capitalize">{user.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
