import { gql } from '@apollo/client'

export const UPDATE_COLUMN_POSITION = gql`
  mutation UpdateColumnPosition(
    $id: uuid!
    $position: numeric!
  ) {
    update_columns(
      where: { id: { _eq: $id } }
      _set: { position: $position }
    ) {
      affected_rows
    }
  }
`
