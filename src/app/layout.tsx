import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

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

export const metadata: Metadata = {
  title: 'Teramont Private Rides — Viajes privados premium',
  description:
    'Viajes privados premium entre Cartagena, Barú y Barranquilla en Volkswagen Teramont 2024. Reserva tu traslado con anticipación y viaja cómodo, tranquilo y sin compartir el vehículo.',
  keywords:
    'viajes privados Cartagena, traslado Barranquilla, transporte privado Barú, Volkswagen Teramont, viajes ejecutivos Colombia',
  openGraph: {
    title: 'Teramont Private Rides',
    description:
      'Viajes privados premium entre Cartagena, Barú y Barranquilla.',
    type: 'website',
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
        <Toaster />
      </body>
    </html>
  )
}
