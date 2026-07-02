import { Suspense } from 'react'
import { BookingPageClient } from './BookingPageClient'

export const metadata = {
  title: 'Reservar Traslado Privado',
  description:
    'Asegura tu viaje privado entre Cartagena, Barú y Barranquilla en minutos. Disponibilidad en tiempo real, confirmación inmediata y pago seguro con Wompi.',
  alternates: { canonical: 'https://teramont.seitonhome.com/reservar' },
  openGraph: {
    title: 'Reservar Traslado Privado | Teramont Private Rides',
    description: 'Elige tu ruta, fecha y hora. Paga el 50% online y tu viaje privado por el Caribe queda asegurado.',
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
