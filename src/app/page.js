'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function HomePage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'authenticated') {
      router.push('/home')
    } else {
      router.push('/login')
    }
  }, [status, router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </main>
  )
}
