import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Token } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'

import { balanceComparator, useTokenComparator } from 'legacy/components/SearchModal/CurrencySearch/sorting'
import { ConfirmOperationType } from 'legacy/components/TransactionConfirmationModal'
import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'
import useFilterTokens from 'legacy/hooks/useFilterTokens'
import usePrevious from 'legacy/hooks/usePrevious'
import useTransactionConfirmationModal from 'legacy/hooks/useTransactionConfirmationModal'
import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { TokenAmounts } from 'modules/tokens'

import {
  Arrow,
  ArrowButton,
  ClickableText,
  IndexLabel,
  Label,
  NoResults,
  PageButtons,
  PaginationText,
  Row,
  Table,
  TableHeader,
  Wrapper,
} from './styled'
import { TokensTableRow } from './TokensTableRow'

const MAX_ITEMS = 20

enum SORT_FIELD {
  NAME = 'name',
  BALANCE = 'balance',
}

type BalanceType = [TokenAmounts, boolean]

type TokenTableParams = {
  tokensData: Token[] | undefined
  maxItems?: number
  balances?: BalanceType
  page: number
  setPage: (page: number) => void
  query: string
  prevQuery: string
  debouncedQuery: string
}

export enum TableType {
  OVERVIEW = 'OVERVIEW',
  FAVOURITE = 'FAVOURITE',
}

export default function TokenTable({
  tokensData: rawTokensData = [],
  maxItems = MAX_ITEMS,
  balances,
  page,
  setPage,
  query,
  prevQuery,
  debouncedQuery,
}: TokenTableParams) {
  // const { account } = useWalletInfo()

  const toggleWalletModal = useToggleWalletModal()
  const tableRef = useRef<HTMLTableElement | null>(null)

  // reset pagination when user is in a page > 1, searching and deletes query
  useEffect(() => {
    // already on page 1, ignore
    if (page === 1) return

    // if there was some query and user deletes it
    // reset page
    if (!!prevQuery && !query) {
      setPage(1)
    }
  }, [query, page, setPage, prevQuery])

  const tokensData = useFilterTokens(rawTokensData, debouncedQuery)

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

  const { ErrorModal } = useErrorModal()

  const { TransactionConfirmationModal, openModal, closeModal } = useTransactionConfirmationModal(
    ConfirmOperationType.APPROVE_TOKEN
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

              const balanceA = balances[0][tokenA.address]?.value
              const balanceB = balances[0][tokenB.address]?.value
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
    <Wrapper id="tokens-table">
      <ErrorModal />
      <TransactionConfirmationModal />

      <>
        <Table ref={tableRef}>
          <TableHeader>
            <IndexLabel>#</IndexLabel>
            <ClickableText onClick={() => handleSort(SORT_FIELD.NAME)}>
              <Trans>Token {arrow(SORT_FIELD.NAME)}</Trans>
            </ClickableText>
            <ClickableText disabled={true} /* onClick={() => (account ? handleSort(SORT_FIELD.BALANCE) : false)} */>
              <Trans>Balance {arrow(SORT_FIELD.BALANCE)}</Trans>
            </ClickableText>
            <Label>Value</Label>
            <Label>Actions</Label>
          </TableHeader>

          {tokensData && sortedTokens.length !== 0 ? (
            sortedTokens.map((data, i) => {
              if (data) {
                return (
                  <Row key={data.address}>
                    <TokensTableRow
                      key={data.address}
                      toggleWalletModal={toggleWalletModal}
                      balance={balances && balances[0][data.address]?.value}
                      openTransactionConfirmationModal={openModal}
                      closeModals={closeModal}
                      index={getTokenIndex(i)}
                      tokenData={data}
                    />
                  </Row>
                )
              }
              return null
            })
          ) : (
            <NoResults>
              <h3>No results found ¯\_(ツ)_/¯</h3>
            </NoResults>
          )}
        </Table>

        {tokensData && sortedTokens.length !== 0 && (
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
        )}
      </>
    </Wrapper>
  )
}
