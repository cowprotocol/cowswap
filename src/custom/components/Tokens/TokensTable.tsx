import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Trans } from '@lingui/macro'
import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import { ThemedText } from 'theme'
import Loader from 'components/Loader'
import LoadingRows from 'components/LoadingRows'
import { AutoColumn } from 'components/Column'
import TokensTableRow from './TokensTableRow'
import { Label, Wrapper, TableHeader, TableBody, Break, PageButtons, Arrow, ArrowButton, ClickableText } from './styled'
import { balanceComparator, useTokenComparator } from 'components/SearchModal/CurrencySearch/sorting'

const MAX_ITEMS = 10

enum SORT_FIELD {
  NAME = 'name',
  BALANCE = 'balance',
}

type BalanceType = {
  [tokenAddress: string]: CurrencyAmount<Token> | undefined
}

type TokenTableParams = {
  tokensData: Token[] | undefined
  maxItems?: number
  tableType?: TableType
  balances?: BalanceType
}

export enum TableType {
  OVERVIEW = 'OVERVIEW',
  FAVOURITE = 'FAVOURITE',
}

export default function TokenTable({
  tokensData,
  maxItems = MAX_ITEMS,
  tableType = TableType.OVERVIEW,
  balances,
}: TokenTableParams) {
  // sorting
  const [sortField, setSortField] = useState<SORT_FIELD | null>(null)
  const [sortDirection, setSortDirection] = useState<boolean>(true)

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const prevPage = page === 1 ? page : page - 1
  const nextPage = page === maxPage ? page : page + 1

  // token index
  const getTokenIndex = useCallback((i: number) => (page - 1) * MAX_ITEMS + i, [page])

  //sorting
  const applyDirection = useCallback((condition: boolean, sortDirection: boolean) => {
    return condition ? (sortDirection ? -1 : 1) * -1 : (sortDirection ? -1 : 1) * 1
  }, [])

  const tokenComparator = useTokenComparator(false)

  const sortedTokens = useMemo(() => {
    return tokensData
      ? tokensData
          .filter((x) => !!x)
          .sort((a, b) => {
            if (!a || !b) {
              return 0
              // If there is no sort field selected (default)
            } else if (!sortField) {
              return tokenComparator(a, b)
              // If the sort field is Balance
            } else if (sortField === SORT_FIELD.BALANCE) {
              if (!balances) return 0

              const balanceA = balances[a.address]
              const balanceB = balances[b.address]
              const balanceComp = balanceComparator(balanceA, balanceB)

              return applyDirection(balanceComp > 0, sortDirection)
              // If the sort field is something else
            } else {
              const sortA = a[sortField]
              const sortB = b[sortField]

              if (!sortA || !sortB) return 0
              return applyDirection(sortA > sortB, sortDirection)
            }
          })
          .slice(maxItems * (page - 1), page * maxItems)
      : []
  }, [tokensData, maxItems, page, sortField, tokenComparator, balances, applyDirection, sortDirection])

  const handleSort = useCallback(
    (newField: SORT_FIELD | null) => {
      let newDirection

      // Reset to default order on 3rd click of the same sort field
      // meaning on first click the sortDirection will be set to true,
      // on second one to false and this will match the third click
      if (sortField === newField && sortDirection === false) {
        newField = null
        newDirection = true
        // This will match the first click on new sort field
      } else if (sortField === null) {
        newDirection = true
        // This will match the second click on the same field
      } else if (sortField === newField) {
        newDirection = !sortDirection
      } else {
        newDirection = true
      }

      setSortField(newField)
      setSortDirection(newDirection)
    },
    [sortDirection, sortField]
  )

  const arrow = useCallback(
    (field: SORT_FIELD) => {
      return sortField === field ? (!sortDirection ? '↑' : '↓') : ''
    },
    [sortDirection, sortField]
  )

  useEffect(() => {
    let extraPages = 1
    if (tokensData) {
      if (tokensData.length % maxItems === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(tokensData.length / maxItems) + extraPages)
    }
  }, [maxItems, tokensData])

  if (!tokensData) {
    return <Loader />
  }

  return (
    <Wrapper>
      {sortedTokens.length > 0 ? (
        <AutoColumn>
          <TableHeader>
            <Label>#</Label>
            <ClickableText onClick={() => handleSort(SORT_FIELD.NAME)}>
              <Trans>Name {arrow(SORT_FIELD.NAME)}</Trans>
            </ClickableText>
            <ClickableText onClick={() => handleSort(SORT_FIELD.BALANCE)}>
              <Trans>Balance {arrow(SORT_FIELD.BALANCE)}</Trans>
            </ClickableText>
          </TableHeader>

          <Break />

          <TableBody>
            {sortedTokens.map((data, i) => {
              if (data) {
                return (
                  <React.Fragment key={i}>
                    <TokensTableRow
                      balance={balances && balances[data.address]}
                      tableType={tableType}
                      index={getTokenIndex(i)}
                      tokenData={data}
                    />
                    <Break />
                  </React.Fragment>
                )
              }
              return null
            })}
          </TableBody>

          <PageButtons>
            <ArrowButton onClick={() => setPage(prevPage)}>
              <Arrow faded={page === 1}>←</Arrow>
            </ArrowButton>

            <ThemedText.Body>
              <Trans>{'Page ' + page + ' of ' + maxPage}</Trans>
            </ThemedText.Body>
            <ArrowButton onClick={() => setPage(nextPage)}>
              <Arrow faded={page === maxPage}>→</Arrow>
            </ArrowButton>
          </PageButtons>
        </AutoColumn>
      ) : (
        <LoadingRows>
          {Array.from(Array(maxItems * 4), (_, i) => (
            <div key={i} />
          ))}
        </LoadingRows>
      )}
    </Wrapper>
  )
}
