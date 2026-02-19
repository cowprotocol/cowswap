import { ReactNode, useCallback, useState } from 'react'

import { ExplorerDataType, formatShortDate, getExplorerLink } from '@cowprotocol/common-utils'
import {
  ContextMenuExternalLink,
  ContextMenuItemButton,
  ContextMenuTooltip,
  Media,
  NetworkLogo,
  UI,
} from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Check, Copy, MoreVertical } from 'react-feather'
import styled from 'styled-components/macro'

import { Card } from 'pages/Account/styled'

import { getPayoutHistoryNetworkLabel } from '../hooks/usePayoutHistory'
import { PayoutHistoryRow } from '../lib/affiliateProgramTypes'

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
    min-width: 620px;
  }
`

const NetworkCell = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`

const ActionsCell = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
`

interface PayoutHistoryTableRowContextMenuProps {
  row: PayoutHistoryRow
  copiedTxHash?: string
  onCopyTxHash: (txHash: string) => void
}

function PayoutHistoryTableRowContextMenu({
  row,
  copiedTxHash,
  onCopyTxHash,
}: PayoutHistoryTableRowContextMenuProps): ReactNode {
  const txLink = getExplorerLink(row.chainId, row.txHash, ExplorerDataType.TRANSACTION)
  const isCopied = copiedTxHash === row.txHash

  return (
    <ContextMenuTooltip
      disableHoverBackground
      content={
        <>
          <ContextMenuExternalLink href={txLink} label={t`View tx on explorer`} />
          <ContextMenuItemButton onClick={() => onCopyTxHash(row.txHash)}>
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            <span>{isCopied ? t`Copied` : t`Copy tx hash`}</span>
          </ContextMenuItemButton>
        </>
      }
    >
      <MoreVertical size={16} />
    </ContextMenuTooltip>
  )
}

interface PayoutHistoryTableRowProps {
  row: PayoutHistoryRow
  copiedTxHash?: string
  onCopyTxHash: (txHash: string) => void
}

function PayoutHistoryTableRow({ row, copiedTxHash, onCopyTxHash }: PayoutHistoryTableRowProps): ReactNode {
  return (
    <tr>
      <td>{formatShortDate(row.date) || '-'}</td>
      <td>
        <NetworkCell>
          <NetworkLogo chainId={row.chainId} size={16} />
          <span>{getPayoutHistoryNetworkLabel(row.chainId)}</span>
        </NetworkCell>
      </td>
      <td>{`${row.amount} USDC`}</td>
      <td>
        <ActionsCell>
          <PayoutHistoryTableRowContextMenu row={row} copiedTxHash={copiedTxHash} onCopyTxHash={onCopyTxHash} />
        </ActionsCell>
      </td>
    </tr>
  )
}

interface PayoutHistoryTableProps {
  rows: PayoutHistoryRow[]
  header?: ReactNode
  showLoader?: boolean
}

export function PayoutHistoryTable({ rows, header, showLoader = false }: PayoutHistoryTableProps): ReactNode {
  const [copiedTxHash, setCopiedTxHash] = useState<string | undefined>(undefined)

  const handleCopyTxHash = useCallback((txHash: string): void => {
    if (!navigator?.clipboard?.writeText) {
      return
    }

    navigator.clipboard.writeText(txHash).then(() => {
      setCopiedTxHash(txHash)
      setTimeout(() => setCopiedTxHash(undefined), 1_200)
    })
  }, [])

  return (
    <TableCard showLoader={showLoader}>
      {header}
      {rows.length === 0 ? (
        <EmptyText>
          <Trans>Your payout history will show here.</Trans>
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
                  <Trans>Amount</Trans>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <PayoutHistoryTableRow
                  row={row}
                  key={row.txHash}
                  copiedTxHash={copiedTxHash}
                  onCopyTxHash={handleCopyTxHash}
                />
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}
    </TableCard>
  )
}
