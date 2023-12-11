import { UI } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
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
  padding: 5px 10px;
  border-radius: 4px;
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

export function OrdersTablePagination({
  pageSize,
  totalCount,
  currentPage,
  getPageUrl,
  onPageChange,
  className,
}: OrdersTablePaginationProps) {
  const pagesCount = Math.ceil(totalCount / pageSize)

  return (
    <PaginationBox className={className}>
      {[...new Array(pagesCount)].map((item, i) => {
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
    </PaginationBox>
  )
}
