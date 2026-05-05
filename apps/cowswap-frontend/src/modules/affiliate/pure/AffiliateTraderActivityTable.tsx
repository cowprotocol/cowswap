import { ReactNode } from 'react'

import { Media, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { Card } from 'pages/Account/styled'

import { AffiliateTraderActivityTableRow } from './AffiliateTraderActivityTableRow'
import { CardTitle } from './shared'

import { TraderActivityRowResponse } from '../api/bffAffiliateApi.types'

interface AffiliateTraderActivityTableProps {
  rows: TraderActivityRowResponse[]
  showLoader?: boolean
}

export function AffiliateTraderActivityTable(props: AffiliateTraderActivityTableProps): ReactNode {
  const { rows, showLoader } = props

  return (
    <TableCard showLoader={showLoader}>
      <CardTitle>
        <Trans>Rewards activity</Trans>
      </CardTitle>
      {rows.length === 0 ? (
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
              {rows.map((row) => (
                <AffiliateTraderActivityTableRow row={row} key={row.order_uid} />
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
    min-width: 720px;
  }
`
