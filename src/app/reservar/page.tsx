import { Suspense } from 'react'
import { BookingPageClient } from './BookingPageClient'

export const metadata = {
  title: 'Reservar Traslado Privado',
  description:
    'Reserva tu traslado privado entre Cartagena, Barú y Barranquilla en minutos. Disponibilidad en tiempo real, confirmación inmediata y pago seguro con Wompi.',
  alternates: { canonical: 'https://teramont.seitonhome.com/reservar' },
  openGraph: {
    title: 'Reservar Traslado Privado | Teramont Private Rides',
    description: 'Elige tu ruta, fecha y hora. Paga el 50% online y confirma tu traslado privado en la Costa Caribe.',
    url: 'https://teramont.seitonhome.com/reservar',
  },
}

export default function ReservarPage() {
  return (
    <Suspense fallback={null}>
      <BookingPageClient />
    </Suspense>
  )
}
