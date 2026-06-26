'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    q: '¿La tarifa es por persona o por vehículo?',
    a: 'La tarifa es por vehículo, no por persona. Sin importar si viaja 1 o 5 personas, el precio es el mismo: $450.000 COP.',
  },
  {
    q: '¿Cuántas personas pueden viajar?',
    a: 'La Volkswagen Teramont 2024 tiene capacidad para hasta 5 pasajeros cómodamente. El conductor no cuenta como pasajero.',
  },
  {
    q: '¿Puedo llevar maletas grandes?',
    a: 'Sí. El vehículo tiene maletero amplio para hasta 5 maletas estándar. Si tienes equipaje especial o voluminoso, indícalo en las notas al momento de reservar.',
  },
  {
    q: '¿Puedo reservar ida y regreso?',
    a: 'Sí. Puedes hacer dos reservas independientes: una para la ida y otra para el regreso, seleccionando los horarios que más te convengan en cada trayecto.',
  },
  {
    q: '¿Qué pasa si mi vuelo o plan se retrasa?',
    a: 'Contáctanos por WhatsApp lo antes posible. Los cambios de horario están sujetos a disponibilidad del vehículo. Si el cambio se realiza con más de 24 horas de anticipación, no hay cargo adicional.',
  },
  {
    q: '¿Qué pasa si necesito cancelar?',
    a: 'Cancelaciones con más de 24 horas de anticipación pueden ser reembolsadas o reprogramadas. Cancelaciones dentro de las 24 horas previas al servicio no son reembolsables. La reserva solo queda confirmada cuando el pago es aprobado.',
  },
  {
    q: '¿Cómo pago?',
    a: 'El pago se realiza online de forma segura a través de Wompi Colombia. Se paga el 50% al momento de reservar y el saldo restante antes de iniciar el viaje.',
  },
  {
    q: '¿El vehículo se comparte con otros pasajeros?',
    a: 'No. El servicio es completamente privado. El vehículo es exclusivo para tu grupo durante todo el trayecto.',
  },
  {
    q: '¿Con cuánta anticipación debo reservar?',
    a: 'Se requiere un mínimo de 6 horas de anticipación. Puedes reservar hasta 60 días antes de la fecha del viaje. Recomendamos reservar con al menos 24 horas de anticipación para garantizar disponibilidad.',
  },
  {
    q: '¿Puedo pedir el vehículo para una hora muy temprana o muy tarde?',
    a: 'Los servicios están disponibles de 6:00 a.m. a 8:00 p.m. Si necesitas un horario especial fuera de ese rango, contáctanos directamente por WhatsApp.',
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-foreground text-sm sm:text-base">{q}</span>
        <ChevronDown
          size={18}
          className={cn(
            'text-muted-foreground flex-shrink-0 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          open ? 'max-h-48 opacity-100 pb-5' : 'max-h-0 opacity-0'
        )}
      >
        <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

export function FAQSection() {
  return (
    <section id="faq" className="py-24 lg:py-32 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">
            Preguntas frecuentes
          </p>
          <h2
            className="text-4xl lg:text-5xl font-light text-foreground"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Todo lo que necesitas saber
          </h2>
        </div>

        <div className="bg-white rounded-xl border border-border p-2 sm:p-4 shadow-sm">
          {faqs.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  )
}
