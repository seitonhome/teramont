import Link from 'next/link'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowRight, MessageCircle } from 'lucide-react'

export default function ReservaErrorPage() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573001234567'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={36} className="text-red-500" />
          </div>
          <h1
            className="text-3xl font-light text-foreground mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Algo salió mal
          </h1>
          <p className="text-muted-foreground mb-8">
            Hubo un problema al procesar tu reserva. No se realizó ningún cobro.
            Por favor intenta de nuevo o contáctanos directamente.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-white">
              <Link href="/reservar">
                Intentar de nuevo
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a
                href={`https://wa.me/${whatsapp}?text=Hola, tuve un problema al reservar mi viaje.`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={18} />
                Escribir por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
