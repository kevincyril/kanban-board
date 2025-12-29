import { gql } from '@apollo/client'

export const CREATE_CARD = gql`
  mutation CreateCard(
    $column_id: uuid!
    $title: String!
    $position: numeric!
  ) {
    insert_cards_one(
      object: {
        column_id: $column_id
        title: $title
        position: $position
      }
    ) {
      id
      title
      position
    }
  }
`
