import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { WhatsAppButton } from '@/components/WhatsAppButton'

const inter = Inter({
  variable: '--font-sans-custom',
  subsets: ['latin'],
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const BASE = 'https://teramont.seitonhome.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE),

  title: {
    template: '%s | Teramont Private Rides',
    default: 'Transporte privado en Cartagena y el Caribe | Teramont Private Rides',
  },
  description:
    'Traslados privados en Volkswagen Teramont 2024 entre Cartagena, Barú, Barranquilla y Santa Marta. Precio fijo por vehículo, puerta a puerta, reserva online y pago seguro.',

  keywords: [
    'transporte privado Cartagena',
    'traslado privado Barranquilla',
    'transporte privado Barú',
    'traslado Cartagena Barranquilla',
    'van privada Cartagena Colombia',
    'transfer privado costa Caribe Colombia',
    'Volkswagen Teramont transporte',
    'viaje privado Cartagena turistas',
    'private transfer Cartagena Colombia',
    'private transport Caribbean coast Colombia',
    'traslado aeropuerto Cartagena',
    'traslado privado Cartagena Santa Marta',
    'transporte ejecutivo Cartagena',
  ],

  authors: [{ name: 'Teramont Private Rides' }],
  creator: 'Teramont Private Rides',
  publisher: 'Teramont Private Rides',

  alternates: {
    canonical: '/',
  },

  openGraph: {
    type: 'website',
    url: BASE,
    siteName: 'Teramont Private Rides',
    locale: 'es_CO',
    title: 'Teramont Private Rides — Traslados Privados en la Costa Caribe',
    description:
      'El Caribe a tu ritmo: Cartagena, Barú, Barranquilla y Santa Marta en tu propia Volkswagen Teramont 2024. Privado, puntual y sin compartir con nadie.',
    images: [
      {
        url: '/og-teramont.jpg',
        width: 1200,
        height: 630,
        alt: 'Volkswagen Teramont 2024 frente a la Torre del Reloj de Cartagena',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Teramont Private Rides — Traslados Privados Costa Caribe',
    description:
      'El Caribe a tu ritmo. Traslados privados entre Cartagena, Barú, Barranquilla y Santa Marta en Volkswagen Teramont 2024. Reserva online en minutos.',
    images: ['/og-teramont.jpg'],
  },

  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',

  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  }),

  other: {
    'geo.region': 'CO-BOL',
    'geo.placename': 'Cartagena de Indias, Bolívar, Colombia',
    'geo.position': '10.391049;-75.479426',
    'ICBM': '10.391049, -75.479426',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${cormorant.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <WhatsAppButton />
        <Toaster />
      </body>
    </html>
  )
}
