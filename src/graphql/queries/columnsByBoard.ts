import { gql } from '@apollo/client'

export const COLUMNS_BY_BOARD = gql`
  query ColumnsByBoard($boardId: uuid!) {
    columns(
      where: { board_id: { _eq: $boardId } }
      order_by: { position: asc }
    ) {
      id
      name
      cards(order_by: { position: asc }) {
        id
        title
        position
      }
    }
  }
`
