import Link from 'next/link'
import { ArrowRight, Clock, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCOP, minutesToHoursLabel } from '@/lib/utils'
import { createServiceClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/locale-server'
import { translations } from '@/lib/i18n'

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
  const locale = await getLocale()
  const r = translations[locale].routes
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573001234567'

  const routes = await getRoutes()

  const displayRoutes =
    routes.length > 0
      ? routes
      : [
          { id: '1', from: 'Cartagena', to: 'Barranquilla', duration: 150, price: 450000, slug: 'cartagena-barranquilla' },
          { id: '2', from: 'Barranquilla', to: 'Cartagena', duration: 150, price: 450000, slug: 'barranquilla-cartagena' },
          { id: '3', from: 'Cartagena', to: 'Barú', duration: 105, price: 150000, slug: 'cartagena-baru' },
          { id: '4', from: 'Barú', to: 'Cartagena', duration: 105, price: 150000, slug: 'baru-cartagena' },
          { id: '5', from: 'Barranquilla', to: 'Barú', duration: 225, price: 550000, slug: 'barranquilla-baru' },
          { id: '6', from: 'Barú', to: 'Barranquilla', duration: 225, price: 550000, slug: 'baru-barranquilla' },
        ]

  const normalizeRoute = (route: Record<string, unknown>) => {
    if ('from' in route) {
      return {
        id: route.id as string,
        fromName: route.from as string,
        toName: route.to as string,
        duration: route.duration as number,
        price: route.price as number,
        slug: route.slug as string,
      }
    }
    const origin = route.origin as { name: string; slug: string }
    const destination = route.destination as { name: string; slug: string }
    return {
      id: route.id as string,
      fromName: origin?.name || '',
      toName: destination?.name || '',
      duration: route.estimated_duration_minutes as number,
      price: Number(route.base_price_cop),
      slug: `${origin?.slug}-${destination?.slug}`,
    }
  }

  return (
    <section id="rutas" className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">
            {r.sectionLabel}
          </p>
          <h2
            className="text-4xl lg:text-5xl font-light text-foreground mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {r.title}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-base">
            {r.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayRoutes.map((rawRoute) => {
            const route = normalizeRoute(rawRoute as Record<string, unknown>)
            const highlight = r.highlights[route.slug as keyof typeof r.highlights]
            const description = r.descriptions[route.slug as keyof typeof r.descriptions]

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
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">{r.from}</p>
                        <p className="font-semibold text-foreground text-lg">{route.fromName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">{r.to}</p>
                        <p className="font-semibold text-foreground text-lg">{route.toName}</p>
                      </div>
                    </div>
                  </div>

                  {description && (
                    <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                      {description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                      <Clock size={14} />
                      <span>~{minutesToHoursLabel(route.duration)}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-0.5">{r.perVehicle}</p>
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
                      {r.bookRoute}
                      <ArrowRight size={16} />
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-center text-muted-foreground text-sm mt-8">
          {r.priceNote}
        </p>

        {/* Custom destination CTA */}
        <div className="mt-16 rounded-2xl border border-gold/20 p-8 lg:p-10 text-center" style={{ background: 'linear-gradient(135deg, rgba(193,148,54,0.06) 0%, rgba(10,22,40,0.04) 100%)' }}>
          <p className="text-xl font-light text-foreground mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            {r.customDestTitle}
          </p>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            {r.customDestSub}
          </p>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-sm text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ background: '#25D366' }}
          >
            <MessageCircle size={16} />
            {r.customDestCta}
          </a>
        </div>
      </div>
    </section>
  )
}
