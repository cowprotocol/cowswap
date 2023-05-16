import { SORT_DIRECTION } from '../../hooks/useSorting'

interface SortButtonParams {
  isVisible: boolean
  sortDirection?: SORT_DIRECTION
}

export function SortButton({ isVisible, sortDirection }: SortButtonParams) {
  if (isVisible) {
    switch (sortDirection) {
      case SORT_DIRECTION.ASCENDING:
        return <>↑</>
      case SORT_DIRECTION.DESCENDING:
        return <>↓</>
    }
  }

  return <></>
}
