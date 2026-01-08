'use client'

import {
  gql,
  useMutation,
  useSubscription,
} from '@apollo/client'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useAuthenticationStatus } from '@nhost/react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'

/* =========================
   Types
========================= */

type Card = {
  id: string
  title: string
  position: number
  column_id: string
}

type Column = {
  id: string
  name: string
  position: number
  cards: Card[]
}

type Board = {
  id: string
  name: string
  columns: Column[]
}

/* =========================
   GraphQL (REALTIME)
========================= */

const BOARD_SUBSCRIPTION = gql`
  subscription Board($id: uuid!) {
    boards_by_pk(id: $id) {
      id
      name
      columns(order_by: { position: asc }) {
        id
        name
        position
        cards(order_by: { position: asc }) {
          id
          title
          position
          column_id
        }
      }
    }
  }
`

const CREATE_COLUMN = gql`
  mutation CreateColumn($boardId: uuid!, $name: String!) {
    insert_columns_one(
      object: { board_id: $boardId, name: $name, position: 0 }
    ) {
      id
    }
  }
`

const CREATE_CARD = gql`
  mutation CreateCard(
    $columnId: uuid!
    $title: String!
    $position: numeric!
  ) {
    insert_cards_one(
      object: {
        column_id: $columnId
        title: $title
        position: $position
      }
    ) {
      id
    }
  }
`

const UPDATE_CARD_POSITION = gql`
  mutation UpdateCardPosition(
    $id: uuid!
    $column_id: uuid!
    $position: numeric!
  ) {
    update_cards_by_pk(
      pk_columns: { id: $id }
      _set: { column_id: $column_id, position: $position }
    ) {
      id
    }
  }
`

const UPDATE_COLUMN_POSITION = gql`
  mutation UpdateColumnPosition($id: uuid!, $position: numeric!) {
    update_columns_by_pk(
      pk_columns: { id: $id }
      _set: { position: $position }
    ) {
      id
    }
  }
`

/* =========================
   Page
========================= */

export default function BoardPage() {
  const { isAuthenticated } = useAuthenticationStatus()
  const { boardId } = useParams<{ boardId: string }>()

  const [newColumnName, setNewColumnName] = useState('')
  const [newCardTitle, setNewCardTitle] = useState<Record<string, string>>({})

  /* ---------- REALTIME DATA ---------- */

  const { data, loading, error } = useSubscription<{
    boards_by_pk: Board
  }>(BOARD_SUBSCRIPTION, {
    variables: { id: boardId },
    skip: !isAuthenticated,
  })

  /* ---------- MUTATIONS ---------- */

  const [createColumn] = useMutation(CREATE_COLUMN)
  const [createCard] = useMutation(CREATE_CARD)
  const [updateCardPosition] = useMutation(UPDATE_CARD_POSITION)
  const [updateColumnPosition] = useMutation(UPDATE_COLUMN_POSITION)

  /* ---------- DRAG HANDLER ---------- */

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result
    if (!destination) return

    // COLUMN DRAG
    if (type === 'COLUMN') {
      if (destination.index === source.index) return

      await updateColumnPosition({
        variables: {
          id: draggableId,
          position: destination.index,
        },
      })
      return
    }

    // CARD DRAG
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    await updateCardPosition({
      variables: {
        id: draggableId,
        column_id: destination.droppableId,
        position: destination.index,
      },
    })
  }

  /* ---------- GUARDS ---------- */

  if (!isAuthenticated) return <p className="p-6">Please sign in</p>
  if (loading) return <p className="p-6">Loading…</p>
  if (error) return <p className="p-6">Error: {error.message}</p>
  if (!data?.boards_by_pk) return <p className="p-6">Board not found</p>

  const board = data.boards_by_pk

  /* ---------- UI ---------- */

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{board.name}</h1>

      {/* Create Column */}
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          if (!newColumnName.trim()) return

          await createColumn({
            variables: { boardId, name: newColumnName },
          })

          setNewColumnName('')
        }}
        className="flex gap-2"
      >
        <input
          className="rounded border px-2 py-1"
          placeholder="New column name"
          value={newColumnName}
          onChange={(e) => setNewColumnName(e.target.value)}
        />
        <button className="rounded bg-black px-3 py-1 text-white">
          Add Column
        </button>
      </form>

      {/* Columns + Cards */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId="columns"
          direction="horizontal"
          type="COLUMN"
        >
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex gap-4 overflow-x-auto"
            >
              {board.columns.map((column, colIndex) => (
                <Draggable
                  draggableId={column.id}
                  index={colIndex}
                  key={column.id}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="w-64 shrink-0 rounded border bg-gray-50 p-3 space-y-3"
                    >
                      <h2
                        {...provided.dragHandleProps}
                        className="font-semibold cursor-grab"
                      >
                        {column.name}
                      </h2>

                      {/* Cards */}
                      <Droppable droppableId={column.id} type="CARD">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="space-y-2"
                          >
                            {column.cards.map((card, index) => (
                              <Draggable
                                draggableId={card.id}
                                index={index}
                                key={card.id}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="rounded bg-white p-2 shadow-sm"
                                  >
                                    {card.title}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>

                      {/* Add Card */}
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault()
                          const title = newCardTitle[column.id]
                          if (!title?.trim()) return

                          await createCard({
                            variables: {
                              columnId: column.id,
                              title,
                              position: column.cards.length,
                            },
                          })

                          setNewCardTitle((prev) => ({
                            ...prev,
                            [column.id]: '',
                          }))
                        }}
                        className="flex gap-1"
                      >
                        <input
                          className="flex-1 rounded border px-1 py-0.5 text-sm"
                          placeholder="New card"
                          value={newCardTitle[column.id] || ''}
                          onChange={(e) =>
                            setNewCardTitle((prev) => ({
                              ...prev,
                              [column.id]: e.target.value,
                            }))
                          }
                        />
                        <button className="rounded bg-black px-2 text-white text-sm">
                          +
                        </button>
                      </form>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </main>
  )
}
