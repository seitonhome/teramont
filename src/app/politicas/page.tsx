import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { getLocale } from '@/lib/locale-server'
import { translations } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Políticas y Términos',
  description:
    'Políticas de cancelación, reembolso, privacidad y tratamiento de datos personales (Ley 1581/2012) de Teramont Private Rides.',
  alternates: { canonical: 'https://teramont.seitonhome.com/politicas' },
  openGraph: {
    title: 'Políticas y Términos | Teramont Private Rides',
    description: 'Consulta las condiciones del servicio, cancelaciones, reembolsos y política de privacidad.',
    url: 'https://teramont.seitonhome.com/politicas',
  },
}

export default async function PoliticasPage() {
  const locale = await getLocale()
  const p = translations[locale].pages.policies

  const isEn = locale === 'en'

  return (
    <>
      <Navbar forceDark />
      <main className="min-h-screen bg-background pt-20">
        <div className="text-white py-14" style={{ background: 'linear-gradient(135deg, #060F1E 0%, #0A1628 100%)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">{p.label}</p>
            <h1 className="text-4xl font-light text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {p.title}
            </h1>
            <p className="mt-3 text-sm" style={{ color: 'rgb(140 165 200)' }}>{p.subtitle}</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-12">

          {/* Cancelación */}
          <section>
            <h2 className="text-2xl font-light text-foreground mb-5 pb-3 border-b border-border">
              {isEn ? 'Cancellation & refund policy' : 'Política de cancelación y reembolso'}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {isEn ? (
                <>
                  <p>A <strong className="text-foreground">50% deposit</strong> is required to confirm a booking. The remaining balance must be paid before the trip begins.</p>
                  <p>Cancellations made <strong className="text-foreground">more than 24 hours</strong> before the scheduled trip may be rescheduled for another available date or fully refunded.</p>
                  <p>Cancellations within the <strong className="text-foreground">24 hours prior</strong> to the trip are non-refundable under any circumstances, except in cases of documented force majeure.</p>
                  <p>A booking is only <strong className="text-foreground">confirmed</strong> once payment is approved by Wompi. Pending or declined payments automatically release the time slot.</p>
                  <p>Time or route changes are subject to vehicle availability. No availability for the new requested slot is guaranteed.</p>
                </>
              ) : (
                <>
                  <p>Para reservar se paga el <strong className="text-foreground">50% del valor del servicio</strong>. El saldo restante debe pagarse antes de iniciar el viaje.</p>
                  <p>Cancelaciones realizadas con <strong className="text-foreground">más de 24 horas</strong> de anticipación pueden ser reprogramadas para otra fecha disponible o reembolsadas en su totalidad.</p>
                  <p>Cancelaciones dentro de las <strong className="text-foreground">24 horas previas</strong> al servicio no son reembolsables bajo ninguna circunstancia, salvo fuerza mayor debidamente acreditada.</p>
                  <p>La reserva solo queda <strong className="text-foreground">confirmada</strong> cuando el pago es aprobado por Wompi. Pagos pendientes o rechazados liberan automáticamente el horario.</p>
                  <p>Cambios de hora o ruta están sujetos a disponibilidad del vehículo. No se garantiza disponibilidad para el nuevo horario solicitado.</p>
                </>
              )}
            </div>
          </section>

          {/* Servicio */}
          <section>
            <h2 className="text-2xl font-light text-foreground mb-5 pb-3 border-b border-border">
              {isEn ? 'Service conditions' : 'Condiciones del servicio'}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {isEn ? (
                <>
                  <p>The service is private per vehicle. No ride-sharing with other passengers under any circumstances.</p>
                  <p>The vehicle has a capacity of up to 5 passengers with standard luggage.</p>
                  <p>The driver will arrive at the pickup point at the agreed time. Waits exceeding 15 minutes may result in additional charges or trip cancellation at the operator's discretion.</p>
                  <p>The operator reserves the right to cancel the service due to force majeure, extreme weather conditions, or road safety situations. In these cases, a full refund will be issued.</p>
                </>
              ) : (
                <>
                  <p>El servicio es privado por vehículo. No se comparte con otros pasajeros bajo ningún concepto.</p>
                  <p>El vehículo tiene capacidad para hasta 5 pasajeros y equipaje estándar.</p>
                  <p>El conductor llegará al punto de recogida en el horario acordado. Esperas superiores a 15 minutos pueden generar cargos adicionales o cancelación del servicio a criterio del operador.</p>
                  <p>El operador se reserva el derecho de cancelar el servicio por razones de fuerza mayor, condiciones climáticas extremas o situaciones de seguridad vial. En estos casos se reembolsará el valor total pagado.</p>
                </>
              )}
            </div>
          </section>

          {/* Términos */}
          <section id="terminos">
            <h2 className="text-2xl font-light text-foreground mb-5 pb-3 border-b border-border">
              {isEn ? 'Terms & conditions' : 'Términos y condiciones'}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {isEn ? (
                <>
                  <p>By making a booking, the customer accepts these terms and conditions and the current cancellation policy.</p>
                  <p>Teramont Private Rides operates as a private tourist transportation service on the Colombian Caribbean coast. We are not a taxi service or ridesharing platform.</p>
                  <p>Fares are fixed per vehicle, not per person. The price includes door-to-door transfer on the selected route.</p>
                  <p>Customer data is handled in accordance with our privacy policy and solely for the purpose of managing the booking and the service.</p>
                </>
              ) : (
                <>
                  <p>Al realizar una reserva, el cliente acepta los presentes términos y condiciones y la política de cancelación vigente.</p>
                  <p>Teramont Private Rides opera como servicio de transporte privado turístico en el Caribe colombiano. No somos un servicio de taxi ni plataforma de ridesharing.</p>
                  <p>Las tarifas son fijas por vehículo, no por persona. El precio incluye el traslado puerta a puerta en la ruta seleccionada.</p>
                  <p>Los datos del cliente son tratados conforme a nuestra política de privacidad y únicamente para gestionar la reserva y el servicio.</p>
                </>
              )}
            </div>
          </section>

          {/* Privacidad */}
          <section id="privacidad">
            <h2 className="text-2xl font-light text-foreground mb-5 pb-3 border-b border-border">
              {isEn ? 'Privacy policy' : 'Política de privacidad'}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {isEn ? (
                <>
                  <p>We collect only the data necessary to manage your booking: name, email, phone and pickup/drop-off address.</p>
                  <p>Your data is not sold or shared with third parties, except with our payment provider Wompi to securely process the transaction.</p>
                  <p>You may request deletion of your data at any time by writing to us via email or WhatsApp.</p>
                </>
              ) : (
                <>
                  <p>Recopilamos únicamente los datos necesarios para gestionar tu reserva: nombre, correo electrónico, teléfono y dirección de recogida/destino.</p>
                  <p>Tus datos no son vendidos ni compartidos con terceros, excepto con el proveedor de pagos Wompi para procesar la transacción de forma segura.</p>
                  <p>Puedes solicitar la eliminación de tus datos en cualquier momento escribiéndonos a nuestro correo o WhatsApp.</p>
                </>
              )}
            </div>
          </section>

          {/* Política de tratamiento de datos personales (Ley 1581/2012) */}
          <section id="datos">
            <h2 className="text-2xl font-light text-foreground mb-5 pb-3 border-b border-border">
              {p.dataTitle}
            </h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              {isEn && (
                <p className="text-xs italic border border-border rounded-lg p-3">
                  The following section is a mandatory disclosure under Colombian Law 1581 of 2012 (Personal Data Protection). It is provided in Spanish as required by Colombian regulation.
                </p>
              )}

              <div>
                <h3 className="font-semibold text-foreground mb-2">1. Responsable del tratamiento</h3>
                <p>
                  <strong className="text-foreground">Teramont Private Rides</strong>, con domicilio en la ciudad de Cartagena de Indias, Colombia.
                  Contacto: <a href="mailto:servicioalcliente@seitonhome.com" className="text-gold hover:underline">servicioalcliente@seitonhome.com</a> · WhatsApp: +57 314 544 5117.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">2. Datos personales tratados</h3>
                <p>En el marco de la prestación de nuestro servicio de transporte privado, recopilamos los siguientes datos personales:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                  <li>Nombre completo</li>
                  <li>Correo electrónico</li>
                  <li>Número de teléfono / WhatsApp</li>
                  <li>Dirección de recogida y destino</li>
                  <li>Fecha y hora del servicio solicitado</li>
                  <li>Información de pago procesada por Wompi (no almacenamos datos de tarjeta)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">3. Finalidades del tratamiento</h3>
                <p>Los datos personales recopilados serán utilizados para:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                  <li>Gestionar y confirmar reservas de transporte privado</li>
                  <li>Coordinar el servicio de traslado con el conductor asignado</li>
                  <li>Comunicarnos con el titular para confirmar, modificar o cancelar reservas</li>
                  <li>Procesar pagos a través de la plataforma Wompi</li>
                  <li>Cumplir obligaciones legales aplicables</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">4. Transferencia y transmisión de datos</h3>
                <p>
                  Los datos personales del titular podrán ser transmitidos a <strong className="text-foreground">Wompi</strong> (procesador de pagos), exclusivamente para la gestión segura del pago del servicio. No realizamos ninguna otra transferencia o venta de datos personales a terceros.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">5. Derechos del titular</h3>
                <p>De conformidad con la Ley 1581 de 2012 y el Decreto 1377 de 2013, el titular de los datos tiene los siguientes derechos:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                  <li><strong className="text-foreground">Conocer</strong> los datos personales que tenemos sobre usted</li>
                  <li><strong className="text-foreground">Actualizar y rectificar</strong> sus datos cuando sean inexactos o incompletos</li>
                  <li><strong className="text-foreground">Solicitar prueba</strong> de la autorización otorgada para el tratamiento</li>
                  <li><strong className="text-foreground">Revocar</strong> la autorización y/o solicitar la supresión de sus datos</li>
                  <li><strong className="text-foreground">Acceder gratuitamente</strong> a sus datos personales</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">6. Procedimiento para ejercer sus derechos</h3>
                <p>
                  Para ejercer cualquiera de los derechos anteriores, el titular puede comunicarse con nosotros a través de los siguientes canales:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                  <li>Correo electrónico: <a href="mailto:servicioalcliente@seitonhome.com" className="text-gold hover:underline">servicioalcliente@seitonhome.com</a></li>
                  <li>WhatsApp: <a href="https://wa.me/573145445117" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">+57 314 544 5117</a></li>
                </ul>
                <p className="mt-3">
                  Daremos respuesta a las solicitudes en un plazo máximo de <strong className="text-foreground">10 días hábiles</strong>, de acuerdo con lo establecido en la legislación colombiana de protección de datos personales.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">7. Vigencia de la política</h3>
                <p>
                  La presente política de tratamiento de datos personales rige a partir del <strong className="text-foreground">1 de enero de 2025</strong> y estará vigente mientras Teramont Private Rides desarrolle sus actividades comerciales. Cualquier cambio sustancial será comunicado a los titulares a través de nuestros canales oficiales.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  )
}
