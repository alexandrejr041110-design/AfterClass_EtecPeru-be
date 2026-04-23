'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { 
  getReservationsByUser, 
  saveReservation, 
  deleteReservation, 
  generateId,
  countApprovedReservations
} from '@/lib/data-store'
import { LABORATORIES, COURSES, type Reservation, type Laboratory, type Course } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock3,
  Plus,
  History
} from 'lucide-react'

export default function AlunoPage() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [formData, setFormData] = useState({
    name: '',
    course: '' as Course | '',
    date: '',
    startTime: '',
    endTime: '',
    laboratory: '' as Laboratory | '',
    reason: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (user) {
      loadReservations()
      setFormData(prev => ({
        ...prev,
        name: user.name,
        course: user.course || '',
      }))
    }
  }, [user])

  const loadReservations = () => {
    if (user) {
      setReservations(getReservationsByUser(user.id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage(null)

    if (!formData.name || !formData.course || !formData.date || !formData.startTime || !formData.endTime || !formData.laboratory || !formData.reason) {
      setSubmitMessage({ type: 'error', text: 'Por favor, preencha todos os campos.' })
      setIsSubmitting(false)
      return
    }

    // Verificar vagas disponíveis
    const currentCount = countApprovedReservations(formData.laboratory as Laboratory, formData.date, formData.startTime)
    const labInfo = LABORATORIES.find(l => l.name === formData.laboratory)
    
    if (labInfo && currentCount >= labInfo.capacity) {
      setSubmitMessage({ type: 'error', text: `O ${formData.laboratory} já está lotado para este horário.` })
      setIsSubmitting(false)
      return
    }

    const newReservation: Reservation = {
      id: generateId(),
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      laboratory: formData.laboratory as Laboratory,
      userId: user!.id,
      userName: formData.name,
      userCourse: formData.course as Course,
      reason: formData.reason,
      status: 'pendente',
      createdAt: new Date().toISOString(),
    }

    saveReservation(newReservation)
    loadReservations()
    
    setFormData(prev => ({
      ...prev,
      date: '',
      startTime: '',
      endTime: '',
      laboratory: '',
      reason: '',
    }))
    
    setSubmitMessage({ type: 'success', text: 'Solicitação enviada com sucesso! Aguarde aprovação do supervisor.' })
    setIsSubmitting(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja cancelar esta solicitação?')) {
      deleteReservation(id)
      loadReservations()
    }
  }

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'aprovado':
        return <Badge className="bg-etec-green text-white"><CheckCircle2 className="w-3 h-3 mr-1" />Aprovado</Badge>
      case 'rejeitado':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>
      case 'pendente':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock3 className="w-3 h-3 mr-1" />Pendente</Badge>
    }
  }

  const getAvailableSlots = (lab: Laboratory, date: string, time: string) => {
    if (!lab || !date || !time) return null
    const labInfo = LABORATORIES.find(l => l.name === lab)
    if (!labInfo) return null
    const currentCount = countApprovedReservations(lab, date, time)
    const available = labInfo.capacity - currentCount
    return available
  }

  const availableSlots = getAvailableSlots(formData.laboratory as Laboratory, formData.date, formData.startTime)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-etec-black">Bem-vindo, {user?.name}!</h1>
        <p className="text-muted-foreground">Faça sua solicitação de permanência no contraturno</p>
      </div>

      <Tabs defaultValue="form" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="form" className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Solicitação
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            Minhas Solicitações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <Card className="border-t-4 border-t-etec-blue">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-etec-blue">
                <FileText className="w-5 h-5" />
                Questionário de Permanência
              </CardTitle>
              <CardDescription>
                Preencha o formulário abaixo para solicitar o uso de um laboratório no contraturno
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Seu nome completo"
                      className="border-etec-blue/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course">Curso</Label>
                    <Select
                      value={formData.course}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, course: value as Course }))}
                    >
                      <SelectTrigger className="border-etec-blue/30">
                        <SelectValue placeholder="Selecione seu curso" />
                      </SelectTrigger>
                      <SelectContent>
                        {COURSES.map((course) => (
                          <SelectItem key={course} value={course}>
                            {course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-etec-blue" />
                      Dia
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="border-etec-blue/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="laboratory" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-etec-blue" />
                      Laboratório
                    </Label>
                    <Select
                      value={formData.laboratory}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, laboratory: value as Laboratory }))}
                    >
                      <SelectTrigger className="border-etec-blue/30">
                        <SelectValue placeholder="Selecione o laboratório" />
                      </SelectTrigger>
                      <SelectContent>
                        {LABORATORIES.map((lab) => (
                          <SelectItem key={lab.name} value={lab.name}>
                            {lab.name} ({lab.capacity} vagas)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-etec-green" />
                      Horário de Entrada
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      className="border-etec-green/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime" className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-etec-green" />
                      Horário de Saída
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="border-etec-green/30"
                    />
                  </div>
                </div>

                {availableSlots !== null && (
                  <div className={`p-4 rounded-lg ${availableSlots > 5 ? 'bg-green-50 text-green-800' : availableSlots > 0 ? 'bg-yellow-50 text-yellow-800' : 'bg-red-50 text-red-800'}`}>
                    <p className="font-medium">
                      {availableSlots > 0 
                        ? `${availableSlots} vagas disponíveis para este horário`
                        : 'Não há vagas disponíveis para este horário'
                      }
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo da Permanência</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Descreva o motivo pelo qual você precisa utilizar o laboratório no contraturno..."
                    className="min-h-[120px] border-etec-blue/30"
                  />
                </div>

                {submitMessage && (
                  <div className={`p-4 rounded-lg ${submitMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {submitMessage.text}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-etec-blue hover:bg-etec-blue/90 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-t-4 border-t-etec-green">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-etec-green">
                <History className="w-5 h-5" />
                Minhas Solicitações
              </CardTitle>
              <CardDescription>
                Acompanhe o status das suas solicitações de permanência
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reservations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Você ainda não possui solicitações.</p>
                  <p className="text-sm">Faça sua primeira solicitação na aba {"Nova Solicitação"}.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((reservation) => (
                    <div 
                      key={reservation.id} 
                      className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-semibold text-etec-black">{reservation.laboratory}</span>
                            {getStatusBadge(reservation.status)}
                          </div>
                          <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(reservation.date).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {reservation.startTime} - {reservation.endTime}
                            </div>
                          </div>
                          <p className="text-sm">
                            <span className="font-medium">Motivo:</span> {reservation.reason}
                          </p>
                        </div>
                        {reservation.status === 'pendente' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(reservation.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
