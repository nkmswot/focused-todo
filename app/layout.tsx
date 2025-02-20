import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Focused Todo App | Time Management',
  description: 'Task Todo Manager for time management',
  generator: 'SWOT SOLUTIONS',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
