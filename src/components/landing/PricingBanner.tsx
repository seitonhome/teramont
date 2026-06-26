import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatCOP } from '@/lib/utils'
import { ArrowRight, Check } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/locale-server'
import { translations } from '@/lib/i18n'

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

    const { data: routes } = await supabase
      .from('routes')
      .select('base_price_cop')
      .eq('active', true)
      .order('base_price_cop', { ascending: true })

    const prices = routes?.map((r) => Number(r.base_price_cop)) || []
    const minPrice = prices.length > 0 ? Math.min(...prices) : 150000
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 550000

    return { minPrice, maxPrice, depositPct }
  } catch {
    return { minPrice: 150000, maxPrice: 550000, depositPct: 50 }
  }
}

export async function PricingBanner() {
  const locale = await getLocale()
  const p = translations[locale].pricing

  const { minPrice, maxPrice, depositPct } = await getPricingData()
  const minDeposit = Math.round(minPrice * (depositPct / 100))

  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gold/20 overflow-hidden shadow-2xl shadow-gold/5" style={{ background: 'linear-gradient(135deg, #fdfcf8 0%, #faf7ef 100%)' }}>
          <div className="grid lg:grid-cols-2">
            {/* Left */}
            <div className="p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-gold/15">
              <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">
                {p.sectionLabel}
              </p>

              {/* Price range */}
              <div className="mb-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{p.from}</p>
                <h2
                  className="text-5xl lg:text-6xl font-light text-foreground"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {formatCOP(minPrice)}
                </h2>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-px bg-gold/40" />
                <p className="text-sm text-muted-foreground">
                  {p.to} <span className="font-semibold text-foreground">{formatCOP(maxPrice)}</span>
                </p>
              </div>
              <p className="text-muted-foreground text-sm mb-1">{p.perVehicle}</p>
              <p className="text-sm text-gold font-medium mb-8">
                {p.depositLabel} {depositPct}% {p.depositSuffix}
              </p>

              {/* Deposit info */}
              <div className="space-y-2 mb-8 p-4 rounded-lg bg-white border border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{p.depositFrom}</span>
                  <span className="font-semibold text-foreground">{formatCOP(minDeposit)}</span>
                </div>
                <div className="h-px bg-border" />
                <p className="text-xs text-muted-foreground">
                  {p.total}: {formatCOP(minPrice)} — {formatCOP(maxPrice)}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button asChild size="lg" className="w-full bg-gold hover:bg-gold/90 text-white h-13 text-base">
                  <Link href="/reservar">
                    {p.cta}
                    <ArrowRight size={18} />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full h-11">
                  <Link href="/rutas">
                    {p.viewRoutes}
                    <ArrowRight size={16} />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right */}
            <div className="p-10 lg:p-14">
              <p className="text-xs tracking-[0.3em] uppercase font-medium text-muted-foreground mb-6">
                {p.included}
              </p>
              <ul className="space-y-4">
                {p.items.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-gold" />
                    </div>
                    <span className="text-foreground text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">{p.note}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
