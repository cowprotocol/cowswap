import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Token } from '@uniswap/sdk-core'
import { ThemedText } from 'theme'
import Loader from 'components/Loader'
import LoadingRows from 'components/LoadingRows'
import { AutoColumn } from 'components/Column'
import TokensTableRow from './TokensTableRow'
import { Label, Wrapper, TableHeader, TableBody, Break, PageButtons, Arrow, ArrowButton, ClickableText } from './styled'

const MAX_ITEMS = 10

const SORT_FIELD = {
  name: 'name',
}

type TokenTableParams = {
  tokensData: Token[] | undefined
  maxItems?: number
}

export default function TokenTable({ tokensData, maxItems = MAX_ITEMS }: TokenTableParams) {
  // sorting
  const [sortField, setSortField] = useState(SORT_FIELD.name)
  const [sortDirection, setSortDirection] = useState<boolean>(false)

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  const sortedTokens = useMemo(() => {
    return tokensData
      ? tokensData
          .filter((x) => !!x)
          .sort((a, b) => {
            const sortA = a[sortField as keyof Token]
            const sortB = b[sortField as keyof Token]

            if (!sortA || !sortB) return 0

            if (a && b) {
              return sortA > sortB ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1
            } else {
              return -1
            }
          })
          .slice(maxItems * (page - 1), page * maxItems)
      : []
  }, [tokensData, maxItems, page, sortDirection, sortField])

  const handleSort = useCallback(
    (newField: string) => {
      setSortField(newField)
      setSortDirection(sortField !== newField ? true : !sortDirection)
    },
    [sortDirection, sortField]
  )

  const arrow = useCallback(
    (field: string) => {
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
            <ClickableText onClick={() => handleSort(SORT_FIELD.name)}>Name {arrow(SORT_FIELD.name)}</ClickableText>
          </TableHeader>

          <Break />

          <TableBody>
            {sortedTokens.map((data, i) => {
              if (data) {
                return (
                  <React.Fragment key={i}>
                    <TokensTableRow index={(page - 1) * MAX_ITEMS + i} tokenData={data} />
                    <Break />
                  </React.Fragment>
                )
              }
              return null
            })}
          </TableBody>

          <PageButtons>
            <ArrowButton
              onClick={() => {
                setPage(page === 1 ? page : page - 1)
              }}
            >
              <Arrow faded={page === 1 ? true : false}>←</Arrow>
            </ArrowButton>
            <ThemedText.Body>{'Page ' + page + ' of ' + maxPage}</ThemedText.Body>
            <ArrowButton
              onClick={() => {
                setPage(page === maxPage ? page : page + 1)
              }}
            >
              <Arrow faded={page === maxPage ? true : false}>→</Arrow>
            </ArrowButton>
          </PageButtons>
        </AutoColumn>
      ) : (
        <LoadingRows>
          {Array.from(Array(maxItems * 4), () => (
            <div />
          ))}
        </LoadingRows>
      )}
    </Wrapper>
  )
}
