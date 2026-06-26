import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Elige tu ruta',
    description:
      'Selecciona origen y destino entre Cartagena, Barú y Barranquilla.',
  },
  {
    number: '02',
    title: 'Selecciona fecha y hora',
    description:
      'El sistema muestra únicamente los horarios disponibles reales según la ubicación del vehículo.',
  },
  {
    number: '03',
    title: 'Reserva con el 50%',
    description:
      'Paga el 50% del servicio online para confirmar tu reserva de forma segura con Wompi.',
  },
  {
    number: '04',
    title: 'Recibe confirmación',
    description:
      'Inmediatamente recibes el código de reserva, los detalles del viaje y acceso por WhatsApp.',
  },
  {
    number: '05',
    title: 'Viaja tranquilo',
    description:
      'El vehículo llega a tu dirección. Paga el saldo restante antes de iniciar el trayecto.',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 lg:py-32 bg-stone-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">
            Simple y transparente
          </p>
          <h2
            className="text-4xl lg:text-5xl font-light text-white mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Cómo funciona
          </h2>
          <p className="text-stone-400 max-w-lg mx-auto text-base">
            Reservar tu viaje privado es rápido y sencillo. Sin llamadas, sin
            negociación, sin sorpresas.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {/* Number circle */}
                <div className="relative w-16 h-16 rounded-full border border-gold/30 bg-stone-900 flex items-center justify-center mb-5 z-10">
                  <span
                    className="text-gold text-lg font-light"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {step.number}
                  </span>
                </div>

                <h3 className="font-semibold text-white mb-2 text-base">
                  {step.title}
                </h3>
                <p className="text-stone-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Button
            asChild
            size="lg"
            className="bg-gold hover:bg-gold/90 text-white px-10 h-14 text-base tracking-wide"
          >
            <Link href="/reservar">
              Reservar ahora
              <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
