import { SORT_DIRECTION, SORT_FIELD } from '../../hooks/useSorting'
import { TableHeader } from './TableHeader'

const Fixtures = {
  default: (
    <TableHeader
      onSort={() => {}}
      sortField={SORT_FIELD.NAME}
      sortDirection={SORT_DIRECTION.ASCENDING}
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
  ),
}
export default Fixtures
