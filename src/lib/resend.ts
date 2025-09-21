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
    console.log('[email] Starting sendEmail function')
    console.log('[email] RESEND_API_KEY:', RESEND_API_KEY ? 'Present' : 'Missing')
    console.log('[email] Client initialized:', client ? 'Yes' : 'No')

    if (!client) {
      console.warn('[email] RESEND_API_KEY missing; skipping send to', options.to)
      return { skipped: true }
    }

    const from = options.from || 'notifications@rentio.co.za'
    console.log('[email] Sending email:', { from, to: options.to, subject: options.subject })

    const res = await client.emails.send({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      cc: options.cc,
      bcc: options.bcc,
    })

    console.log('[email] Email sent successfully:', res)
    return res
  } catch (e) {
    console.error('[email] send error:', e)
    return { error: true }
  }
}
