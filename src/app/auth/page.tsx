'use client'

import { useAuthenticationStatus, useSignInEmailPassword } from '@nhost/react'
import { useEffect, useState } from 'react'

export default function AuthPage() {
  const { isAuthenticated, isLoading } = useAuthenticationStatus()
  const { signInEmailPassword, isLoading: signingIn, error } =
    useSignInEmailPassword()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mounted, setMounted] = useState(false)

  // 👇 ensure client-only rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  if (isLoading) return <p>Loading…</p>
  if (isAuthenticated) return <p>✅ You are signed in</p>

  return (
    <main className="p-6 space-y-4 max-w-sm">
      <h1 className="text-xl font-semibold">Sign in</h1>

      <input
        className="border p-2 w-full"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2 w-full"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="bg-black text-white px-4 py-2"
        onClick={() => signInEmailPassword(email, password)}
        disabled={signingIn}
      >
        Sign in
      </button>

      {error && <p className="text-red-600">{error.message}</p>}
    </main>
  )
}
