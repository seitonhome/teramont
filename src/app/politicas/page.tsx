import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

export const metadata = {
  title: 'Políticas — Teramont Private Rides',
}

export default function PoliticasPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        <div className="bg-stone-950 text-white py-14">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">Legal</p>
            <h1
              className="text-4xl font-light text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Políticas del servicio
            </h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-12">
          {/* Cancelación */}
          <section>
            <h2 className="text-2xl font-light text-foreground mb-5 pb-3 border-b border-border">
              Política de cancelación y reembolso
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Para reservar se paga el <strong className="text-foreground">50% del valor del servicio</strong>.
                El saldo restante debe pagarse antes de iniciar el viaje.
              </p>
              <p>
                Cancelaciones realizadas con <strong className="text-foreground">más de 24 horas</strong> de
                anticipación pueden ser reprogramadas para otra fecha disponible o reembolsadas en su totalidad.
              </p>
              <p>
                Cancelaciones dentro de las <strong className="text-foreground">24 horas previas</strong> al
                servicio no son reembolsables bajo ninguna circunstancia, salvo fuerza mayor debidamente
                acreditada.
              </p>
              <p>
                La reserva solo queda <strong className="text-foreground">confirmada</strong> cuando el pago
                es aprobado por Wompi. Pagos pendientes o rechazados liberan automáticamente el horario.
              </p>
              <p>
                Cambios de hora o ruta están sujetos a disponibilidad del vehículo. No se garantiza
                disponibilidad para el nuevo horario solicitado.
              </p>
            </div>
          </section>

          {/* Servicio */}
          <section>
            <h2 className="text-2xl font-light text-foreground mb-5 pb-3 border-b border-border">
              Condiciones del servicio
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>El servicio es privado por vehículo. No se comparte con otros pasajeros bajo ningún concepto.</p>
              <p>El vehículo tiene capacidad para hasta 5 pasajeros y equipaje estándar.</p>
              <p>
                El conductor llegará al punto de recogida en el horario acordado. Esperas superiores a
                15 minutos pueden generar cargos adicionales o cancelación del servicio a criterio
                del operador.
              </p>
              <p>
                El operador se reserva el derecho de cancelar el servicio por razones de fuerza mayor,
                condiciones climáticas extremas o situaciones de seguridad vial. En estos casos se
                reembolsará el valor total pagado.
              </p>
            </div>
          </section>

          {/* Términos */}
          <section id="terminos">
            <h2 className="text-2xl font-light text-foreground mb-5 pb-3 border-b border-border">
              Términos y condiciones
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Al realizar una reserva, el cliente acepta los presentes términos y condiciones y
                la política de cancelación vigente.
              </p>
              <p>
                Teramont Private Rides opera como servicio de transporte privado turístico en el
                Caribe colombiano. No somos un servicio de taxi ni plataforma de ridesharing.
              </p>
              <p>
                Las tarifas son fijas por vehículo, no por persona. El precio incluye el traslado
                puerta a puerta en la ruta seleccionada.
              </p>
              <p>
                Los datos del cliente son tratados conforme a nuestra política de privacidad y
                únicamente para gestionar la reserva y el servicio.
              </p>
            </div>
          </section>

          {/* Privacidad */}
          <section id="privacidad">
            <h2 className="text-2xl font-light text-foreground mb-5 pb-3 border-b border-border">
              Política de privacidad
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Recopilamos únicamente los datos necesarios para gestionar tu reserva: nombre,
                correo electrónico, teléfono y dirección de recogida/destino.
              </p>
              <p>
                Tus datos no son vendidos ni compartidos con terceros, excepto con el proveedor
                de pagos Wompi para procesar la transacción de forma segura.
              </p>
              <p>
                Puedes solicitar la eliminación de tus datos en cualquier momento escribiéndonos
                a nuestro correo o WhatsApp.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
