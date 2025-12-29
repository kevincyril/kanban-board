'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'
import { useAuthenticationStatus } from '@nhost/react'
import { useMutation, useSubscription } from '@apollo/client'

import { CREATE_CARD } from '@/graphql/mutations/createCard'
import { UPDATE_CARD_POSITION_AND_COLUMN } from '@/graphql/mutations/updateCard'
import { UPDATE_CARD_DETAILS } from '@/graphql/mutations/updateCardDetails'
import { DELETE_CARD } from '@/graphql/mutations/deleteCard'
import { UPDATE_COLUMN_POSITION } from '@/graphql/mutations/updateColumn'
import { COLUMNS_WITH_CARDS_SUBSCRIPTION } from '@/graphql/subscriptions/columnsWithCards'

export default function BoardPage() {
  const { isAuthenticated } = useAuthenticationStatus()
  const { boardId } = useParams<{ boardId: string }>()

  const [newCardTitle, setNewCardTitle] = useState('')
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null)

  /* =========================
     Realtime data
  ========================= */
  const { data, loading } = useSubscription(
    COLUMNS_WITH_CARDS_SUBSCRIPTION,
    {
      variables: { boardId },
      skip: !isAuthenticated,
    }
  )

  const [createCard] = useMutation(CREATE_CARD)
  const [updateCard] = useMutation(UPDATE_CARD_POSITION_AND_COLUMN)
  const [updateColumn] = useMutation(UPDATE_COLUMN_POSITION)
  const [updateCardDetails] = useMutation(UPDATE_CARD_DETAILS)
  const [deleteCard] = useMutation(DELETE_CARD)

  if (!isAuthenticated) return <p>Please sign in</p>
  if (loading || !data) return <p>Loading…</p>

  /* =========================
     Drag handler
  ========================= */
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result
    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    // COLUMN DRAG
    if (type === 'COLUMN') {
      await updateColumn({
        variables: {
          id: draggableId,
          position: destination.index, // ✅ FIXED
        },
      })
      return
    }

    // CARD DRAG
    await updateCard({
      variables: {
        id: draggableId,
        column_id: destination.droppableId,
        position: destination.index, // ✅ FIXED
      },
    })
  }

  /* =========================
     Add card
  ========================= */
  const handleAddCard = async (columnId: string) => {
    if (!newCardTitle.trim()) return

    await createCard({
      variables: {
        column_id: columnId,
        title: newCardTitle,
        position: 0,
      },
    })

    setNewCardTitle('')
    setActiveColumnId(null)
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Board</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        {/* COLUMNS */}
        <Droppable
          droppableId="columns"
          direction="horizontal"
          type="COLUMN"
        >
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex gap-6 overflow-x-auto"
            >
              {data.columns.map((column: any, colIndex: number) => (
                <Draggable
                  draggableId={column.id}
                  index={colIndex}
                  key={column.id}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="w-72 shrink-0"
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="rounded-lg bg-gray-100 p-4 space-y-3"
                      >
                        <h2 className="font-semibold text-lg">
                          {column.name}
                        </h2>

                        {/* CARDS */}
                        <Droppable droppableId={column.id} type="CARD">
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="space-y-2"
                            >
                              {column.cards.map(
                                (card: any, index: number) => (
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
                                        className="rounded bg-white p-2 shadow-sm space-y-1"
                                      >
                                        <input
                                          className="w-full border rounded px-1 py-0.5"
                                          defaultValue={card.title}
                                          onBlur={(e) => {
                                            if (
                                              e.target.value !== card.title
                                            ) {
                                              updateCardDetails({
                                                variables: {
                                                  id: card.id,
                                                  title: e.target.value,
                                                },
                                              })
                                            }
                                          }}
                                        />

                                        <button
                                          className="text-xs text-red-500"
                                          onClick={() =>
                                            deleteCard({
                                              variables: { id: card.id },
                                            })
                                          }
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                  </Draggable>
                                )
                              )}

                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>

                        {/* ADD CARD */}
                        {activeColumnId === column.id ? (
                          <input
                            className="w-full rounded border px-2 py-1"
                            placeholder="Card title"
                            value={newCardTitle}
                            onChange={(e) =>
                              setNewCardTitle(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddCard(column.id)
                              }
                            }}
                          />
                        ) : (
                          <button
                            className="text-sm text-blue-600"
                            onClick={() =>
                              setActiveColumnId(column.id)
                            }
                          >
                            + Add card
                          </button>
                        )}
                      </div>
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
