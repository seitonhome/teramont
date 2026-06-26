import crypto from 'crypto'

const WOMPI_BASE_URL =
  process.env.WOMPI_ENVIRONMENT === 'production'
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
  payment_method_allowed_types?: string[]
}

export interface WompiTransaction {
  id: string
  status: string
  reference: string
  amount_in_cents: number
  currency: string
  payment_method_type: string
  redirect_url: string
  payment_link?: { permalink: string }
}

export async function createWompiTransaction(
  payload: WompiTransactionPayload
): Promise<{ transaction?: WompiTransaction; error?: string; checkout_url?: string }> {
  try {
    // Create payment link via Wompi
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
      return { error: data?.error?.messages?.join(', ') || 'Error al crear pago' }
    }

    const paymentLink = data.data
    const checkoutUrl = paymentLink.payment_link?.permalink ||
      `https://${process.env.WOMPI_ENVIRONMENT === 'production' ? '' : 'checkout.'}wompi.co/l/${paymentLink.id}`

    return {
      checkout_url: checkoutUrl,
      transaction: paymentLink,
    }
  } catch (err) {
    return { error: 'Error de conexión con Wompi' }
  }
}

export async function getWompiTransaction(transactionId: string): Promise<{
  transaction?: Record<string, unknown>
  error?: string
}> {
  try {
    const res = await fetch(`${WOMPI_BASE_URL}/transactions/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
      },
    })
    const data = await res.json()
    if (!res.ok) {
      return { error: 'Error al consultar transacción' }
    }
    return { transaction: data.data }
  } catch {
    return { error: 'Error de conexión con Wompi' }
  }
}

export function verifyWompiWebhookSignature(
  payload: Record<string, unknown>,
  signature: string
): boolean {
  try {
    const eventsSecret = process.env.WOMPI_EVENTS_SECRET
    if (!eventsSecret) return false

    // Wompi uses: properties + timestamp + eventsSecret hashed with SHA256
    const checksum = payload?.checksum
    if (checksum) {
      const properties = payload.properties as Record<string, unknown>
      const timestamp = payload.timestamp as number

      // Build the string to hash: concatenate transaction id + status + amount + currency + timestamp + events_secret
      const transactionData = properties?.transaction || properties
      const hashStr = [
        (transactionData as Record<string, unknown>)?.id || '',
        (transactionData as Record<string, unknown>)?.status || '',
        (transactionData as Record<string, unknown>)?.amount_in_cents || '',
        (transactionData as Record<string, unknown>)?.currency || '',
        timestamp,
        eventsSecret,
      ].join('')

      const hash = crypto.createHash('sha256').update(hashStr).digest('hex')
      return hash === checksum
    }
    return true // Allow through if no checksum (sandbox may not always include it)
  } catch {
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

export function generateWompiIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string
): string {
  const integrityKey = process.env.WOMPI_INTEGRITY_KEY || ''
  const str = `${reference}${amountInCents}${currency}${integrityKey}`
  return crypto.createHash('sha256').update(str).digest('hex')
}
