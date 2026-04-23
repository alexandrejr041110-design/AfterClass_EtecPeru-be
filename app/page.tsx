'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import type { UserRole } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GraduationCap, Users, Monitor, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole>('aluno')
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    const success = login(email, password, selectedRole)
    if (success) {
      router.push(selectedRole === 'supervisor' ? '/supervisor' : '/aluno')
    } else {
      setError('Email, senha ou tipo de usuário inválido.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-etec-blue via-etec-blue-light to-etec-green flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-20 h-20 bg-etec-blue rounded-full flex items-center justify-center shadow-lg">
            <Monitor className="w-10 h-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-etec-black">
              AfterClass
            </CardTitle>
            <CardDescription className="text-etec-blue font-semibold">
              Etec de Peruíbe
            </CardDescription>
          </div>
          <p className="text-sm text-muted-foreground">
            Sistema de Agendamento de Laboratórios no Contraturno
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="aluno" onValueChange={(value) => setSelectedRole(value as UserRole)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="aluno" className="gap-2 data-[state=active]:bg-etec-blue data-[state=active]:text-white">
                <GraduationCap className="w-4 h-4" />
                Aluno
              </TabsTrigger>
              <TabsTrigger value="supervisor" className="gap-2 data-[state=active]:bg-etec-green data-[state=active]:text-white">
                <Users className="w-4 h-4" />
                Supervisor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="aluno">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-aluno">Email Institucional</Label>
                  <Input
                    id="email-aluno"
                    type="email"
                    placeholder="seu.email@etec.sp.gov.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-etec-blue/30 focus:border-etec-blue"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-aluno">Senha</Label>
                  <Input
                    id="password-aluno"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-etec-blue/30 focus:border-etec-blue"
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-etec-blue hover:bg-etec-blue/90 text-white"
                >
                  Entrar como Aluno
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="supervisor">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-supervisor">Email Institucional</Label>
                  <Input
                    id="email-supervisor"
                    type="email"
                    placeholder="seu.email@etec.sp.gov.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-etec-green/30 focus:border-etec-green"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-supervisor">Senha</Label>
                  <Input
                    id="password-supervisor"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-etec-green/30 focus:border-etec-green"
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-etec-green hover:bg-etec-green/90 text-white"
                >
                  Entrar como Supervisor
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center mb-2">
              <strong>Credenciais de demonstração:</strong>
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Aluno:</strong> aluno@etec.sp.gov.br / aluno123</p>
              <p><strong>Supervisor:</strong> supervisor@etec.sp.gov.br / supervisor123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
