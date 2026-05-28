import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SideNav from '@/components/nav/SideNav'
import BottomNav from '@/components/nav/BottomNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Highlights',
  description: 'Log your daily highlights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-base-50">
          {/* Sidebar — desktop only */}
          <SideNav />

          {/* Main content */}
          <main className="flex-1 md:ml-56 pb-20 md:pb-0">
            <div className="max-w-2xl mx-auto p-6">
              {children}
            </div>
          </main>

          {/* Bottom nav — mobile only */}
          <BottomNav />
        </div>
      </body>
    </html>
  )
}