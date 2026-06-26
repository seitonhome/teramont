import crypto from 'crypto'

const IS_PRODUCTION = process.env.WOMPI_ENVIRONMENT === 'production'

const WOMPI_BASE_URL = IS_PRODUCTION
  ? 'https://production.wompi.co/v1'
  : 'https://sandbox.wompi.co/v1'

export interface WompiTransactionPayload {
  amount_in_cents: number
  currency: string
  customer_email: string
  reference: string
  redirect_url: string
  customer_data?: {
    full_name?: string
    phone_number?: string
  }
}

export async function createWompiTransaction(
  payload: WompiTransactionPayload
): Promise<{ checkout_url?: string; payment_link_id?: string; error?: string }> {
  try {
    const linkPayload = {
      name: `Reserva Teramont ${payload.reference}`,
      description: `Pago reserva ${payload.reference}`,
      single_use: true,
      collect_shipping: false,
      amount_in_cents: payload.amount_in_cents,
      currency: payload.currency,
      redirect_url: payload.redirect_url,
      customer_data: payload.customer_data,
    }

    const res = await fetch(`${WOMPI_BASE_URL}/payment_links`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(linkPayload),
    })

    const data = await res.json()

    if (!res.ok) {
      const msg = data?.error?.messages?.join(', ') || JSON.stringify(data)
      console.error('Wompi payment link error:', msg)
      return { error: msg || 'Error al crear pago' }
    }

    const paymentLink = data.data
    // Wompi always uses checkout.wompi.co for the payment page (both sandbox and production)
    const checkoutUrl: string =
      paymentLink?.payment_link?.permalink ||
      `https://checkout.wompi.co/l/${paymentLink.id}`

    return { checkout_url: checkoutUrl, payment_link_id: paymentLink.id }
  } catch (err) {
    console.error('Wompi connection error:', err)
    return { error: 'Error de conexión con Wompi' }
  }
}

export async function getWompiTransaction(transactionId: string): Promise<{
  transaction?: Record<string, unknown>
  error?: string
}> {
  try {
    const res = await fetch(`${WOMPI_BASE_URL}/transactions/${transactionId}`, {
      headers: { Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}` },
    })
    const data = await res.json()
    if (!res.ok) return { error: 'Error al consultar transacción' }
    return { transaction: data.data }
  } catch {
    return { error: 'Error de conexión con Wompi' }
  }
}

/**
 * Verifica la firma del webhook de Wompi.
 *
 * Wompi envía en el payload:
 * {
 *   "event": "transaction.updated",
 *   "data": { "transaction": { ... } },
 *   "environment": "production" | "test",
 *   "signature": {
 *     "checksum": "abc123...",
 *     "properties": ["transaction.id", "transaction.status", "transaction.amount_in_cents", "transaction.currency"]
 *   },
 *   "timestamp": 1234567890
 * }
 *
 * El checksum se calcula: SHA256( prop1_value + prop2_value + ... + timestamp + events_secret )
 */
export function verifyWompiWebhookSignature(
  payload: Record<string, unknown>
): boolean {
  try {
    const eventsSecret = process.env.WOMPI_EVENTS_SECRET
    if (!eventsSecret) {
      console.warn('WOMPI_EVENTS_SECRET no configurado')
      return false
    }

    const signature = payload.signature as {
      checksum?: string
      properties?: string[]
    } | undefined

    // En producción siempre exigimos checksum
    if (!signature?.checksum) {
      if (IS_PRODUCTION) {
        console.warn('Webhook sin checksum en producción — rechazado')
        return false
      }
      // En sandbox podemos permitir sin checksum para pruebas locales
      return true
    }

    const properties = signature.properties || []
    const timestamp = payload.timestamp as number
    const data = payload.data as Record<string, unknown>
    const transaction = data?.transaction as Record<string, unknown>

    // Extraer los valores de cada propiedad indicada por Wompi
    // Las propiedades usan notación "transaction.id", "transaction.status", etc.
    const propValues = properties.map((prop) => {
      const parts = prop.split('.')
      // parts[0] = "transaction", parts[1] = "id" | "status" | ...
      if (parts[0] === 'transaction' && parts[1]) {
        return String(transaction?.[parts[1]] ?? '')
      }
      return ''
    })

    const hashInput = [...propValues, String(timestamp), eventsSecret].join('')
    const expectedChecksum = crypto
      .createHash('sha256')
      .update(hashInput)
      .digest('hex')

    const valid = expectedChecksum === signature.checksum
    if (!valid) {
      console.warn('Wompi webhook checksum mismatch', {
        expected: expectedChecksum,
        received: signature.checksum,
      })
    }
    return valid
  } catch (err) {
    console.error('Error verificando firma Wompi:', err)
    return false
  }
}

export function mapWompiStatus(wompiStatus: string): string {
  const map: Record<string, string> = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    DECLINED: 'DECLINED',
    VOIDED: 'VOIDED',
    ERROR: 'ERROR',
  }
  return map[wompiStatus] || 'ERROR'
}
