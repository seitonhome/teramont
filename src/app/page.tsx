export const dynamic = 'force-dynamic'

import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Benefits } from '@/components/landing/Benefits'
import { Routes } from '@/components/landing/Routes'
import { Reviews } from '@/components/landing/Reviews'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { PricingBanner } from '@/components/landing/PricingBanner'
import { FAQSection } from '@/components/landing/FAQ'
import { Footer } from '@/components/landing/Footer'
import { CarGallery } from '@/components/landing/CarGallery'
import { VehicleLocationBadge } from '@/components/landing/VehicleLocationBadge'

const BASE = 'https://teramont.seitonhome.com'

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${BASE}/#organization`,
  name: 'Teramont Private Rides',
  description:
    'Servicio de traslados privados premium en Volkswagen Teramont 2024 entre Cartagena, Barú, Barranquilla y Santa Marta. Puerta a puerta, sin compartir vehículo, confirmación inmediata.',
  url: BASE,
  telephone: '+573145445117',
  email: 'servicioalcliente@seitonhome.com',
  logo: `${BASE}/android-chrome-192x192.png`,
  image: [`${BASE}/og-teramont.jpg`, `${BASE}/t2.jpg`, `${BASE}/t3.jpg`],
  priceRange: '$$',
  currenciesAccepted: 'COP',
  paymentAccepted: 'Tarjeta de crédito, Tarjeta débito, PSE, Nequi, Efectivo, Transferencia',
  knowsLanguage: ['es', 'en'],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Cartagena de Indias',
    addressRegion: 'Bolívar',
    postalCode: '130001',
    addressCountry: 'CO',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 10.391049,
    longitude: -75.479426,
  },
  areaServed: [
    { '@type': 'City', name: 'Cartagena de Indias' },
    { '@type': 'City', name: 'Barranquilla' },
    { '@type': 'Place', name: 'Barú' },
    { '@type': 'City', name: 'Santa Marta' },
  ],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Rutas de traslado privado Costa Caribe Colombia',
    itemListElement: [
      {
        '@type': 'Offer',
        name: 'Traslado privado Cartagena — Barranquilla',
        itemOffered: {
          '@type': 'Service',
          name: 'Traslado privado Cartagena a Barranquilla',
          serviceType: 'Transporte privado',
          provider: { '@type': 'LocalBusiness', '@id': `${BASE}/#organization` },
        },
        price: '450000',
        priceCurrency: 'COP',
        availability: 'https://schema.org/InStock',
        url: `${BASE}/reservar`,
      },
      {
        '@type': 'Offer',
        name: 'Traslado privado Cartagena — Barú',
        itemOffered: {
          '@type': 'Service',
          name: 'Traslado privado Cartagena a Barú',
          serviceType: 'Transporte privado',
          provider: { '@type': 'LocalBusiness', '@id': `${BASE}/#organization` },
        },
        price: '150000',
        priceCurrency: 'COP',
        availability: 'https://schema.org/InStock',
        url: `${BASE}/reservar`,
      },
      {
        '@type': 'Offer',
        name: 'Traslado privado Barranquilla — Barú',
        itemOffered: {
          '@type': 'Service',
          name: 'Traslado privado Barranquilla a Barú',
          serviceType: 'Transporte privado',
          provider: { '@type': 'LocalBusiness', '@id': `${BASE}/#organization` },
        },
        price: '550000',
        priceCurrency: 'COP',
        availability: 'https://schema.org/InStock',
        url: `${BASE}/reservar`,
      },
      {
        '@type': 'Offer',
        name: 'Traslado privado Cartagena — Santa Marta',
        itemOffered: {
          '@type': 'Service',
          name: 'Traslado privado Cartagena a Santa Marta',
          serviceType: 'Transporte privado',
          provider: { '@type': 'LocalBusiness', '@id': `${BASE}/#organization` },
        },
        price: '620000',
        priceCurrency: 'COP',
        availability: 'https://schema.org/InStock',
        url: `${BASE}/reservar`,
      },
    ],
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE}/#website`,
  url: BASE,
  name: 'Teramont Private Rides',
  description: 'Traslados privados premium en la Costa Caribe Colombiana',
  inLanguage: 'es-CO',
  publisher: { '@type': 'LocalBusiness', '@id': `${BASE}/#organization` },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Navbar />
      <main>
        <Hero />
        <Benefits />
        <CarGallery />
        <Routes />
        <Reviews />
        <HowItWorks />
        <PricingBanner />
        <FAQSection />
      </main>
      <Footer />
      <VehicleLocationBadge />
    </>
  )
}
