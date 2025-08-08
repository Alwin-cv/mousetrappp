import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dynamic Interaction Demo',
  description: 'A unique, responsive interaction demonstration',
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ scrollBehavior: 'smooth', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  )
}
