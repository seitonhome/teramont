import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { FAQSection } from '@/components/landing/FAQ'
import { getLocale } from '@/lib/locale-server'
import { translations } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Preguntas Frecuentes',
  description:
    'Resuelve tus dudas sobre el servicio de traslados privados Teramont: capacidad, equipaje, pagos, cancelaciones y más.',
  alternates: { canonical: 'https://teramont.seitonhome.com/faq' },
  openGraph: {
    title: 'Preguntas Frecuentes | Teramont Private Rides',
    description:
      'Todo lo que necesitas saber sobre nuestros traslados privados entre Cartagena, Barú y Barranquilla.',
    url: 'https://teramont.seitonhome.com/faq',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántas personas pueden viajar?',
      acceptedAnswer: { '@type': 'Answer', text: 'La Volkswagen Teramont tiene capacidad para hasta 5 pasajeros con equipaje estándar. Si el grupo es más grande, contáctanos por WhatsApp.' },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto equipaje puedo llevar?',
      acceptedAnswer: { '@type': 'Answer', text: 'El vehículo tiene amplio maletero. Puedes llevar maletas grandes sin problema. Si tienes equipaje voluminoso especial, infórmanos al reservar.' },
    },
    {
      '@type': 'Question',
      name: '¿Con cuánta anticipación debo reservar?',
      acceptedAnswer: { '@type': 'Answer', text: 'Mínimo 6 horas antes del viaje. Recomendamos reservar con al menos 24 horas de anticipación para garantizar disponibilidad, especialmente en temporada alta.' },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el pago del anticipo?',
      acceptedAnswer: { '@type': 'Answer', text: 'Pagas el 50% online vía Wompi (tarjeta débito/crédito, PSE, Nequi) al confirmar la reserva. El saldo restante lo pagas en efectivo o transferencia antes de iniciar el viaje.' },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasa si necesito cancelar?',
      acceptedAnswer: { '@type': 'Answer', text: 'Cancelaciones con más de 24 horas de anticipación: reembolso o reagendamiento sin costo. Cancelaciones con menos de 24 horas: el anticipo no es reembolsable.' },
    },
    {
      '@type': 'Question',
      name: '¿El precio es por persona o por vehículo?',
      acceptedAnswer: { '@type': 'Answer', text: 'El precio es fijo por vehículo, sin importar cuántas personas viajen. Si van 2 o van 5, la tarifa es la misma.' },
    },
  ],
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://teramont.seitonhome.com' },
    { '@type': 'ListItem', position: 2, name: 'Preguntas frecuentes', item: 'https://teramont.seitonhome.com/faq' },
  ],
}

export default async function FAQPage() {
  const locale = await getLocale()
  const p = translations[locale].pages.faq

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar forceDark />
      <main className="min-h-screen bg-background pt-20">
        <div className="text-white py-14" style={{ background: 'linear-gradient(135deg, #060F1E 0%, #0A1628 100%)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">{p.label}</p>
            <h1 className="text-4xl font-light text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {p.title}
            </h1>
          </div>
        </div>
        <FAQSection />
      </main>
      <Footer />
    </>
  )
}
