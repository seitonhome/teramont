import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Consultar mi reserva',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://teramont.seitonhome.com/mi-reserva' },
}

export default function MiReservaLayout({ children }: { children: React.ReactNode }) {
  return children
}
