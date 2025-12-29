'use client'

import { gql, useQuery } from '@apollo/client'
import { useAuthenticationStatus } from '@nhost/react'
import Link from 'next/link'

const BOARDS = gql`
  query Boards {
    boards(order_by: { created_at: desc }) {
      id
      name
    }
  }
`

export default function BoardsPage() {
  const { isAuthenticated } = useAuthenticationStatus()

  const { data, loading, error } = useQuery(BOARDS, {
    skip: !isAuthenticated,
  })

  if (!isAuthenticated) return <p>Please sign in</p>
  if (loading) return <p>Loading…</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Boards</h1>

      <ul className="list-disc pl-6">
        {data.boards.map((b: { id: string; name: string }) => (
          <li key={b.id}>
            <Link
              href={`/boards/${b.id}`}
              className="text-blue-600 hover:underline"
            >
              {b.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
