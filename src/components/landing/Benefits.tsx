import { Car, MapPin, Users, Wind, Luggage, Clock, Shield, Star } from 'lucide-react'
import { getLocale } from '@/lib/locale-server'
import { translations } from '@/lib/i18n'

const icons = [Car, MapPin, Users, Wind, Luggage, Clock, Shield, Star]

export async function Benefits() {
  const locale = await getLocale()
  const b = translations[locale].benefits

  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 lg:mb-20">
          <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">
            {b.sectionLabel}
          </p>
          <h2 className="text-4xl lg:text-5xl font-light text-foreground mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            {b.title}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            {b.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {b.items.map((item, i) => {
            const Icon = icons[i] || Car
            return (
              <div
                key={item.title}
                className="group p-6 lg:p-8 rounded-lg border border-border bg-background hover:border-gold/40 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-sm bg-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
                  <Icon size={22} className="text-gold" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-base">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
