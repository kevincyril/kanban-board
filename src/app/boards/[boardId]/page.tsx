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

/* shadcn */
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardHeader,
  CardContent,
} from '@/components/ui/card'

/* =========================
   Types
========================= */

type CardType = {
  id: string
  title: string
  position: number
  column_id: string
}

type Column = {
  id: string
  name: string
  position: number
  cards: CardType[]
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

const UPDATE_CARD_TITLE = gql`
  mutation UpdateCardTitle($id: uuid!, $title: String!) {
    update_cards_by_pk(
      pk_columns: { id: $id }
      _set: { title: $title }
    ) {
      id
    }
  }
`

const DELETE_CARD = gql`
  mutation DeleteCard($id: uuid!) {
    delete_cards_by_pk(id: $id) {
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
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const { data, loading, error } = useSubscription<{
    boards_by_pk: Board
  }>(BOARD_SUBSCRIPTION, {
    variables: { id: boardId },
    skip: !isAuthenticated,
  })

  const [createColumn] = useMutation(CREATE_COLUMN)
  const [createCard] = useMutation(CREATE_CARD)
  const [updateCardPosition] = useMutation(UPDATE_CARD_POSITION)
  const [updateColumnPosition] = useMutation(UPDATE_COLUMN_POSITION)
  const [updateCardTitle] = useMutation(UPDATE_CARD_TITLE)
  const [deleteCard] = useMutation(DELETE_CARD)

  /* ---------- Drag ---------- */

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result
    if (!destination) return

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

  /* ---------- Guards ---------- */

  if (!isAuthenticated) return <p className="p-6">Please sign in</p>
  if (loading) return <p className="p-6">Loading…</p>
  if (error) return <p className="p-6">Error: {error.message}</p>
  if (!data?.boards_by_pk) return <p className="p-6">Board not found</p>

  const board = data.boards_by_pk

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
        <Input
          placeholder="New column name"
          value={newColumnName}
          onChange={(e) => setNewColumnName(e.target.value)}
        />
        <Button>Add Column</Button>
      </form>

      {/* Columns */}
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
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="w-64 shrink-0"
                    >
                      <CardHeader
                        {...provided.dragHandleProps}
                        className="cursor-grab font-semibold"
                      >
                        {column.name}
                      </CardHeader>

                      <CardContent className="space-y-2">
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
                                    <Card
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="p-2 space-y-1"
                                    >
                                      {editingCardId === card.id ? (
                                        <Input
                                          autoFocus
                                          value={editValue}
                                          onChange={(e) =>
                                            setEditValue(e.target.value)
                                          }
                                          onBlur={async () => {
                                            if (editValue.trim()) {
                                              await updateCardTitle({
                                                variables: {
                                                  id: card.id,
                                                  title: editValue,
                                                },
                                              })
                                            }
                                            setEditingCardId(null)
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.currentTarget.blur()
                                            }
                                          }}
                                        />
                                      ) : (
                                        <div
                                          className="cursor-pointer"
                                          onClick={() => {
                                            setEditingCardId(card.id)
                                            setEditValue(card.title)
                                          }}
                                        >
                                          {card.title}
                                        </div>
                                      )}

                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                          deleteCard({
                                            variables: { id: card.id },
                                          })
                                        }
                                      >
                                        Delete
                                      </Button>
                                    </Card>
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
                          <Input
                            placeholder="New task"
                            value={newCardTitle[column.id] || ''}
                            onChange={(e) =>
                              setNewCardTitle((prev) => ({
                                ...prev,
                                [column.id]: e.target.value,
                              }))
                            }
                          />
                          <Button size="sm">+</Button>
                        </form>
                      </CardContent>
                    </Card>
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
