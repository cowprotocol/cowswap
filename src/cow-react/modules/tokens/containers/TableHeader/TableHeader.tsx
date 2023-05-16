import { TableHeader as TableHeaderPure } from '@cow/modules/tokens/pure'
import { SORT_FIELD, useSortingContext } from '../../hooks/useSorting'

export function TableHeader() {
  const { sortBy, sortDirection, sortField } = useSortingContext()
  return (
    <TableHeaderPure
      onSort={sortBy}
      sortField={sortField}
      sortDirection={sortDirection}
      fields={[
        {
          label: 'Token',
          sortId: SORT_FIELD.NAME,
        },
        {
          label: 'Balance',
          sortId: SORT_FIELD.BALANCE,
        },
        { label: 'Value' },
        { label: 'Actions' },
      ]}
    />
  )
}
