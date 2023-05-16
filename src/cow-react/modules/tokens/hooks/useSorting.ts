import { balanceComparator, useTokenComparator } from 'components/SearchModal/CurrencySearch/sorting'
import { Token } from '@uniswap/sdk-core'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { TokenAmounts } from '../types'

export enum SORT_FIELD {
  NAME = 'name',
  BALANCE = 'balance',
}

export enum SORT_DIRECTION {
  ASCENDING = 'ascending',
  DESCENDING = 'descending',
}

interface SortByParams {
  field: SORT_FIELD
}

export type BalanceType = [TokenAmounts, boolean]

interface UseSortingParams {
  tokens: Token[]
  balances: BalanceType | undefined
}

interface UseSortingResult {
  result: Token[]
  context: SortingContextValue
}
interface SortingContextValue {
  sortField: SORT_FIELD | undefined
  sortDirection: SORT_DIRECTION | undefined
  sortBy: ({ field }: SortByParams) => void
}

export const SortingContext = createContext<SortingContextValue>({
  sortDirection: undefined,
  sortField: undefined,
  sortBy: () => {},
})

export function useSorting({ tokens, balances }: UseSortingParams): UseSortingResult {
  const [sortField, setSortField] = useState<SORT_FIELD>()
  const [sortDirection, setSortDirection] = useState<SORT_DIRECTION>()
  const tokenComparator = useTokenComparator(false)
  const applyDirection = useCallback(
    (condition: boolean) => {
      if (sortDirection === SORT_DIRECTION.ASCENDING) {
        return condition ? -1 : 1
      }

      if (sortDirection === SORT_DIRECTION.DESCENDING) {
        return condition ? 1 : -1
      }

      return 0
    },
    [sortDirection]
  )
  const sortBy = useCallback(
    ({ field }: SortByParams) => {
      if (field !== sortField) {
        setSortField(field)
        setSortDirection(SORT_DIRECTION.ASCENDING)
      } else {
        switch (sortDirection) {
          case SORT_DIRECTION.ASCENDING:
            setSortDirection(SORT_DIRECTION.DESCENDING)
            break
          case SORT_DIRECTION.DESCENDING:
            setSortDirection(undefined)
            setSortField(undefined)
            break
          default:
            setSortDirection(SORT_DIRECTION.ASCENDING)
            break
        }
      }
    },
    [sortDirection, sortField]
  )
  const result = useMemo(() => {
    if (!tokens || !Array.isArray(tokens)) {
      return []
    }

    return tokens
      .filter((datum) => Boolean(datum))
      .sort((firstToken, secondToken) => {
        if (!sortField) {
          // If there is no sort field selected (default)
          return tokenComparator(firstToken, secondToken)
        } else if (sortField === SORT_FIELD.BALANCE) {
          // If the sort field is Balance
          if (!balances) return 0

          const firstBalance = balances[0][firstToken.address]?.value
          const secondBalance = balances[0][secondToken.address]?.value
          const balanceComp = balanceComparator(firstBalance, secondBalance)

          return applyDirection(balanceComp > 0)
        } else {
          // If the sort field is something else
          const sortA = firstToken[sortField]
          const sortB = secondToken[sortField]

          if (!sortA || !sortB) return 0
          return applyDirection(sortA > sortB)
        }
      })
  }, [tokens, balances, sortField, applyDirection, tokenComparator])

  return {
    result,
    context: {
      sortField,
      sortDirection,
      sortBy,
    },
  }
}

export function useSortingContext() {
  return useContext(SortingContext)
}
