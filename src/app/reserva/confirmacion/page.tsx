import { Suspense } from 'react'
import { ConfirmationClient } from './ConfirmationClient'

export const metadata = {
  title: 'Tu viaje confirmado — Teramont Private Rides',
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
      </div>
    }>
      <ConfirmationClient />
    </Suspense>
  )
}
