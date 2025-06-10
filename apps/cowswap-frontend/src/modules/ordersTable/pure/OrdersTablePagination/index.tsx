import { useCallback, useMemo } from 'react'

import { ChevronLeft, ChevronRight } from 'react-feather'

import { ArrowButton, BlankButton, PageButton, PageButtonLink, PaginationBox } from './styled'

const PAGES_LIMIT = 14

export interface OrdersTablePaginationProps {
  getPageUrl?(index: number): Partial<{ pathname: string; search: string }>
  onPageChange?(index: number): void
  pageSize: number
  totalCount: number
  currentPage: number
  className?: string
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function OrdersTablePagination({
  pageSize,
  totalCount,
  currentPage,
  getPageUrl,
  onPageChange,
  className,
}: OrdersTablePaginationProps) {
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
        return
      }

      if (getPageUrl) {
        getPageUrl(page)
        return
      }
    },
    [onPageChange, getPageUrl],
  )

  return (
    <PaginationBox className={className}>
      {isListBig && (
        <>
          <ArrowButton onClick={() => goToPage(Math.max(currentPage - 1, 1))}>
            <ChevronLeft size={20} />
          </ArrowButton>
          {!isFirstPagesBatch && (
            <>
              <PageButton onClick={() => goToPage(1)}>1</PageButton>
              <BlankButton>...</BlankButton>
            </>
          )}
        </>
      )}
      {pagesArray.slice(batchStart, batchEnd).map((i) => {
        const index = i + 1

        if (onPageChange) {
          return (
            <PageButton key={index} $active={index === currentPage} onClick={() => onPageChange(index)}>
              {index}
            </PageButton>
          )
        }

        if (getPageUrl) {
          return (
            <PageButtonLink key={index} $active={index === currentPage} to={getPageUrl(index)}>
              {index}
            </PageButtonLink>
          )
        }

        return null
      })}
      {isListBig && (
        <>
          {!isLastPagesBatch && (
            <>
              <BlankButton>...</BlankButton>
              <PageButton onClick={() => goToPage(pagesCount)}>{pagesCount}</PageButton>
            </>
          )}
          <ArrowButton onClick={() => goToPage(Math.min(currentPage + 1, pagesCount))}>
            <ChevronRight size={20} />
          </ArrowButton>
        </>
      )}
    </PaginationBox>
  )
}
