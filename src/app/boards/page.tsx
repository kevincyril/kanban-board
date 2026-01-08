'use client'

import { gql, useMutation, useSubscription } from '@apollo/client'
import { useAuthenticationStatus } from '@nhost/react'
import { useState } from 'react'
import Link from 'next/link'

/* =========================
   Types
========================= */

type Board = {
  id: string
  name: string
}

/* =========================
   GraphQL
========================= */

const BOARDS_SUBSCRIPTION = gql`
  subscription Boards {
    boards(order_by: { created_at: desc }) {
      id
      name
    }
  }
`

const CREATE_BOARD = gql`
  mutation CreateBoard($name: String!) {
    insert_boards_one(object: { name: $name }) {
      id
      name
    }
  }
`

/* =========================
   Page
========================= */

export default function BoardsPage() {
  const { isAuthenticated } = useAuthenticationStatus()
  const [name, setName] = useState('')

  const { data, loading, error } = useSubscription<{ boards: Board[] }>(
    BOARDS_SUBSCRIPTION,
    {
      skip: !isAuthenticated,
    }
  )

  const [createBoard, { loading: creating }] = useMutation(CREATE_BOARD)

  if (!isAuthenticated) return <p>Please sign in</p>
  if (loading) return <p>Loading…</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Boards</h1>

      <form
        onSubmit={async (e) => {
          e.preventDefault()
          if (!name.trim()) return
          await createBoard({ variables: { name } })
          setName('')
        }}
        className="flex gap-2"
      >
        <input
          className="rounded border px-2 py-1"
          placeholder="New board name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          disabled={creating}
          className="rounded bg-black px-3 py-1 text-white"
        >
          {creating ? 'Creating…' : 'Create'}
        </button>
      </form>

      <ul className="list-disc pl-6 space-y-1">
        {data?.boards.map((b) => (
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
