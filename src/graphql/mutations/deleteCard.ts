import { gql } from '@apollo/client'

export const DELETE_CARD = gql`
  mutation DeleteCard($id: uuid!) {
    delete_cards_by_pk(id: $id) {
      id
    }
  }
`
