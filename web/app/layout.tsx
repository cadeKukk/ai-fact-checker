import type { Metadata } from 'next'
import { Instrument_Serif, Space_Mono } from 'next/font/google'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI Fact Checker',
  description: 'Combat misinformation about AI with verified, fact-checked information',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${spaceMono.variable}`}>
      <body className="paper-bg">
        {children}
      </body>
    </html>
  )
}
