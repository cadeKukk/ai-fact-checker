import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import AppShell from '@/components/AppShell'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI Fact Checker',
  description: 'Combat misinformation about AI with verified, fact-checked information',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="paper-bg">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
