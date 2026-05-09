import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs'
import Sidebar from '@/components/Sidebar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Good Faith Property Group — Wholesaling OS',
  description: 'Self-operating real estate wholesaling OS. Lead CRM, Cash Buyer Hub, Deal Pipeline, Auto-follow-ups.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <SignedIn>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </SignedIn>
          <SignedOut>
            {children}
          </SignedOut>
        </body>
      </html>
    </ClerkProvider>
  )
}
