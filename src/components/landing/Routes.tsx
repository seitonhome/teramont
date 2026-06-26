import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCOP, minutesToHoursLabel } from '@/lib/utils'
import { createServiceClient } from '@/lib/supabase/server'

const ROUTE_HIGHLIGHTS: Record<string, string> = {
  'cartagena-barranquilla': 'Ruta más popular',
  'cartagena-baru': 'Paraíso caribeño',
}

async function getRoutes() {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('routes')
      .select(`
        id, estimated_duration_minutes, buffer_minutes, base_price_cop, active,
        origin:origin_location_id(id, name, slug),
        destination:destination_location_id(id, name, slug)
      `)
      .eq('active', true)
      .order('estimated_duration_minutes')

    return data || []
  } catch {
    return []
  }
}

export async function Routes() {
  const routes = await getRoutes()

  const displayRoutes =
    routes.length > 0
      ? routes
      : // Fallback estático si Supabase no está configurado
        [
          { id: '1', from: 'Cartagena', to: 'Barranquilla', duration: 150, price: 450000, slug: 'cartagena-barranquilla' },
          { id: '2', from: 'Barranquilla', to: 'Cartagena', duration: 150, price: 450000, slug: 'barranquilla-cartagena' },
          { id: '3', from: 'Cartagena', to: 'Barú', duration: 105, price: 450000, slug: 'cartagena-baru' },
          { id: '4', from: 'Barú', to: 'Cartagena', duration: 105, price: 450000, slug: 'baru-cartagena' },
          { id: '5', from: 'Barranquilla', to: 'Barú', duration: 225, price: 450000, slug: 'barranquilla-baru' },
          { id: '6', from: 'Barú', to: 'Barranquilla', duration: 225, price: 450000, slug: 'baru-barranquilla' },
        ]

  const normalizeRoute = (r: Record<string, unknown>) => {
    if ('from' in r) {
      return {
        id: r.id as string,
        fromName: r.from as string,
        toName: r.to as string,
        duration: r.duration as number,
        price: r.price as number,
        slug: r.slug as string,
      }
    }
    const origin = r.origin as { name: string; slug: string }
    const destination = r.destination as { name: string; slug: string }
    return {
      id: r.id as string,
      fromName: origin?.name || '',
      toName: destination?.name || '',
      duration: r.estimated_duration_minutes as number,
      price: Number(r.base_price_cop),
      slug: `${origin?.slug}-${destination?.slug}`,
    }
  }

  return (
    <section id="rutas" className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">
            Destinos disponibles
          </p>
          <h2
            className="text-4xl lg:text-5xl font-light text-foreground mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Rutas disponibles
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-base">
            Servicio de traslado privado entre las principales ciudades de la
            costa Caribe colombiana.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayRoutes.map((rawRoute) => {
            const route = normalizeRoute(rawRoute as Record<string, unknown>)
            const highlight = ROUTE_HIGHLIGHTS[route.slug]

            return (
              <div
                key={route.id}
                className="relative group rounded-lg border border-border bg-card hover:border-gold/50 hover:shadow-xl hover:shadow-gold/5 transition-all duration-300 overflow-hidden"
              >
                {highlight && (
                  <div className="absolute top-4 right-4 px-2.5 py-1 bg-gold/10 text-gold text-xs font-medium rounded-full border border-gold/20">
                    {highlight}
                  </div>
                )}

                <div className="p-6 lg:p-7">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex flex-col items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-gold" />
                      <span className="w-px h-8 bg-border" />
                      <span className="w-2.5 h-2.5 rounded-sm bg-foreground" />
                    </div>
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Desde</p>
                        <p className="font-semibold text-foreground text-lg">{route.fromName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Hasta</p>
                        <p className="font-semibold text-foreground text-lg">{route.toName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                      <Clock size={14} />
                      <span>~{minutesToHoursLabel(route.duration)}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-0.5">Por vehículo</p>
                      <p className="text-xl font-semibold text-foreground">
                        {formatCOP(route.price)}
                      </p>
                    </div>
                  </div>

                  <Button
                    asChild
                    className="w-full bg-foreground hover:bg-foreground/90 text-background group-hover:bg-gold group-hover:hover:bg-gold/90 transition-colors"
                  >
                    <Link href={`/reservar?from=${route.fromName}&to=${route.toName}`}>
                      Reservar esta ruta
                      <ArrowRight size={16} />
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-center text-muted-foreground text-sm mt-8">
          Tarifa por vehículo, no por persona. Sin cargos ocultos.
        </p>
      </div>
    </section>
  )
}
