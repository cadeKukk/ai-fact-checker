import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

const MAX_MESSAGE_LEN = 12_000

/** Inbox for feedback (override in Vercel env if needed). */
const RECIPIENT = process.env.FEEDBACK_RECIPIENT ?? 'cadekukk@gmail.com'

/**
 * `from` must be allowed in your Resend project. Default works for early testing
 * with Resend; for production, verify a domain at resend.com and set RESEND_FROM
 * to something like: AI Fact Checker <feedback@yourdomain.com>
 */
const DEFAULT_FROM = 'AI Fact Checker <onboarding@resend.dev>'

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Server email is not configured.' },
      { status: 503 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const message =
    typeof body === 'object' && body !== null && 'message' in body
      ? String((body as { message: unknown }).message)
      : ''
  const text = message.trim()
  if (!text) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
  }
  if (text.length > MAX_MESSAGE_LEN) {
    return NextResponse.json({ error: 'Message is too long.' }, { status: 400 })
  }

  const resend = new Resend(apiKey)
  const from = process.env.RESEND_FROM?.trim() || DEFAULT_FROM

  const { data, error } = await resend.emails.send({
    from,
    to: [RECIPIENT],
    subject: 'AI Fact Checker — feedback',
    text: `New feedback from the web app:\n\n${text}\n\n---\nSent from AI Fact Checker (server)`,
  })

  if (error) {
    console.error('Resend error:', error.message)
    return NextResponse.json(
      { error: 'Could not send feedback. Please try again in a moment.' },
      { status: 502 }
    )
  }

  return NextResponse.json({ ok: true as const, id: data?.id })
}
