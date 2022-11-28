import styled from 'styled-components/macro'
import { transparentize } from 'polished'

export interface OrdersTablePaginationProps {
  pageSize: number
  totalCount: number
  currentPage: number
  setCurrentPage(index: number): void
}

const PaginationBox = styled.div`
  text-align: center;
  margin-top: 20px;
`

const PageButton = styled.button<{ active?: boolean }>`
  background: ${({ theme, active }) => (active ? transparentize(0.9, theme.text3) : 'transparent')};
  color: ${({ theme, active }) => (active ? theme.text1 : transparentize(0.2, theme.text1))};
  border: 0;
  outline: 0;
  padding: 5px 10px;
  border-radius: 4px;
  margin: 0 5px;
  cursor: pointer;
  transition: background 0.15s ease-in-out, color 0.15s ease-in-out;

  &:hover {
    background: ${({ theme }) => theme.bg1};
    color: ${({ theme }) => theme.text1};
  }
`

export function OrdersTablePagination({
  pageSize,
  totalCount,
  currentPage,
  setCurrentPage,
}: OrdersTablePaginationProps) {
  const pagesCount = Math.ceil(totalCount / pageSize)

  return (
    <PaginationBox>
      {[...new Array(pagesCount)].map((item, i) => {
        const index = i + 1

        return (
          <PageButton key={index} active={index === currentPage} onClick={() => setCurrentPage(index)}>
            {index}
          </PageButton>
        )
      })}
    </PaginationBox>
  )
}
