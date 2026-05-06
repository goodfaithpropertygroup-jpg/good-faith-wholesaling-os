import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
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
                                      {children}
                                              </body>
                                                    </html>
                                                        </ClerkProvider>
                                                          )
                                                          }
