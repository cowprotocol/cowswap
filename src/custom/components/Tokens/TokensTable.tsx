import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { Trans } from '@lingui/macro'
import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import Loader from 'components/Loader'
import LoadingRows from 'components/LoadingRows'
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
} from './styled'
import { balanceComparator, useTokenComparator } from 'components/SearchModal/CurrencySearch/sorting'
import { useHistory } from 'react-router-dom'
import { OperationType } from 'components/TransactionConfirmationModal'
import { useErrorModal } from 'hooks/useErrorMessageAndModal'
import useTransactionConfirmationModal from 'hooks/useTransactionConfirmationModal'
import { useWalletModalToggle } from 'state/application/hooks'
import usePrevious from 'hooks/usePrevious'

const MAX_ITEMS = 10
const MAX_COLUMNS = 6

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
  loadingRows?: number
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
  loadingRows = MAX_ITEMS,
}: TokenTableParams) {
  const toggleWalletModal = useWalletModalToggle()
  const tableRef = useRef<HTMLTableElement | null>(null)

  // sorting
  const [sortField, setSortField] = useState<SORT_FIELD | null>(null)
  const [sortDirection, setSortDirection] = useState<boolean>(true)

  const tokenComparator = useTokenComparator(false)

  const applyDirection = useCallback((condition: boolean, sortDirection: boolean) => {
    return (condition ? -1 : 1) * (sortDirection ? -1 : 1)
  }, [])

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const prevPage = page === 1 ? page : page - 1
  const nextPage = page === maxPage ? page : page + 1
  const prevPageIndex = usePrevious(page)

  // token index
  const getTokenIndex = useCallback((i: number) => (page - 1) * MAX_ITEMS + i, [page])

  // buy and sell
  const history = useHistory()

  const handleBuy = useCallback(
    (token: Token) => {
      history.push(`/swap?outputCurrency=${token.address}`)
    },
    [history]
  )

  const handleSell = useCallback(
    (token: Token) => {
      history.push(`/swap?inputCurrency=${token.address}`)
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

  if (!tokensData) {
    return <Loader />
  }

  return (
    <Wrapper>
      <ErrorModal />
      <TransactionConfirmationModal />
      {sortedTokens.length > 0 ? (
        <AutoColumn>
          <Table ref={tableRef}>
            <TableHeader>
              <Label>#</Label>
              <ClickableText onClick={() => handleSort(SORT_FIELD.NAME)}>
                <Trans>Name {arrow(SORT_FIELD.NAME)}</Trans>
              </ClickableText>
              <ClickableText onClick={() => handleSort(SORT_FIELD.BALANCE)}>
                <Trans>Balance {arrow(SORT_FIELD.BALANCE)}</Trans>
              </ClickableText>
              <Label>Buy</Label>
              <Label>Sell</Label>
              <Label>Approve</Label>
            </TableHeader>

            <TableBody>
              {sortedTokens.map((data, i) => {
                if (data) {
                  return (
                    <TokensTableRow
                      key={data.address}
                      handleSell={handleSell}
                      handleBuy={handleBuy}
                      toggleWalletModal={toggleWalletModal}
                      balance={balances && balances[data.address]}
                      openModal={openModal}
                      closeModal={closeModal}
                      tableType={tableType}
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
            <ArrowButton onClick={() => setPage(prevPage)}>
              <Arrow faded={page === 1}>←</Arrow>
            </ArrowButton>

            <PaginationText>
              <Trans>{'Page ' + page + ' of ' + maxPage}</Trans>
            </PaginationText>

            <ArrowButton onClick={() => setPage(nextPage)}>
              <Arrow faded={page === maxPage}>→</Arrow>
            </ArrowButton>
          </PageButtons>
        </AutoColumn>
      ) : (
        <LoadingRows>
          {Array.from(Array(loadingRows * MAX_COLUMNS), (_, i) => (
            <div key={i} />
          ))}
        </LoadingRows>
      )}
    </Wrapper>
  )
}
