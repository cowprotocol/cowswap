import { transparentize } from 'polished'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'

import { buildLimitOrdersUrl } from 'modules/ordersTable/utils/buildLimitOrdersUrl'

export interface OrdersTablePaginationProps {
  pageSize: number
  totalCount: number
  currentPage: number
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

const PageButton = styled(Link)<{ $active?: boolean }>`
  background: ${({ theme, $active }) => ($active ? transparentize(0.9, theme.text3) : 'transparent')};
  color: ${({ theme, $active }) => ($active ? theme.text1 : transparentize(0.2, theme.text1))};
  border: 0;
  outline: 0;
  padding: 5px 10px;
  border-radius: 4px;
  margin: 0 5px;
  cursor: pointer;
  transition: background 0.15s ease-in-out, color 0.15s ease-in-out;
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.bg1};
    color: ${({ theme }) => theme.text1};
  }
`

export function OrdersTablePagination({ pageSize, totalCount, currentPage }: OrdersTablePaginationProps) {
  const location = useLocation()
  const pagesCount = Math.ceil(totalCount / pageSize)

  return (
    <PaginationBox>
      {[...new Array(pagesCount)].map((item, i) => {
        const index = i + 1

        return (
          <PageButton
            key={index}
            $active={index === currentPage}
            to={buildLimitOrdersUrl(location, { pageNumber: index })}
          >
            {index}
          </PageButton>
        )
      })}
    </PaginationBox>
  )
}
