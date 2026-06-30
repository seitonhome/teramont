import { Resend } from 'resend'
import { formatCOP } from '@/lib/utils'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Teramont Private Rides <noreply@seitonhome.com>'
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'servicioalcliente@seitonhome.com'
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573145445117'

interface BookingEmailData {
  bookingCode: string
  customerName: string
  customerEmail: string
  customerPhone: string
  originName: string
  destinationName: string
  pickupDatetime: string
  estimatedArrival: string
  pickupAddress: string
  dropoffAddress: string
  passengersCount: number
  totalPriceCop: number
  depositAmountCop: number
  balanceAmountCop: number
  notes?: string | null
}

function formatDatetimeLocal(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export async function sendCustomerConfirmationEmail(data: BookingEmailData) {
  const whatsappUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola, tengo una reserva confirmada. Código: ${data.bookingCode}`)}`

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F8F6F2;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#060F1E 0%,#0A1628 100%);padding:40px 40px 32px;text-align:center;">
      <p style="margin:0 0 4px;color:#C19436;font-size:11px;letter-spacing:4px;text-transform:uppercase;font-family:Arial,sans-serif;">Teramont</p>
      <p style="margin:0;color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Private Rides</p>
      <div style="margin:24px auto 0;width:48px;height:48px;background:rgba(34,197,94,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;">
        <p style="margin:0;font-size:24px;">✓</p>
      </div>
      <h1 style="margin:16px 0 8px;color:#ffffff;font-size:28px;font-weight:300;letter-spacing:1px;">¡Reserva confirmada!</h1>
      <p style="margin:0;color:rgba(255,255,255,0.6);font-size:14px;">Tu viaje privado está reservado.</p>
    </div>

    <!-- Booking code -->
    <div style="background:#0A1628;padding:16px 40px;text-align:center;">
      <p style="margin:0;color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Código de reserva</p>
      <p style="margin:4px 0 0;color:#C19436;font-size:22px;font-family:monospace;letter-spacing:3px;">${data.bookingCode}</p>
    </div>

    <!-- Body -->
    <div style="padding:40px;">

      <p style="margin:0 0 24px;color:#4A5568;font-size:15px;line-height:1.6;">
        Hola <strong style="color:#0A1628;">${data.customerName}</strong>, tu reserva ha sido confirmada. Aquí están todos los detalles de tu viaje:
      </p>

      <!-- Route & time -->
      <div style="background:#F8F6F2;border-radius:12px;padding:24px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #E4DACE;vertical-align:top;">
              <span style="color:#8A8070;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Ruta</span><br>
              <strong style="color:#0A1628;font-size:16px;">${data.originName} → ${data.destinationName}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #E4DACE;vertical-align:top;">
              <span style="color:#8A8070;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Fecha y hora de recogida</span><br>
              <strong style="color:#0A1628;font-size:15px;">${formatDatetimeLocal(data.pickupDatetime)}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #E4DACE;vertical-align:top;">
              <span style="color:#8A8070;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Llegada estimada</span><br>
              <span style="color:#0A1628;font-size:15px;">${formatDatetimeLocal(data.estimatedArrival)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #E4DACE;vertical-align:top;">
              <span style="color:#8A8070;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Dirección de recogida</span><br>
              <span style="color:#0A1628;font-size:15px;">${data.pickupAddress}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #E4DACE;vertical-align:top;">
              <span style="color:#8A8070;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Dirección de destino</span><br>
              <span style="color:#0A1628;font-size:15px;">${data.dropoffAddress}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;vertical-align:top;">
              <span style="color:#8A8070;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Pasajeros</span><br>
              <span style="color:#0A1628;font-size:15px;">${data.passengersCount}</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Payment -->
      <div style="background:#F8F6F2;border-radius:12px;padding:24px;margin-bottom:20px;">
        <p style="margin:0 0 16px;color:#8A8070;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Resumen de pago</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:4px 0;color:#6B7280;">Precio total del servicio</td>
            <td style="padding:4px 0;text-align:right;color:#0A1628;font-weight:600;">${formatCOP(data.totalPriceCop)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#16a34a;">Anticipo pagado ✓</td>
            <td style="padding:4px 0;text-align:right;color:#16a34a;font-weight:600;">${formatCOP(data.depositAmountCop)}</td>
          </tr>
          ${data.balanceAmountCop > 0 ? `
          <tr>
            <td style="padding:4px 0;border-top:1px solid #E4DACE;color:#B45309;">Saldo a pagar antes del viaje</td>
            <td style="padding:4px 0;border-top:1px solid #E4DACE;text-align:right;color:#B45309;font-weight:700;">${formatCOP(data.balanceAmountCop)}</td>
          </tr>` : ''}
        </table>
      </div>

      ${data.balanceAmountCop > 0 ? `
      <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="margin:0;color:#92400E;font-size:14px;">
          💳 <strong>Recuerda:</strong> el saldo de <strong>${formatCOP(data.balanceAmountCop)}</strong> debes pagarlo en efectivo o transferencia antes de iniciar el viaje.
        </p>
      </div>` : ''}

      <!-- WhatsApp CTA -->
      <div style="text-align:center;margin:32px 0;">
        <a href="${whatsappUrl}" style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:15px;font-weight:600;font-family:Arial,sans-serif;">
          📱 Confirmar por WhatsApp
        </a>
        <p style="margin:12px 0 0;color:#9CA3AF;font-size:12px;">Guarda el número +57 314 544 5117</p>
      </div>

      <!-- Cancellation -->
      <div style="border-top:1px solid #E4DACE;padding-top:20px;margin-top:8px;">
        <p style="margin:0 0 8px;color:#0A1628;font-size:13px;font-weight:600;">Política de cancelación</p>
        <p style="margin:0;color:#6B7280;font-size:13px;line-height:1.6;">
          Cancelaciones con más de 24 horas de anticipación: reembolso completo o reagendamiento sin costo.<br>
          Cancelaciones dentro de las 24 horas previas: el anticipo no es reembolsable.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#060F1E;padding:24px 40px;text-align:center;">
      <p style="margin:0 0 4px;color:rgba(255,255,255,0.4);font-size:12px;font-family:Arial,sans-serif;">Teramont Private Rides · Costa Caribe Colombiana</p>
      <p style="margin:0;color:rgba(255,255,255,0.25);font-size:11px;font-family:Arial,sans-serif;">${ADMIN_EMAIL}</p>
    </div>
  </div>
</body>
</html>`

  return resend.emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `✅ Reserva confirmada ${data.bookingCode} — ${data.originName} → ${data.destinationName}`,
    html,
  })
}

export async function sendReminderEmail(data: BookingEmailData) {
  const whatsappUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola, tengo una reserva confirmada. Código: ${data.bookingCode}`)}`

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F8F6F2;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:linear-gradient(135deg,#060F1E 0%,#0A1628 100%);padding:40px 40px 32px;text-align:center;">
      <p style="margin:0 0 4px;color:#C19436;font-size:11px;letter-spacing:4px;text-transform:uppercase;font-family:Arial,sans-serif;">Teramont</p>
      <p style="margin:0;color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Private Rides</p>
      <p style="margin:24px 0 0;font-size:36px;">🚗</p>
      <h1 style="margin:12px 0 8px;color:#ffffff;font-size:26px;font-weight:300;">Tu viaje es mañana</h1>
      <p style="margin:0;color:rgba(255,255,255,0.6);font-size:14px;">Te recordamos los detalles de tu reserva.</p>
    </div>

    <div style="background:#0A1628;padding:16px 40px;text-align:center;">
      <p style="margin:0;color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Código de reserva</p>
      <p style="margin:4px 0 0;color:#C19436;font-size:22px;font-family:monospace;letter-spacing:3px;">${data.bookingCode}</p>
    </div>

    <div style="padding:40px;">
      <p style="margin:0 0 24px;color:#4A5568;font-size:15px;line-height:1.6;">
        Hola <strong style="color:#0A1628;">${data.customerName}</strong>, mañana es tu viaje con Teramont Private Rides. Aquí tienes todo lo que necesitas saber:
      </p>

      <div style="background:#F8F6F2;border-radius:12px;padding:24px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #E4DACE;vertical-align:top;">
              <span style="color:#8A8070;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Ruta</span><br>
              <strong style="color:#0A1628;font-size:16px;">${data.originName} → ${data.destinationName}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #E4DACE;vertical-align:top;">
              <span style="color:#8A8070;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Hora de recogida</span><br>
              <strong style="color:#C19436;font-size:18px;">${formatDatetimeLocal(data.pickupDatetime)}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #E4DACE;vertical-align:top;">
              <span style="color:#8A8070;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Te recogemos en</span><br>
              <strong style="color:#0A1628;font-size:15px;">${data.pickupAddress}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;vertical-align:top;">
              <span style="color:#8A8070;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Tu destino</span><br>
              <span style="color:#0A1628;font-size:15px;">${data.dropoffAddress}</span>
            </td>
          </tr>
        </table>
      </div>

      ${data.balanceAmountCop > 0 ? `
      <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;color:#92400E;font-size:14px;">
          💳 <strong>Recuerda:</strong> tienes un saldo pendiente de <strong>${formatCOP(data.balanceAmountCop)}</strong> que debes pagar en efectivo o transferencia antes de iniciar el viaje.
        </p>
      </div>` : `
      <div style="background:#D1FAE5;border:1px solid #A7F3D0;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;color:#065F46;font-size:14px;">✅ <strong>Tu pago está completo.</strong> No tienes ningún saldo pendiente.</p>
      </div>`}

      <div style="text-align:center;margin:32px 0;">
        <a href="${whatsappUrl}" style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:15px;font-weight:600;font-family:Arial,sans-serif;">
          📱 Escribir por WhatsApp
        </a>
        <p style="margin:12px 0 0;color:#9CA3AF;font-size:12px;">¿Tienes alguna pregunta? Estamos disponibles.</p>
      </div>
    </div>

    <div style="background:#060F1E;padding:24px 40px;text-align:center;">
      <p style="margin:0 0 4px;color:rgba(255,255,255,0.4);font-size:12px;font-family:Arial,sans-serif;">Teramont Private Rides · Costa Caribe Colombiana</p>
      <p style="margin:0;color:rgba(255,255,255,0.25);font-size:11px;font-family:Arial,sans-serif;">${ADMIN_EMAIL}</p>
    </div>
  </div>
</body>
</html>`

  return resend.emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `🚗 Tu viaje es mañana — ${data.originName} → ${data.destinationName} | ${data.bookingCode}`,
    html,
  })
}

