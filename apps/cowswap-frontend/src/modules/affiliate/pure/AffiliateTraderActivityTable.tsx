import { ReactNode } from 'react'

import { Media, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { Card } from 'pages/Account/styled'

import { AffiliateTraderActivityTableRow } from './AffiliateTraderActivityTableRow'

import { OrderWithChainId } from '../api/fetchTraderActivity'

interface AffiliateTraderActivityTableProps {
  orders: OrderWithChainId[]
  savedCode: string
  showLoader?: boolean
}

export function AffiliateTraderActivityTable(props: AffiliateTraderActivityTableProps): ReactNode {
  const { orders, savedCode, showLoader } = props

  return (
    <TableCard showLoader={showLoader}>
      {orders.length === 0 ? (
        <EmptyText>
          <Trans>Your rewards activity will show here.</Trans>
        </EmptyText>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <th>
                  <Trans>Date</Trans>
                </th>
                <th>
                  <Trans>Network</Trans>
                </th>
                <th>
                  <Trans>Trade</Trans>
                </th>
                <th>
                  <Trans>Fee</Trans>
                </th>
                <th>
                  <Trans>Eligible</Trans>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <AffiliateTraderActivityTableRow order={order} savedCode={savedCode} key={order.uid} />
              ))}
            </tbody>
          </Table>
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

  th,
  td {
    padding: 10px 8px;
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid var(${UI.COLOR_BORDER});
  }

  th {
    font-size: 12px;
    color: var(${UI.COLOR_TEXT_OPACITY_60});
    font-weight: 600;
  }

  td {
    color: var(${UI.COLOR_TEXT});
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  ${Media.upToSmall()} {
    min-width: 680px;
  }
`
