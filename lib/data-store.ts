import type { Reservation, Occurrence, Laboratory } from './types'

const RESERVATIONS_KEY = 'afterclass_reservations'
const OCCURRENCES_KEY = 'afterclass_occurrences'

export function getReservations(): Reservation[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(RESERVATIONS_KEY)
  return data ? JSON.parse(data) : []
}

export function saveReservation(reservation: Reservation): void {
  const reservations = getReservations()
  reservations.push(reservation)
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations))
}

export function updateReservation(id: string, updates: Partial<Reservation>): void {
  const reservations = getReservations()
  const index = reservations.findIndex((r) => r.id === id)
  if (index !== -1) {
    reservations[index] = { ...reservations[index], ...updates }
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations))
  }
}

export function deleteReservation(id: string): void {
  const reservations = getReservations().filter((r) => r.id !== id)
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations))
}

export function getReservationsByUser(userId: string): Reservation[] {
  return getReservations().filter((r) => r.userId === userId)
}

export function getReservationsByLab(laboratory: Laboratory, date: string): Reservation[] {
  return getReservations().filter(
    (r) => r.laboratory === laboratory && r.date === date && r.status === 'aprovado'
  )
}

export function countApprovedReservations(laboratory: Laboratory, date: string, time: string): number {
  return getReservations().filter(
    (r) =>
      r.laboratory === laboratory &&
      r.date === date &&
      r.startTime === time &&
      r.status === 'aprovado'
  ).length
}

// Ocorrências
export function getOccurrences(): Occurrence[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(OCCURRENCES_KEY)
  return data ? JSON.parse(data) : []
}

export function saveOccurrence(occurrence: Occurrence): void {
  const occurrences = getOccurrences()
  occurrences.push(occurrence)
  localStorage.setItem(OCCURRENCES_KEY, JSON.stringify(occurrences))
}

export function deleteOccurrence(id: string): void {
  const occurrences = getOccurrences().filter((o) => o.id !== id)
  localStorage.setItem(OCCURRENCES_KEY, JSON.stringify(occurrences))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
