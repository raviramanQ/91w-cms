import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import SessionProviderWrapper from '@/components/SessionProviderWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '91W CMS',
  description: 'Content Management System for 91Wheels',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderWrapper>
          <ThemeProvider>
            <AuthProvider>
              <div className="min-h-screen bg-gray-50">
                {children}
              </div>
            </AuthProvider>
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
