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

const BASE = 'https://teramont.seitonhome.com'

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${BASE}/#organization`,
  name: 'Teramont Private Rides',
  description:
    'Servicio de traslados privados premium en Volkswagen Teramont 2024 entre Cartagena, Barú y Barranquilla. Puerta a puerta, sin compartir vehículo, confirmación inmediata.',
  url: BASE,
  telephone: '+573145445117',
  email: 'servicioalcliente@seitonhome.com',
  logo: `${BASE}/android-chrome-192x192.png`,
  image: `${BASE}/t1.jpg`,
  priceRange: '$$',
  currenciesAccepted: 'COP',
  paymentAccepted: 'Tarjeta de crédito, PSE, Nequi, Efectivo',
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
  ],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '5',
    bestRating: '5',
    worstRating: '1',
  },
  review: [
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Valentina Ospina' },
      datePublished: '2025-03-15',
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody:
        'Fuimos 4 personas de Cartagena a Barranquilla y el servicio fue excelente. El carro impecable, llegaron puntual y el conductor muy amable. Sin duda lo volvemos a usar.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Carlos M.' },
      datePublished: '2025-04-10',
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Todo perfecto. Reservé por la página sin problema y el pago fue rápido. Llegaron a la hora exacta.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Daniela Ruiz' },
      datePublished: '2025-01-20',
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Viajé con mi mamá y mis dos hijos a Barú. Cómodos, sin estrés, sin paradas. Vale cada peso.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Jorge Peña' },
      datePublished: '2025-02-08',
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody:
        'Usé este servicio para ir a Cartagena por trabajo. Puntual, el carro en perfectas condiciones y el conductor muy profesional. Recomendado 100%.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Laura T.' },
      datePublished: '2025-05-02',
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody:
        'La verdad no esperaba que fuera tan fácil reservar. El proceso online rapidísimo y el viaje sin ningún contratiempo.',
    },
  ],
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
        <Routes />
        <Reviews />
        <HowItWorks />
        <PricingBanner />
        <FAQSection />
      </main>
      <Footer />
    </>
  )
}
