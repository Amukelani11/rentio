import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY

let client: Resend | null = null
if (RESEND_API_KEY) {
  try {
    client = new Resend(RESEND_API_KEY)
  } catch {}
}

export type SendEmailOptions = {
  to: string | string[]
  subject: string
  html: string
  from?: string
  cc?: string | string[]
  bcc?: string | string[]
}

export async function sendEmail(options: SendEmailOptions) {
  try {
    if (!client) {
      console.warn('[email] RESEND_API_KEY missing; skipping send to', options.to)
      return { skipped: true }
    }

    const from = options.from || 'Rentio <no-reply@rentio.app>'

    const res = await client.emails.send({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      cc: options.cc,
      bcc: options.bcc,
    })
    return res
  } catch (e) {
    console.error('[email] send error', e)
    return { error: true }
  }
}
