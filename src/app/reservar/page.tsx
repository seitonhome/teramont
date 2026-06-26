import { Suspense } from 'react'
import { BookingPageClient } from './BookingPageClient'

export const metadata = {
  title: 'Reservar viaje — Teramont Private Rides',
  description:
    'Reserva tu viaje privado entre Cartagena, Barú y Barranquilla. Elige fecha, hora y paga de forma segura.',
}

export default function ReservarPage() {
  return (
    <Suspense fallback={null}>
      <BookingPageClient />
    </Suspense>
  )
}
