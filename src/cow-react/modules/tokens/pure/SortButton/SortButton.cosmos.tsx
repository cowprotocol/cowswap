import { SORT_DIRECTION } from '../../hooks/useSorting'
import { SortButton } from './SortButton'

const Fixtures = {
  ascending: <SortButton isVisible sortDirection={SORT_DIRECTION.ASCENDING} />,
  descending: <SortButton isVisible sortDirection={SORT_DIRECTION.DESCENDING} />,
}

export default Fixtures
