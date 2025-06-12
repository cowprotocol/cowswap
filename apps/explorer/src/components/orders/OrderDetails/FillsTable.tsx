import { ReactNode, useMemo } from 'react'

import { Command } from '@cowprotocol/types'

import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import Icon from 'components/Icon'
import { TableState } from 'explorer/components/TokensTableWidget/useTable'

import { Order, Trade } from 'api/operator'

import { FillsTableRow } from './FillsTableRow'

import { SimpleTable, SimpleTableProps } from '../../common/SimpleTable'
import { FilledProgress } from '../FilledProgress'

type FillsTableProps = SimpleTableProps & {
  trades: Trade[] | undefined
  order: Order | null
  tableState: TableState
  isPriceInverted: boolean
  invertPrice: Command
}

export function FillsTable(props: FillsTableProps): ReactNode {
  const { trades, order, tableState, isPriceInverted, invertPrice } = props

  const invertButton = useMemo(() => <Icon icon={faExchangeAlt} onClick={invertPrice} />, [invertPrice])

  const currentPageTrades = useMemo(() => {
    return trades?.slice(tableState.pageOffset, tableState.pageOffset + tableState.pageSize)
  }, [tableState.pageOffset, tableState.pageSize, trades])

  const tradeItems = !currentPageTrades?.length ? (
    <tr className="row-empty">
      <td className="row-td-empty">
        No results found. <br /> Please try another search.
      </td>
    </tr>
  ) : (
    currentPageTrades.map((item) => <FillsTableRow key={item.txHash} trade={item} isPriceInverted={isPriceInverted} />)
  )

  return (
    <>
      {order && (
        <FilledProgress lineBreak fullView order={order} isPriceInverted={isPriceInverted} invertPrice={invertPrice} />
      )}

      <SimpleTable
        header={
          <tr>
            <th>Tx hash</th>
            <th>Sell amount</th>
            <th>Buy amount</th>
            <th>Surplus</th>
            <th>
              <span>Execution price {invertButton}</span>
            </th>
            <th>Execution time</th>
          </tr>
        }
        body={tradeItems}
      />
    </>
  )
}
