import { useCallback, useMemo } from 'react'

import { UI } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import { ChevronLeft, ChevronRight } from 'react-feather'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components/macro'

export interface OrdersTablePaginationProps {
  getPageUrl?(index: number): Partial<{ pathname: string; search: string }>
  onPageChange?(index: number): void
  pageSize: number
  totalCount: number
  currentPage: number
  className?: string
}

const PaginationBox = styled.div`
  width: 100%;
  display: flex;
  overflow-x: auto;
  text-align: center;
  margin: 20px auto 0;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-content: flex-start;
  `};
`

const pageButtonStyles = css<{ $active?: boolean }>`
  background: ${({ theme, $active }) => ($active ? transparentize(theme.text3, 0.9) : 'transparent')};
  color: ${({ $active }) => ($active ? `var(${UI.COLOR_TEXT})` : `var(${UI.COLOR_TEXT_OPACITY_25})`)};
  border: 0;
  outline: 0;
  padding: 5px 6px;
  border-radius: 4px;
  width: 34px;
  margin: 0 5px;
  cursor: pointer;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out, color var(${UI.ANIMATION_DURATION}) ease-in-out;
  text-decoration: none;

  &:hover {
    background: var(${UI.COLOR_PAPER});
    color: inherit;
  }
`

const PageButtonLink = styled(Link)`
  ${pageButtonStyles}
`

const PageButton = styled.div`
  ${pageButtonStyles}
`

const BlankButton = styled(PageButton)`
  cursor: default;

  &:hover {
    background: transparent !important;
    color: var(${UI.COLOR_TEXT_OPACITY_25}) !important;
  }
`

const ArrowButton = styled.button`
  ${pageButtonStyles};
  width: 30px;
  height: 30px;
  text-align: center;
  margin: 0 5px;
  padding: 0;
  line-height: 0;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_25});
`

const PAGES_LIMIT = 14

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

  const batchStart = Math.min(batchOffset, pagesCount - PAGES_LIMIT)
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
    [onPageChange, getPageUrl]
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
