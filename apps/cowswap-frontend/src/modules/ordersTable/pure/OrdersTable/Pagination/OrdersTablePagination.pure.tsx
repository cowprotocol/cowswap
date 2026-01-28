import { ReactNode, useCallback, useMemo } from 'react'

import { ChevronLeft, ChevronRight } from 'react-feather'

import { PageNavigationButton } from './Button/OrdersTablePaginationButton.pure'
import { PaginationBox } from './OrdersTablePagination.styled'
import { BlankButton } from './Button/OrdersTablePaginationButton.styled'

const PAGES_LIMIT = 14

export interface OrdersTablePaginationProps {
  getPageUrl?(index: number): Partial<{ pathname: string; search: string }>
  onPageChange?(index: number): void
  pageSize: number
  totalCount: number
  currentPage: number
  className?: string
}

export function OrdersTablePagination({
  pageSize,
  totalCount,
  currentPage,
  getPageUrl,
  onPageChange,
  className,
}: OrdersTablePaginationProps): ReactNode {
  const pagesCount = Math.ceil(totalCount / pageSize)

  const pagesArray = useMemo(() => [...new Array(pagesCount)].map((item, i) => i), [pagesCount])
  const pageLimitMiddle = Math.ceil(PAGES_LIMIT / 2)
  const batchOffset = currentPage > pageLimitMiddle ? currentPage - pageLimitMiddle : 0
  const isListBig = pagesCount > PAGES_LIMIT
  const isFirstPagesBatch = currentPage <= pageLimitMiddle
  const isLastPagesBatch = currentPage > pagesCount - pageLimitMiddle

  const batchStart = Math.max(Math.min(batchOffset, pagesCount - PAGES_LIMIT), 0)
  const batchEnd = Math.min(PAGES_LIMIT + batchOffset, pagesCount)

  const goToPage = useCallback(
    (page: number) => {
      if (onPageChange) {
        onPageChange(page)
      } else if (getPageUrl) {
        getPageUrl(page)
      }
    },
    [onPageChange, getPageUrl],
  )

  return (
    <PaginationBox className={className}>
      {isListBig && (
        <>
          <PageNavigationButton goToPage={goToPage} getPageUrl={getPageUrl} index={Math.max(currentPage - 1, 1)}>
            <ChevronLeft size={20} />
          </PageNavigationButton>

          {!isFirstPagesBatch && (
            <>
              <PageNavigationButton goToPage={goToPage} getPageUrl={getPageUrl} index={1}>
                1
              </PageNavigationButton>
              <BlankButton>...</BlankButton>
            </>
          )}
        </>
      )}
      {pagesArray.slice(batchStart, batchEnd).map((i) => {
        const index = i + 1

        return (
          <PageNavigationButton
            key={index}
            goToPage={goToPage}
            getPageUrl={getPageUrl}
            index={index}
            active={index === currentPage}
          >
            {index}
          </PageNavigationButton>
        )
      })}
      {isListBig && (
        <>
          {!isLastPagesBatch && (
            <>
              <BlankButton>...</BlankButton>
              <PageNavigationButton goToPage={goToPage} getPageUrl={getPageUrl} index={pagesCount}>
                {pagesCount}
              </PageNavigationButton>
            </>
          )}
          <PageNavigationButton
            goToPage={goToPage}
            getPageUrl={getPageUrl}
            index={Math.min(currentPage + 1, pagesCount)}
          >
            <ChevronRight size={20} />
          </PageNavigationButton>
        </>
      )}
    </PaginationBox>
  )
}
