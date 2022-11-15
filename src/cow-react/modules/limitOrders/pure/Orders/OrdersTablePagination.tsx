import styled from 'styled-components/macro'

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
  background: ${({ theme, active }) => (active ? theme.bg2 : theme.bg1)};
  color: ${({ theme, active }) => (active ? theme.text2 : theme.text1)};
  border: 0;
  outline: 0;
  padding: 5px 10px;
  border-radius: 4px;
  margin: 0 5px;
  cursor: pointer;

  :hover {
    color: ${({ theme }) => theme.text2};
    background: ${({ theme }) => theme.bg2};
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
