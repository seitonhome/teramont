import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatCOP } from '@/lib/utils'
import { ArrowRight, Check } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'

const included = [
  'Vehículo privado exclusivo',
  'Hasta 5 pasajeros',
  'Equipaje incluido',
  'Aire acondicionado',
  'Servicio puerta a puerta',
  'Sin esperas ni rodeos',
]

async function getPricingData() {
  try {
    const supabase = createServiceClient()
    const { data: settings } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['deposit_percentage'])

    const depositPct = parseInt(
      settings?.find((s: { key: string; value: string }) => s.key === 'deposit_percentage')?.value || '50'
    )

    // Get the lowest base price (all routes have the same price, but this is future-proof)
    const { data: routes } = await supabase
      .from('routes')
      .select('base_price_cop')
      .eq('active', true)
      .order('base_price_cop', { ascending: true })
      .limit(1)

    const basePrice = routes?.[0]?.base_price_cop ? Number(routes[0].base_price_cop) : 450000

    return { basePrice, depositPct }
  } catch {
    return { basePrice: 450000, depositPct: 50 }
  }
}

export async function PricingBanner() {
  const { basePrice, depositPct } = await getPricingData()
  const depositAmount = Math.round(basePrice * (depositPct / 100))
  const balanceAmount = basePrice - depositAmount

  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gold/20 overflow-hidden bg-gradient-to-br from-stone-50 to-amber-50/30 shadow-2xl shadow-gold/5">
          <div className="grid lg:grid-cols-2">
            {/* Left */}
            <div className="p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-gold/15">
              <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">
                Tarifa única
              </p>
              <h2
                className="text-4xl lg:text-5xl font-light text-foreground mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {formatCOP(basePrice)}
              </h2>
              <p className="text-muted-foreground mb-1">
                Por vehículo · No por persona
              </p>
              <p className="text-sm text-gold font-medium mb-8">
                Paga solo el {depositPct}% para reservar
              </p>

              <div className="space-y-2 mb-8 p-4 rounded-lg bg-white border border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Anticipo para reservar</span>
                  <span className="font-semibold text-foreground">{formatCOP(depositAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Saldo al inicio del viaje</span>
                  <span className="font-semibold text-foreground">{formatCOP(balanceAmount)}</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span>{formatCOP(basePrice)}</span>
                </div>
              </div>

              <Button asChild size="lg" className="w-full bg-gold hover:bg-gold/90 text-white h-13 text-base">
                <Link href="/reservar">
                  Reservar con {formatCOP(depositAmount)}
                  <ArrowRight size={18} />
                </Link>
              </Button>
            </div>

            {/* Right */}
            <div className="p-10 lg:p-14">
              <p className="text-xs tracking-[0.3em] uppercase font-medium text-muted-foreground mb-6">
                Incluido en el servicio
              </p>
              <ul className="space-y-4">
                {included.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-gold" />
                    </div>
                    <span className="text-foreground text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  El precio es fijo por vehículo, sin importar el número de
                  pasajeros. Las tarifas se actualizan desde el panel
                  administrativo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
