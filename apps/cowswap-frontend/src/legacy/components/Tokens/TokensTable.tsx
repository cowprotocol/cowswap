import { useAtom } from 'jotai'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { useFilterTokens, usePrevious } from '@cowprotocol/common-hooks'
import { closableBannersStateAtom, Loader } from '@cowprotocol/ui'
import { BigNumber } from '@ethersproject/bignumber'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'
import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { usePendingApprovalModal } from 'modules/erc20Approve'

import { BANNER_IDS } from 'common/constants/banners'
import { CowModal } from 'common/pure/Modal'

import { balanceComparator, useTokenComparator } from './sorting'
import {
  Arrow,
  ArrowButton,
  ClickableText,
  DelegateRow,
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

type TokenTableParams = {
  tokensData: TokenWithLogo[] | undefined
  maxItems?: number
  balances?: BalancesState['values']
  allowances: Record<string, BigNumber | undefined> | undefined
  page: number
  setPage: (page: number) => void
  query: string
  prevQuery: string
  debouncedQuery: string
  children?: ReactNode
}

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function
export function TokenTable({
  tokensData: rawTokensData = [],
  maxItems = MAX_ITEMS,
  balances,
  allowances,
  page,
  setPage,
  query,
  prevQuery,
  debouncedQuery,
  children,
}: TokenTableParams): ReactNode {
  const toggleWalletModal = useToggleWalletModal()
  const tableRef = useRef<HTMLTableElement | null>(null)
  const [bannerState] = useAtom(closableBannersStateAtom)
  const isDelegateBannerDismissed = bannerState[BANNER_IDS.DELEGATE]

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

  const {
    state: { isModalOpen: isApproveModalOpen, openModal: openApproveModal, closeModal: closeApproveModal },
    Modal: PendingApprovalModal,
  } = usePendingApprovalModal({ modalMode: true })

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

              const balanceA = balances[tokenA.address.toLowerCase()]
              const balanceB = balances[tokenB.address.toLowerCase()]
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
    [sortDirection, sortField],
  )

  const arrow = useCallback(
    (field: SORT_FIELD) => {
      return sortField === field ? (!sortDirection ? '↑' : '↓') : ''
    },
    [sortDirection, sortField],
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
      <CowModal isOpen={isApproveModalOpen} onDismiss={closeApproveModal}>
        {PendingApprovalModal}
      </CowModal>

      <>
        <Table ref={tableRef}>
          <TableHeader>
            <IndexLabel>#</IndexLabel>
            <ClickableText onClick={() => handleSort(SORT_FIELD.NAME)}>
              <Trans>Token</Trans> {arrow(SORT_FIELD.NAME)}
            </ClickableText>
            <ClickableText disabled={true} /* onClick={() => (account ? handleSort(SORT_FIELD.BALANCE) : false)} */>
              <Trans>Balance</Trans> {arrow(SORT_FIELD.BALANCE)}
            </ClickableText>
            <Label>
              <Trans>Value</Trans>
            </Label>
            <Label>
              <Trans>Actions</Trans>
            </Label>
          </TableHeader>

          {children && !isDelegateBannerDismissed && <DelegateRow>{children}</DelegateRow>}

          {tokensData && sortedTokens.length !== 0 ? (
            sortedTokens.map((data, i) => {
              const balanceRaw = balances && balances[data.address.toLowerCase()]
              const balance = balanceRaw ? CurrencyAmount.fromRawAmount(data, balanceRaw.toHexString()) : undefined

              const allowancesRaw = allowances && allowances[data.address.toLowerCase()]
              const allowance = allowancesRaw
                ? CurrencyAmount.fromRawAmount(data, allowancesRaw.toHexString())
                : undefined

              if (data) {
                return (
                  <Row key={data.address} data-address={data.address}>
                    <TokensTableRow
                      key={data.address}
                      toggleWalletModal={toggleWalletModal}
                      balance={balance}
                      allowance={allowance}
                      openApproveModal={openApproveModal}
                      closeApproveModal={closeApproveModal}
                      index={getTokenIndex(i)}
                      tokenData={data}
                    />
                  </Row>
                )
              }
              return null
            })
          ) : query?.trim() ? (
            <NoResults>
              <h3>
                <Trans>No results found</Trans> ¯\_(ツ)_/¯
              </h3>
            </NoResults>
          ) : (
            <Loader />
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

            <PaginationText>{t`Page ${page} of ${maxPage}`}</PaginationText>

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
