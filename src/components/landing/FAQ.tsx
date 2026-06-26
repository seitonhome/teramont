'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getLocaleClient } from '@/lib/locale'
import { translations } from '@/lib/i18n'

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <button className="w-full flex items-center justify-between py-5 text-left gap-4" onClick={() => setOpen(!open)}>
        <span className="font-medium text-foreground text-sm sm:text-base">{q}</span>
        <ChevronDown size={18} className={cn('text-muted-foreground flex-shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      <div className={cn('overflow-hidden transition-all duration-300', open ? 'max-h-48 opacity-100 pb-5' : 'max-h-0 opacity-0')}>
        <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

export function FAQSection() {
  const locale = getLocaleClient()
  const f = translations[locale].faq

  return (
    <section id="faq" className="py-24 lg:py-32 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">{f.sectionLabel}</p>
          <h2 className="text-4xl lg:text-5xl font-light text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
            {f.title}
          </h2>
        </div>

        <div className="bg-white rounded-xl border border-border p-2 sm:p-4 shadow-sm">
          {f.items.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  )
}
