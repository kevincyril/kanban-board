import { gql } from '@apollo/client'

export const UPDATE_CARD_DETAILS = gql`
  mutation UpdateCardDetails(
    $id: uuid!
    $title: String!
    $description: String
  ) {
    update_cards_by_pk(
      pk_columns: { id: $id }
      _set: {
        title: $title
        description: $description
      }
    ) {
      id
      title
      description
    }
  }
`