export async function sendAdminNotificationEmail(data: BookingEmailData) {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F8F6F2;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#0A1628;padding:24px 32px;">
      <p style="margin:0;color:#C19436;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">🔔 Nueva reserva confirmada</p>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.5);font-size:12px;font-family:monospace;">${data.bookingCode}</p>
    </div>
    <div style="padding:32px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="background:#F8F6F2;">
          <td style="padding:10px 12px;font-weight:700;color:#374151;width:40%;">Cliente</td>
          <td style="padding:10px 12px;color:#0A1628;">${data.customerName}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;font-weight:700;color:#374151;">Email</td>
          <td style="padding:10px 12px;"><a href="mailto:${data.customerEmail}" style="color:#C19436;">${data.customerEmail}</a></td>
        </tr>
        <tr style="background:#F8F6F2;">
          <td style="padding:10px 12px;font-weight:700;color:#374151;">WhatsApp</td>
          <td style="padding:10px 12px;"><a href="https://wa.me/${data.customerPhone.replace(/\D/g,'')}" style="color:#25D366;">${data.customerPhone}</a></td>
        </tr>
        <tr>
          <td style="padding:10px 12px;font-weight:700;color:#374151;">Ruta</td>
          <td style="padding:10px 12px;color:#0A1628;font-weight:600;">${data.originName} → ${data.destinationName}</td>
        </tr>
        <tr style="background:#F8F6F2;">
          <td style="padding:10px 12px;font-weight:700;color:#374151;">Fecha y hora</td>
          <td style="padding:10px 12px;color:#0A1628;">${formatDatetimeLocal(data.pickupDatetime)}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;font-weight:700;color:#374151;">Recogida</td>
          <td style="padding:10px 12px;color:#0A1628;">${data.pickupAddress}</td>
        </tr>
        <tr style="background:#F8F6F2;">
          <td style="padding:10px 12px;font-weight:700;color:#374151;">Destino</td>
          <td style="padding:10px 12px;color:#0A1628;">${data.dropoffAddress}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;font-weight:700;color:#374151;">Pasajeros</td>
          <td style="padding:10px 12px;color:#0A1628;">${data.passengersCount}</td>
        </tr>
        <tr style="background:#F8F6F2;">
          <td style="padding:10px 12px;font-weight:700;color:#374151;">Total</td>
          <td style="padding:10px 12px;color:#0A1628;">${formatCOP(data.totalPriceCop)}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;font-weight:700;color:#374151;">Anticipo pagado</td>
          <td style="padding:10px 12px;color:#16a34a;font-weight:700;">${formatCOP(data.depositAmountCop)}</td>
        </tr>
        ${data.balanceAmountCop > 0 ? `
        <tr style="background:#FEF3C7;">
          <td style="padding:10px 12px;font-weight:700;color:#374151;">Saldo pendiente</td>
          <td style="padding:10px 12px;color:#B45309;font-weight:700;">${formatCOP(data.balanceAmountCop)}</td>
        </tr>` : ''}
        ${data.notes ? `
        <tr style="background:#F8F6F2;">
          <td style="padding:10px 12px;font-weight:700;color:#374151;">Notas</td>
          <td style="padding:10px 12px;color:#6B7280;">${data.notes}</td>
        </tr>` : ''}
      </table>

      <div style="margin-top:24px;text-align:center;">
        <a href="https://teramont.seitonhome.com/admin/bookings" style="display:inline-block;background:#0A1628;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;">
          Ver en panel admin
        </a>
      </div>
    </div>
  </div>
</body>
</html>`

  return resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `🔔 Nueva reserva ${data.bookingCode} — ${data.originName} → ${data.destinationName} | ${formatDatetimeLocal(data.pickupDatetime)}`,
    html,
  })
}
