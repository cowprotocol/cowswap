import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Trans } from '@lingui/macro'
import { Token } from '@uniswap/sdk-core'
import { ThemedText } from 'theme'
import Loader from 'components/Loader'
import LoadingRows from 'components/LoadingRows'
import { AutoColumn } from 'components/Column'
import TokensTableRow from './TokensTableRow'
import { Label, Wrapper, TableHeader, TableBody, Break, PageButtons, Arrow, ArrowButton, ClickableText } from './styled'

const MAX_ITEMS = 10

enum SORT_FIELD {
  NAME = 'name',
}

type TokenTableParams = {
  tokensData: Token[] | undefined
  maxItems?: number
  tableType?: TableType
}

export enum TableType {
  OVERVIEW = 'OVERVIEW',
  SAVED = 'SAVED',
}

export default function TokenTable({
  tokensData,
  maxItems = MAX_ITEMS,
  tableType = TableType.OVERVIEW,
}: TokenTableParams) {
  // sorting
  const [sortField, setSortField] = useState(SORT_FIELD.NAME)
  const [sortDirection, setSortDirection] = useState<boolean>(false)

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const prevPage = page === 1 ? page : page - 1
  const nextPage = page === maxPage ? page : page + 1

  // token index
  const getTokenIndex = useCallback((i: number) => (page - 1) * MAX_ITEMS + i, [page])

  const sortedTokens = useMemo(() => {
    return tokensData
      ? tokensData
          .filter((x) => !!x)
          .sort((a, b) => {
            const sortA = a[sortField]
            const sortB = b[sortField]

            if (!a || !b || !sortA || !sortB) return 0
            else return sortA > sortB ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1
          })
          .slice(maxItems * (page - 1), page * maxItems)
      : []
  }, [tokensData, maxItems, page, sortDirection, sortField])

  const handleSort = useCallback(
    (newField: SORT_FIELD) => {
      setSortField(newField)
      setSortDirection(sortField !== newField ? true : !sortDirection)
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
          </TableHeader>

          <Break />

          <TableBody>
            {sortedTokens.map((data, i) => {
              if (data) {
                return (
                  <React.Fragment key={i}>
                    <TokensTableRow tableType={tableType} index={getTokenIndex(i)} tokenData={data} />
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
