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
    default: 'Teramont Private Rides — Traslados Privados Cartagena · Barú · Barranquilla',
  },
  description:
    'Traslados privados premium en Volkswagen Teramont 2024 entre Cartagena, Barú y Barranquilla. Solo tú y tu grupo, puerta a puerta, con confirmación inmediata y pago seguro.',

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
      'Muévete entre Cartagena, Barú y Barranquilla en Volkswagen Teramont 2024. Privado, puntual y con confirmación inmediata.',
    images: [
      {
        url: '/t1.jpg',
        alt: 'Volkswagen Teramont 2024 — Teramont Private Rides',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Teramont Private Rides — Traslados Privados Costa Caribe',
    description:
      'Traslados privados entre Cartagena, Barú y Barranquilla. Volkswagen Teramont 2024. Reserva online en minutos.',
    images: ['/t1.jpg'],
  },

  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'android-chrome-192', url: '/android-chrome-192x192.png' },
      { rel: 'android-chrome-512', url: '/android-chrome-512x512.png' },
    ],
  },
  manifest: '/site.webmanifest',

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
