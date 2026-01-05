'use client'

import { useSignInEmailPassword } from '@nhost/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AuthPage() {
  const router = useRouter()
  const { signInEmailPassword, isLoading, error } =
    useSignInEmailPassword()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await signInEmailPassword(email, password)
    if (result.isSuccess) {
      router.push('/boards')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-80 space-y-4 rounded border p-6"
        autoComplete="off"
      >
        <h1 className="text-xl font-semibold">Sign in</h1>

        <input
          className="w-full rounded border px-2 py-1"
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
          suppressHydrationWarning
        />

        <input
          className="w-full rounded border px-2 py-1"
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          suppressHydrationWarning
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
        >
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>

        {error && (
          <p className="text-sm text-red-500">{error.message}</p>
        )}
      </form>
    </main>
  )
}
