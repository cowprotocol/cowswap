import React from 'react'

import { Wrapper, Table } from './styled'

export type SimpleTableProps = {
  header?: React.ReactNode
  body?: React.ReactNode
  className?: string
  numColumns?: number
  columnViewMobile?: boolean
}

export const SimpleTable = ({
  header,
  body,
  className,
  numColumns,
  columnViewMobile,
}: SimpleTableProps): React.ReactNode => (
  <Wrapper columnViewMobile={columnViewMobile}>
    <Table $numColumns={numColumns} className={className} columnViewMobile={columnViewMobile}>
      {header && <thead>{header}</thead>}
      <tbody>{body}</tbody>
    </Table>
  </Wrapper>
)
