'use client'

import { gql, useQuery, useMutation } from '@apollo/client'
import { useAuthenticationStatus } from '@nhost/react'
import { useEffect, useState } from 'react'

/* =========================
   GraphQL Operations
========================= */

const BOARDS_QUERY = gql`
  query Boards {
    boards(order_by: { created_at: desc }) {
      id
      name
      created_at
    }
  }
`

const CREATE_BOARD = gql`
  mutation CreateBoard($name: String!) {
    insert_boards_one(object: { name: $name }) {
      id
      name
      created_at
    }
  }
`

/* =========================
   Page Component
========================= */

export default function BoardsPage() {
  const { isAuthenticated, isLoading: authLoading } =
    useAuthenticationStatus()

  // Prevent hydration / auth race issues
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const { data, loading, error } = useQuery(BOARDS_QUERY, {
    skip: !isAuthenticated || !mounted,
  })

  const [createBoard, { loading: creating }] = useMutation(
    CREATE_BOARD,
    {
      refetchQueries: ['Boards'],
    }
  )

  /* =========================
     Render Guards
  ========================= */

  if (!mounted) return null
  if (authLoading) return <p>Checking authentication…</p>
  if (!isAuthenticated) return <p>Please sign in</p>
  if (loading) return <p>Loading boards…</p>
  if (error)
    return (
      <p className="text-red-600">
        Error loading boards: {error.message}
      </p>
    )

  /* =========================
     UI
  ========================= */

  return (
    <main className="p-6 space-y-4 max-w-xl">
      <h1 className="text-2xl font-semibold">Boards</h1>

      <button
        onClick={() =>
          createBoard({
            variables: {
              name: `My Board ${Date.now()}`,
            },
          })
        }
        disabled={creating}
        className="px-4 py-2 rounded bg-black text-white"
      >
        {creating ? 'Creating…' : 'New Board'}
      </button>

      {data.boards.length === 0 ? (
        <p className="text-gray-500">No boards yet</p>
      ) : (
        <ul className="space-y-2">
          {data.boards.map(
            (board: { id: string; name: string }) => (
              <li
                key={board.id}
                className="border rounded p-3 hover:bg-gray-50"
              >
                {board.name}
              </li>
            )
          )}
        </ul>
      )}
    </main>
  )
}
