import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Routes } from '@/components/landing/Routes'
import { PricingBanner } from '@/components/landing/PricingBanner'
import { getLocale } from '@/lib/locale-server'
import { translations } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Rutas y Tarifas',
  description:
    'Vive el Caribe a tu ritmo: rutas de traslado privado entre Cartagena, Barú y Barranquilla. Precios fijos por vehículo, sin cargos ocultos.',
  alternates: {
    canonical: 'https://teramont.seitonhome.com/rutas',
  },
  openGraph: {
    title: 'Rutas y Tarifas | Teramont Private Rides',
    description:
      'El Caribe sin filas ni sorpresas: traslados privados Cartagena ↔ Barranquilla, Cartagena ↔ Barú y más. Precio fijo por vehículo, hasta 5 pasajeros.',
    url: 'https://teramont.seitonhome.com/rutas',
  },
}

const rutasSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Rutas de traslado privado Costa Caribe Colombia',
  description: 'Traslados privados en Volkswagen Teramont 2024 entre las principales ciudades de la costa Caribe',
  url: 'https://teramont.seitonhome.com/rutas',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Service',
        name: 'Traslado privado Cartagena — Barranquilla',
        description: 'Traslado privado en Volkswagen Teramont de Cartagena a Barranquilla. Precio fijo por vehículo, hasta 5 pasajeros, puerta a puerta.',
        provider: { '@type': 'LocalBusiness', name: 'Teramont Private Rides', url: 'https://teramont.seitonhome.com' },
        areaServed: [{ '@type': 'City', name: 'Cartagena' }, { '@type': 'City', name: 'Barranquilla' }],
        offers: { '@type': 'Offer', price: '450000', priceCurrency: 'COP', url: 'https://teramont.seitonhome.com/reservar' },
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'Service',
        name: 'Traslado privado Cartagena — Barú',
        description: 'Traslado privado en Volkswagen Teramont de Cartagena a Barú. Precio fijo por vehículo.',
        provider: { '@type': 'LocalBusiness', name: 'Teramont Private Rides', url: 'https://teramont.seitonhome.com' },
        areaServed: [{ '@type': 'City', name: 'Cartagena' }, { '@type': 'Place', name: 'Barú' }],
        offers: { '@type': 'Offer', price: '150000', priceCurrency: 'COP', url: 'https://teramont.seitonhome.com/reservar' },
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'Service',
        name: 'Traslado privado Barranquilla — Barú',
        description: 'Traslado privado en Volkswagen Teramont de Barranquilla a Barú. Precio fijo por vehículo.',
        provider: { '@type': 'LocalBusiness', name: 'Teramont Private Rides', url: 'https://teramont.seitonhome.com' },
        areaServed: [{ '@type': 'City', name: 'Barranquilla' }, { '@type': 'Place', name: 'Barú' }],
        offers: { '@type': 'Offer', price: '550000', priceCurrency: 'COP', url: 'https://teramont.seitonhome.com/reservar' },
      },
    },
  ],
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://teramont.seitonhome.com' },
    { '@type': 'ListItem', position: 2, name: 'Rutas y tarifas', item: 'https://teramont.seitonhome.com/rutas' },
  ],
}

export default async function RutasPage() {
  const locale = await getLocale()
  const p = translations[locale].pages.routes

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(rutasSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar forceDark />
      <main className="min-h-screen bg-background pt-20">
        <div className="text-white py-14" style={{ background: 'linear-gradient(135deg, #060F1E 0%, #0A1628 100%)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">{p.label}</p>
            <h1 className="text-4xl font-light text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              {p.title}
            </h1>
            <p style={{ color: 'rgb(140 165 200)' }}>{p.subtitle}</p>
          </div>
        </div>
        <Routes />
        <PricingBanner />
      </main>
      <Footer />
    </>
  )
}
