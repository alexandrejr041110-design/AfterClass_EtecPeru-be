export type UserRole = 'aluno' | 'supervisor'

export type Course = 
  | 'Desenvolvimento de Sistemas'
  | 'Administração'
  | 'Design de Interiores'
  | 'Programação de Jogos Digitais'

export type Laboratory = 
  | 'Laboratório 1'
  | 'Laboratório 2'
  | 'Laboratório 3'
  | 'Laboratório 4'
  | 'Laboratório 5'
  | 'Auditório'
  | 'Pranchetário'
  | 'Maquetário'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  course?: Course
}

export interface Reservation {
  id: string
  date: string
  startTime: string
  endTime: string
  laboratory: Laboratory
  userId: string
  userName: string
  userCourse: Course
  reason: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
  createdAt: string
}

export interface Occurrence {
  id: string
  laboratory: Laboratory
  date: string
  description: string
  supervisorId: string
  supervisorName: string
  createdAt: string
}

export const LABORATORIES: { name: Laboratory; capacity: number }[] = [
  { name: 'Laboratório 1', capacity: 20 },
  { name: 'Laboratório 2', capacity: 20 },
  { name: 'Laboratório 3', capacity: 20 },
  { name: 'Laboratório 4', capacity: 20 },
  { name: 'Laboratório 5', capacity: 20 },
  { name: 'Auditório', capacity: 20 },
  { name: 'Pranchetário', capacity: 20 },
  { name: 'Maquetário', capacity: 20 },
]

export const COURSES: Course[] = [
  'Desenvolvimento de Sistemas',
  'Administração',
  'Design de Interiores',
  'Programação de Jogos Digitais',
]
