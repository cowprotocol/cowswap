import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { Trans } from '@lingui/macro'
import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import Loader from 'components/Loader'
import { AutoColumn } from 'components/Column'
import TokensTableRow from './TokensTableRow'
import {
  Label,
  Wrapper,
  TableHeader,
  TableBody,
  PageButtons,
  Arrow,
  ArrowButton,
  ClickableText,
  Table,
  PaginationText,
  IndexLabel,
  InfoCircle,
  TokenSearchInput,
} from './styled'
import { balanceComparator, useTokenComparator } from 'components/SearchModal/CurrencySearch/sorting'
import { useHistory } from 'react-router-dom'
import { OperationType } from 'components/TransactionConfirmationModal'
import { useErrorModal } from 'hooks/useErrorMessageAndModal'
import useTransactionConfirmationModal from 'hooks/useTransactionConfirmationModal'
import { useWalletModalToggle } from 'state/application/hooks'
import usePrevious from 'hooks/usePrevious'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { OrderKind } from '@cowprotocol/contracts'
import { PageViewKeys } from 'pages/Account/Tokens/TokensOverview'
import { MouseoverTooltip } from 'components/Tooltip'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
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
  balances?: BalanceType
  selectedView?: PageViewKeys
  page: number
  setPage: (page: number) => void
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
  balances,
  selectedView,
  page,
  setPage,
}: TokenTableParams) {
  const { account } = useActiveWeb3React()
  const native = useNativeCurrency()

  const toggleWalletModal = useWalletModalToggle()
  const tableRef = useRef<HTMLTableElement | null>(null)
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

  const tokenComparator = useTokenComparator(false)

  const applyDirection = useCallback((condition: boolean, sortDirection: boolean) => {
    return (condition ? -1 : 1) * (sortDirection ? -1 : 1)
  }, [])

  // pagination
  const [maxPage, setMaxPage] = useState(1)
  const prevPage = page === 1 ? page : page - 1
  const nextPage = page === maxPage ? page : page + 1
  const prevPageIndex = usePrevious(page)

  // token index
  const getTokenIndex = useCallback((i: number) => (page - 1) * MAX_ITEMS + i, [page])

  // buy and sell
  const history = useHistory()

  const handleBuyOrSell = useCallback(
    (token: Token, type: OrderKind) => {
      const typeQuery = type === OrderKind.BUY ? 'outputCurrency' : 'inputCurrency'
      history.push(`/swap?${typeQuery}=${token.address}`)
    },
    [history]
  )

  const { ErrorModal } = useErrorModal()

  const { TransactionConfirmationModal, openModal, closeModal } = useTransactionConfirmationModal(
    OperationType.APPROVE_TOKEN
  )

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

  // for small screens, auto-scrolls table to the left on the page change
  useEffect(() => {
    if (prevPageIndex !== page && tableRef.current) {
      tableRef.current.scrollLeft = 0
    }
  }, [page, prevPageIndex])

  return (
    <Wrapper>
      <ErrorModal />
      <TransactionConfirmationModal />
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
      {tokensData && sortedTokens.length !== 0 ? (
        <AutoColumn>
          <Table ref={tableRef}>
            <TableHeader>
              <IndexLabel>#</IndexLabel>
              <ClickableText onClick={() => handleSort(SORT_FIELD.NAME)}>
                <Trans>Name {arrow(SORT_FIELD.NAME)}</Trans>
              </ClickableText>
              <ClickableText disabled={!account} onClick={() => (account ? handleSort(SORT_FIELD.BALANCE) : false)}>
                <Trans>Balance {arrow(SORT_FIELD.BALANCE)}</Trans>
              </ClickableText>
              <Label>Value</Label>
              <Label>Buy</Label>
              <Label>Sell</Label>
              <Label>
                <span>Approve</span>
                <MouseoverTooltip
                  text={
                    <Trans>
                      Enable token for trading. This only need to be done once. Once it is enabled, you can place orders
                      for free using meta-transactions (no {native.name} is required)
                    </Trans>
                  }
                >
                  <InfoCircle size="20" color={'white'} />
                </MouseoverTooltip>
              </Label>
            </TableHeader>

            <TableBody>
              {sortedTokens.map((data, i) => {
                if (data) {
                  return (
                    <TokensTableRow
                      key={data.address}
                      handleBuyOrSell={handleBuyOrSell}
                      toggleWalletModal={toggleWalletModal}
                      balance={balances && balances[data.address]}
                      openTransactionConfirmationModal={openModal}
                      closeModals={closeModal}
                      index={getTokenIndex(i)}
                      tokenData={data}
                    />
                  )
                }
                return null
              })}
            </TableBody>
          </Table>

          <PageButtons>
            <ArrowButton onClick={() => setPage(1)}>
              <Arrow faded={page === 1}>{'<<'}</Arrow>
            </ArrowButton>

            <ArrowButton onClick={() => setPage(prevPage)}>
              <Arrow faded={page === 1}>←</Arrow>
            </ArrowButton>

            <PaginationText>
              <Trans>{'Page ' + page + ' of ' + maxPage}</Trans>
            </PaginationText>

            <ArrowButton onClick={() => setPage(nextPage)}>
              <Arrow faded={page === maxPage}>→</Arrow>
            </ArrowButton>

            <ArrowButton onClick={() => setPage(maxPage)}>
              <Arrow faded={page === maxPage}>{'>>'}</Arrow>
            </ArrowButton>
          </PageButtons>
        </AutoColumn>
      ) : !debouncedQuery ? (
        <Loader />
      ) : (
        <small>{'No results found :('}</small>
      )}
    </Wrapper>
  )
}
