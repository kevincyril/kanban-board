import { gql } from '@apollo/client'

export const COLUMNS_WITH_CARDS_SUBSCRIPTION = gql`
  subscription ColumnsWithCards($boardId: uuid!) {
    columns(
      where: { board_id: { _eq: $boardId } }
      order_by: { position: asc }
    ) {
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
`
