import {
  Car,
  MapPin,
  Users,
  Wind,
  Luggage,
  Clock,
  Shield,
  Star,
} from 'lucide-react'

const benefits = [
  {
    icon: Car,
    title: 'Vehículo exclusivo',
    description:
      'Volkswagen Teramont 2024 reservado solo para ti. Sin compartir con desconocidos.',
  },
  {
    icon: MapPin,
    title: 'Puerta a puerta',
    description:
      'Te recogemos en tu dirección exacta y te dejamos en tu destino. Sin rodeos.',
  },
  {
    icon: Users,
    title: 'Para todos',
    description:
      'Ideal para familias, parejas, turistas y ejecutivos. Hasta 5 pasajeros cómodos.',
  },
  {
    icon: Wind,
    title: 'Aire acondicionado',
    description:
      'Viaja fresco y cómodo durante todo el trayecto, sin importar el clima caribeño.',
  },
  {
    icon: Luggage,
    title: 'Amplio espacio',
    description:
      'Maletero espacioso para tu equipaje. No dejes nada atrás por falta de espacio.',
  },
  {
    icon: Clock,
    title: 'Sin esperas',
    description:
      'Tu servicio empieza cuando lo programaste. Puntualidad y respeto por tu tiempo.',
  },
  {
    icon: Shield,
    title: 'Reserva segura',
    description:
      'Pago online protegido con Wompi. Tu transacción es privada y segura.',
  },
  {
    icon: Star,
    title: 'Experiencia premium',
    description:
      'Desde el primer mensaje hasta llegar a tu destino, cada detalle cuenta.',
  },
]

export function Benefits() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">
            Por qué elegirnos
          </p>
          <h2
            className="text-4xl lg:text-5xl font-light text-foreground mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Confort premium en cada kilómetro
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            Cada detalle de tu viaje ha sido pensado para que llegues relajado,
            puntual y con una experiencia que vale la pena recordar.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <div
                key={benefit.title}
                className="group p-6 lg:p-8 rounded-lg border border-border bg-background hover:border-gold/40 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-sm bg-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
                  <Icon size={22} className="text-gold" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-base">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
