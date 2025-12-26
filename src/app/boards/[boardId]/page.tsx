'use client'

import { gql, useQuery } from '@apollo/client'
import { useAuthenticationStatus } from '@nhost/react'
import { useParams } from 'next/navigation'

const BOARD_BY_ID = gql`
  query BoardById($id: uuid!) {
    boards_by_pk(id: $id) {
      id
      name
    }
  }
`

export default function BoardPage() {
  const { isAuthenticated } = useAuthenticationStatus()
  const params = useParams<{ boardId: string }>()

  const { data, loading, error } = useQuery(BOARD_BY_ID, {
    variables: { id: params.boardId },
    skip: !isAuthenticated,
  })

  if (!isAuthenticated) return <p>Please sign in</p>
  if (loading) return <p>Loading board…</p>
  if (error) return <p>Error: {error.message}</p>
  if (!data?.boards_by_pk) return <p>Board not found</p>

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">{data.boards_by_pk.name}</h1>
      <p className="text-muted-foreground">Columns coming next…</p>
    </main>
  )
}
