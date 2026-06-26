import Link from 'next/link'
import { MessageCircle, Mail } from 'lucide-react'

export function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573001234567'
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hola@teramontrides.com'

  return (
    <footer className="bg-stone-950 text-stone-400">
      {/* Top CTA bar */}
      <div className="border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p
              className="text-2xl font-light text-white mb-1"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              ¿Listo para viajar?
            </p>
            <p className="text-stone-400 text-sm">
              Reserva tu viaje privado en minutos.
            </p>
          </div>
          <Link
            href="/reservar"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gold hover:bg-gold/90 text-white text-sm font-medium tracking-wide rounded-sm transition-colors"
          >
            Reservar ahora
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="text-xl font-light tracking-[0.2em] uppercase text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Teramont
              </span>
              <span className="text-xs tracking-[0.3em] uppercase font-medium text-gold">
                Private Rides
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed max-w-xs mb-6">
              Viajes privados premium entre Cartagena, Barú y Barranquilla en
              Volkswagen Teramont 2024. Costa Caribe Colombiana.
            </p>
            <div className="flex items-center gap-4">
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:bg-green-600 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} />
              </a>
              <a
                href={`mailto:${contactEmail}`}
                className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:bg-gold transition-colors"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Rutas */}
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-stone-500 mb-4">
              Rutas
            </p>
            <ul className="space-y-2 text-sm">
              {[
                'Cartagena → Barranquilla',
                'Barranquilla → Cartagena',
                'Cartagena → Barú',
                'Barú → Cartagena',
                'Barranquilla → Barú',
                'Barú → Barranquilla',
              ].map((r) => (
                <li key={r}>
                  <Link
                    href="/reservar"
                    className="hover:text-gold transition-colors"
                  >
                    {r}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-stone-500 mb-4">
              Información
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/rutas" className="hover:text-gold transition-colors">
                  Rutas y precios
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gold transition-colors">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link href="/politicas" className="hover:text-gold transition-colors">
                  Políticas de cancelación
                </Link>
              </li>
              <li>
                <Link href="/politicas#terminos" className="hover:text-gold transition-colors">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/politicas#privacidad" className="hover:text-gold transition-colors">
                  Privacidad
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${contactEmail}`}
                  className="hover:text-gold transition-colors"
                >
                  {contactEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600">
          <p>© {new Date().getFullYear()} Teramont Private Rides. Todos los derechos reservados.</p>
          <p>Costa Caribe Colombiana · Pagos seguros con Wompi</p>
        </div>
      </div>
    </footer>
  )
}
