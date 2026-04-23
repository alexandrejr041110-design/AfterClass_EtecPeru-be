'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { 
  getReservations, 
  updateReservation,
  getOccurrences,
  saveOccurrence,
  deleteOccurrence,
  generateId
} from '@/lib/data-store'
import { LABORATORIES, type Reservation, type Occurrence, type Laboratory } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock3,
  AlertTriangle,
  ClipboardList,
  Building,
  Users,
  Trash2
} from 'lucide-react'

export default function SupervisorPage() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [occurrences, setOccurrences] = useState<Occurrence[]>([])
  const [selectedLab, setSelectedLab] = useState<Laboratory | 'all'>('all')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [occurrenceForm, setOccurrenceForm] = useState({
    laboratory: '' as Laboratory | '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  })
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setReservations(getReservations())
    setOccurrences(getOccurrences())
  }

  const handleApprove = (id: string) => {
    updateReservation(id, { status: 'aprovado' })
    loadData()
  }

  const handleReject = (id: string) => {
    updateReservation(id, { status: 'rejeitado' })
    loadData()
  }

  const handleSubmitOccurrence = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitMessage(null)

    if (!occurrenceForm.laboratory || !occurrenceForm.date || !occurrenceForm.description) {
      setSubmitMessage({ type: 'error', text: 'Por favor, preencha todos os campos.' })
      return
    }

    const newOccurrence: Occurrence = {
      id: generateId(),
      laboratory: occurrenceForm.laboratory as Laboratory,
      date: occurrenceForm.date,
      description: occurrenceForm.description,
      supervisorId: user!.id,
      supervisorName: user!.name,
      createdAt: new Date().toISOString(),
    }

    saveOccurrence(newOccurrence)
    loadData()
    setOccurrenceForm({
      laboratory: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    })
    setSubmitMessage({ type: 'success', text: 'Ocorrência registrada com sucesso!' })
  }

  const handleDeleteOccurrence = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta ocorrência?')) {
      deleteOccurrence(id)
      loadData()
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

  const pendingReservations = reservations.filter(r => r.status === 'pendente')
  const filteredReservations = reservations.filter(r => {
    if (selectedLab !== 'all' && r.laboratory !== selectedLab) return false
    if (selectedDate && r.date !== selectedDate) return false
    return true
  })

  const getLabOccupancy = (lab: Laboratory) => {
    const today = new Date().toISOString().split('T')[0]
    const todayReservations = reservations.filter(
      r => r.laboratory === lab && r.date === today && r.status === 'aprovado'
    ).length
    const labInfo = LABORATORIES.find(l => l.name === lab)
    return { current: todayReservations, total: labInfo?.capacity || 20 }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-etec-black">Painel do Supervisor</h1>
        <p className="text-muted-foreground">Gerencie as solicitações de permanência e laboratórios</p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock3 className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingReservations.length}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-etec-green">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-etec-green" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reservations.filter(r => r.status === 'aprovado').length}</p>
                <p className="text-sm text-muted-foreground">Aprovados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-etec-blue">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Building className="w-6 h-6 text-etec-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold">{LABORATORIES.length}</p>
                <p className="text-sm text-muted-foreground">Laboratórios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{occurrences.length}</p>
                <p className="text-sm text-muted-foreground">Ocorrências</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="requests" className="gap-2">
            <ClipboardList className="w-4 h-4" />
            Solicitações
          </TabsTrigger>
          <TabsTrigger value="labs" className="gap-2">
            <Building className="w-4 h-4" />
            Laboratórios
          </TabsTrigger>
          <TabsTrigger value="occurrences" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Ocorrências
          </TabsTrigger>
          <TabsTrigger value="report" className="gap-2">
            <FileText className="w-4 h-4" />
            Relatório
          </TabsTrigger>
        </TabsList>

        {/* Solicitações Pendentes */}
        <TabsContent value="requests">
          <Card className="border-t-4 border-t-etec-blue">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-etec-blue">
                <ClipboardList className="w-5 h-5" />
                Formulários de Permanência
              </CardTitle>
              <CardDescription>
                Aprove ou rejeite as solicitações de permanência dos alunos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingReservations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma solicitação pendente.</p>
                  <p className="text-sm">Todas as solicitações foram processadas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReservations.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((reservation) => (
                    <div 
                      key={reservation.id} 
                      className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-semibold text-lg text-etec-black">{reservation.userName}</span>
                            {getStatusBadge(reservation.status)}
                          </div>
                          <div className="grid gap-2 text-sm md:grid-cols-2 lg:grid-cols-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="w-4 h-4" />
                              {reservation.userCourse}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              {reservation.laboratory}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {new Date(reservation.date).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              {reservation.startTime} - {reservation.endTime}
                            </div>
                          </div>
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm">
                              <span className="font-medium">Motivo:</span> {reservation.reason}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(reservation.id)}
                            className="bg-etec-green hover:bg-etec-green/90 text-white"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(reservation.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Laboratórios */}
        <TabsContent value="labs">
          <Card className="border-t-4 border-t-etec-green">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-etec-green">
                <Building className="w-5 h-5" />
                Laboratórios de Permanência
              </CardTitle>
              <CardDescription>
                Visualize a ocupação atual dos laboratórios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {LABORATORIES.map((lab) => {
                  const occupancy = getLabOccupancy(lab.name)
                  const percentage = (occupancy.current / occupancy.total) * 100
                  return (
                    <Card key={lab.name} className="overflow-hidden">
                      <CardHeader className="p-4 bg-gradient-to-r from-etec-blue to-etec-blue-light text-white">
                        <CardTitle className="text-sm">{lab.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Ocupação Hoje</span>
                            <span className="font-bold">{occupancy.current}/{occupancy.total}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                percentage >= 90 ? 'bg-red-500' : 
                                percentage >= 70 ? 'bg-yellow-500' : 
                                'bg-etec-green'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground text-center">
                            {lab.capacity} vagas disponíveis
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ocorrências */}
        <TabsContent value="occurrences">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-t-4 border-t-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Registrar Ocorrência
                </CardTitle>
                <CardDescription>
                  Registre problemas ou incidentes nos laboratórios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitOccurrence} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="occLab">Laboratório</Label>
                    <Select
                      value={occurrenceForm.laboratory}
                      onValueChange={(value) => setOccurrenceForm(prev => ({ ...prev, laboratory: value as Laboratory }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o laboratório" />
                      </SelectTrigger>
                      <SelectContent>
                        {LABORATORIES.map((lab) => (
                          <SelectItem key={lab.name} value={lab.name}>
                            {lab.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occDate">Data</Label>
                    <Input
                      id="occDate"
                      type="date"
                      value={occurrenceForm.date}
                      onChange={(e) => setOccurrenceForm(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occDesc">Descrição da Ocorrência</Label>
                    <Textarea
                      id="occDesc"
                      value={occurrenceForm.description}
                      onChange={(e) => setOccurrenceForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva o problema ou incidente ocorrido..."
                      className="min-h-[120px]"
                    />
                  </div>

                  {submitMessage && (
                    <div className={`p-4 rounded-lg ${submitMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {submitMessage.text}
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Registrar Ocorrência
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <FileText className="w-5 h-5" />
                  Histórico de Ocorrências
                </CardTitle>
                <CardDescription>
                  Ocorrências registradas nos laboratórios
                </CardDescription>
              </CardHeader>
              <CardContent>
                {occurrences.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma ocorrência registrada.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {occurrences.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((occurrence) => (
                      <div key={occurrence.id} className="p-3 border rounded-lg bg-muted/50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{occurrence.laboratory}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(occurrence.date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-sm">{occurrence.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Por: {occurrence.supervisorName}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteOccurrence(occurrence.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Relatório */}
        <TabsContent value="report">
          <Card className="border-t-4 border-t-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <FileText className="w-5 h-5" />
                Relatório de Permanência
              </CardTitle>
              <CardDescription>
                Filtre e visualize todas as solicitações de permanência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="space-y-2">
                  <Label>Laboratório</Label>
                  <Select
                    value={selectedLab}
                    onValueChange={(value) => setSelectedLab(value as Laboratory | 'all')}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Todos os laboratórios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os laboratórios</SelectItem>
                      {LABORATORIES.map((lab) => (
                        <SelectItem key={lab.name} value={lab.name}>
                          {lab.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-[200px]"
                  />
                </div>

                {(selectedLab !== 'all' || selectedDate) && (
                  <div className="flex items-end">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedLab('all')
                        setSelectedDate('')
                      }}
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                )}
              </div>

              {filteredReservations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma solicitação encontrada com os filtros selecionados.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-3 text-left text-sm font-medium">Aluno</th>
                        <th className="p-3 text-left text-sm font-medium">Curso</th>
                        <th className="p-3 text-left text-sm font-medium">Laboratório</th>
                        <th className="p-3 text-left text-sm font-medium">Data</th>
                        <th className="p-3 text-left text-sm font-medium">Horário</th>
                        <th className="p-3 text-left text-sm font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReservations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((reservation) => (
                        <tr key={reservation.id} className="border-b hover:bg-muted/50">
                          <td className="p-3 text-sm">{reservation.userName}</td>
                          <td className="p-3 text-sm">{reservation.userCourse}</td>
                          <td className="p-3 text-sm">{reservation.laboratory}</td>
                          <td className="p-3 text-sm">{new Date(reservation.date).toLocaleDateString('pt-BR')}</td>
                          <td className="p-3 text-sm">{reservation.startTime} - {reservation.endTime}</td>
                          <td className="p-3 text-sm">{getStatusBadge(reservation.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
