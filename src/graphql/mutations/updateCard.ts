import { gql } from '@apollo/client'

export const UPDATE_CARD_POSITION_AND_COLUMN = gql`
  mutation UpdateCardPositionAndColumn(
    $id: uuid!
    $column_id: uuid!
    $position: numeric!
  ) {
    update_cards_by_pk(
      pk_columns: { id: $id }
      _set: {
        column_id: $column_id
        position: $position
      }
    ) {
      id
      column_id
      position
    }
  }
`
