import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Trans } from '@lingui/macro'
import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import { ThemedText } from 'theme'
import Loader from 'components/Loader'
import LoadingRows from 'components/LoadingRows'
import { AutoColumn } from 'components/Column'
import TokensTableRow from './TokensTableRow'
import { balanceComparator, useTokenComparator } from 'components/SearchModal/CurrencySearch/sorting'
import {
  Label,
  Wrapper,
  TableHeader,
  TableBody,
  Break,
  PageButtons,
  Arrow,
  ArrowButton,
  ClickableText,
  TokenSearchInput,
} from './styled'
import useDebounce from 'hooks/useDebounce'
import { ContentWrapper as SearchInputFormatter } from 'components/SearchModal/CurrencySearch'

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

const _filterCb = (token: Token, query?: string) => {
  if (!query) return false

  const cleanQuery = query.toLowerCase()
  const address = token.address.toLowerCase()
  const symbol = token.symbol?.toLowerCase()
  const name = token.name?.toLowerCase()

  return address.match(cleanQuery) || symbol?.match(cleanQuery) || name?.match(cleanQuery)
}

export default function TokenTable({
  tokensData: rawTokensData = [],
  maxItems = MAX_ITEMS,
  tableType = TableType.OVERVIEW,
  balances,
}: TokenTableParams) {
  // search - takes precedence re:filtering
  const [query, setQuery] = useState<string>('')
  const debouncedQuery = useDebounce(query, 300)

  const handleChange = useCallback((event) => {
    const { value } = event.target
    setQuery(value)
  }, [])

  const tokensData = useMemo(() => {
    // only calc anything if we actually have more than 1 token in list
    // and the user is actively searching tokens
    if (rawTokensData.length > 1 && debouncedQuery) {
      return rawTokensData.filter((token) => _filterCb(token, debouncedQuery))
    } else {
      return rawTokensData
    }
  }, [rawTokensData, debouncedQuery])

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
    return (condition ? -1 : 1) * (sortDirection ? -1 : 1)
  }, [])

  const tokenComparator = useTokenComparator(false)

  const sortedTokens = useMemo(() => {
    return tokensData
      ? tokensData
          .filter((x) => !!x)
          .sort((tokenA, tokenB) => {
            if (!sortField) {
              // If there is no sort field selected (default)
              return tokenComparator(tokenA, tokenB)
            } else if (sortField === SORT_FIELD.BALANCE) {
              // If the sort field is Balance
              if (!balances) return 0

              const balanceA = balances[tokenA.address]
              const balanceB = balances[tokenB.address]
              const balanceComp = balanceComparator(balanceA, balanceB)

              return applyDirection(balanceComp > 0, sortDirection)
            } else {
              // If the sort field is something else
              const sortA = tokenA[sortField]
              const sortB = tokenB[sortField]

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

  if (!query && !tokensData) {
    return <Loader />
  }

  return (
    <Wrapper>
      <SearchInputFormatter>
        <TokenSearchInput
          type="text"
          id="token-search-input"
          placeholder={`Search name/symbol or paste address`}
          autoComplete="off"
          value={query}
          onChange={handleChange}
        />
      </SearchInputFormatter>
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
      ) : !debouncedQuery ? (
        <LoadingRows>
          {Array.from(Array(maxItems * 4), (_, i) => (
            <div key={i} />
          ))}
        </LoadingRows>
      ) : (
        <small>{'No results found :('}</small>
      )}
    </Wrapper>
  )
}
