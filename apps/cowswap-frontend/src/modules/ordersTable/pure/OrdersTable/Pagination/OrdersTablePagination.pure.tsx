import { ReactNode, useCallback, useMemo } from 'react'

import { useLingui } from '@lingui/react/macro'
import { ChevronLeft, ChevronRight } from 'react-feather'

import { PageNavigationButton } from './Button/OrdersTablePaginationButton.pure'
import { BlankButton } from './Button/OrdersTablePaginationButton.styled'
import { PaginationBox } from './OrdersTablePagination.styled'

const PAGES_LIMIT = 14

export interface OrdersTablePaginationProps {
  getPageUrl?(index: number): Partial<{ pathname: string; search: string }>
  onPageChange?(index: number): void
  pageSize: number
  totalCount: number
  currentPage: number
  className?: string
}

interface PaginationState {
  isListBig: boolean
  isFirstPagesBatch: boolean
  isLastPagesBatch: boolean
  batchStart: number
  batchEnd: number
  previousPage: number
  nextPage: number
}

export function OrdersTablePagination({
  pageSize,
  totalCount,
  currentPage,
  getPageUrl,
  onPageChange,
  className,
}: OrdersTablePaginationProps): ReactNode {
  const { t } = useLingui()
  const pagesCount = Math.ceil(totalCount / pageSize)

  const pagesArray = useMemo(() => [...new Array(pagesCount)].map((item, i) => i), [pagesCount])
  const { isListBig, isFirstPagesBatch, isLastPagesBatch, batchStart, batchEnd, previousPage, nextPage } =
    getPaginationState(currentPage, pagesCount)
  const getPageAriaLabel = (page: number): string => t`Go to page ${page}`
  const getCurrentPageAriaLabel = (page: number): string => t`Page ${page}`

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
    <PaginationBox className={className} aria-label={t`Orders pages`}>
      {isListBig && (
        <>
          <PageNavigationButton
            goToPage={goToPage}
            getPageUrl={getPageUrl}
            index={previousPage}
            ariaLabel={getPageAriaLabel(previousPage)}
          >
            <ChevronLeft aria-hidden size={20} />
          </PageNavigationButton>

          {!isFirstPagesBatch && (
            <>
              <PageNavigationButton
                goToPage={goToPage}
                getPageUrl={getPageUrl}
                index={1}
                ariaLabel={getPageAriaLabel(1)}
              >
                1
              </PageNavigationButton>
              {batchStart > 1 && <BlankButton aria-hidden>...</BlankButton>}
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
            ariaLabel={index === currentPage ? getCurrentPageAriaLabel(index) : getPageAriaLabel(index)}
          >
            {index}
          </PageNavigationButton>
        )
      })}
      {isListBig && (
        <>
          {!isLastPagesBatch && (
            <>
              {batchEnd < pagesCount - 1 && <BlankButton aria-hidden>...</BlankButton>}
              <PageNavigationButton
                goToPage={goToPage}
                getPageUrl={getPageUrl}
                index={pagesCount}
                ariaLabel={getPageAriaLabel(pagesCount)}
              >
                {pagesCount}
              </PageNavigationButton>
            </>
          )}
          <PageNavigationButton
            goToPage={goToPage}
            getPageUrl={getPageUrl}
            index={nextPage}
            ariaLabel={getPageAriaLabel(nextPage)}
          >
            <ChevronRight aria-hidden size={20} />
          </PageNavigationButton>
        </>
      )}
    </PaginationBox>
  )
}

function getPaginationState(currentPage: number, pagesCount: number): PaginationState {
  const pageLimitMiddle = Math.ceil(PAGES_LIMIT / 2)
  const batchOffset = currentPage > pageLimitMiddle ? currentPage - pageLimitMiddle : 0
  const batchStart = Math.max(Math.min(batchOffset, pagesCount - PAGES_LIMIT), 0)
  const batchEnd = Math.min(PAGES_LIMIT + batchOffset, pagesCount)

  return {
    isListBig: pagesCount > PAGES_LIMIT,
    isFirstPagesBatch: batchStart === 0,
    isLastPagesBatch: batchEnd === pagesCount,
    batchStart,
    batchEnd,
    previousPage: Math.max(currentPage - 1, 1),
    nextPage: Math.min(currentPage + 1, pagesCount),
  }
}
