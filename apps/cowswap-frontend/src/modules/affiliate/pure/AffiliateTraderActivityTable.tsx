import { ReactNode, useEffect, useMemo, useState } from 'react'

import { Media, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { OrdersTablePagination } from 'modules/ordersTable'

import { Card } from 'pages/Account/styled'

import { AffiliateTraderActivityTableRow } from './AffiliateTraderActivityTableRow'
import { CardTitle } from './shared'

import { TraderActivityRowResponse } from '../api/bffAffiliateApi.types'

const AFFILIATE_ACTIVITY_PAGE_SIZE = 10

interface AffiliateTraderActivityTableProps {
  rows: TraderActivityRowResponse[]
  showLoader?: boolean
}

export function AffiliateTraderActivityTable(props: AffiliateTraderActivityTableProps): ReactNode {
  const { rows, showLoader } = props
  const [currentPage, setCurrentPage] = useState(1)
  const isLikelyGloballyIneligible = rows[0]?.eligibility_reason === 'ref_after_first_trade'

  const rowsPage = useMemo(() => {
    const start = (currentPage - 1) * AFFILIATE_ACTIVITY_PAGE_SIZE

    return rows.slice(start, start + AFFILIATE_ACTIVITY_PAGE_SIZE)
  }, [currentPage, rows])

  useEffect(() => {
    const lastPage = Math.max(Math.ceil(rows.length / AFFILIATE_ACTIVITY_PAGE_SIZE), 1)

    if (currentPage > lastPage) {
      setCurrentPage(lastPage)
    }
  }, [currentPage, rows.length])

  return (
    <TableCard showLoader={showLoader}>
      <CardTitle>
        <Trans>Rewards activity</Trans>
      </CardTitle>
      {isLikelyGloballyIneligible ? (
        <EmptyText>
          <Trans>The referral code was applied after the trader&apos;s first qualifying trade.</Trans>
        </EmptyText>
      ) : rows.length === 0 ? (
        <EmptyText>
          <Trans>Your rewards activity will show here.</Trans>
        </EmptyText>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <th>
                  <Trans>Trade</Trans>
                </th>
                <th>
                  <Trans>Eligible volume</Trans>
                </th>
                <th>
                  <Trans>Eligible</Trans>
                </th>
                <th>
                  <Trans>Date</Trans>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rowsPage.map((row) => (
                <AffiliateTraderActivityTableRow row={row} key={row.order_uid} />
              ))}
            </tbody>
          </Table>
          {rows.length > AFFILIATE_ACTIVITY_PAGE_SIZE && (
            <OrdersTablePagination
              pageSize={AFFILIATE_ACTIVITY_PAGE_SIZE}
              totalCount={rows.length}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}
        </TableWrapper>
      )}
    </TableCard>
  )
}

const TableCard = styled(Card)`
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
`

const EmptyText = styled.p`
  margin: 0;
  font-size: 14px;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
`

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;

  th:nth-child(3),
  td:nth-child(3) {
    width: 100px;
  }

  th:nth-child(4),
  td:nth-child(4) {
    width: 120px;
  }

  th:nth-child(5),
  td:nth-child(5) {
    width: 40px;
  }

  th:nth-child(2),
  td:nth-child(2) {
    text-align: right;
  }

  th,
  td {
    padding: 10px 8px;
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid var(${UI.COLOR_BORDER});
  }

  thead {
    background: var(${UI.COLOR_PAPER_DARKER});
  }

  thead th {
    border-bottom: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  }

  th {
    font-size: 12px;
    line-height: 1.1;
    color: var(${UI.COLOR_TEXT});
    font-weight: 500;
  }

  td {
    color: var(${UI.COLOR_TEXT});
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  ${Media.upToSmall()} {
    min-width: 540px;
  }
`
