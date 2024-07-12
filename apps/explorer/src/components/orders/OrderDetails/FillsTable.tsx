import { useMemo } from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'

import { faArrowAltCircleUp as faIcon } from '@fortawesome/free-regular-svg-icons'
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import { calculatePrice, TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { DateDisplay } from 'components/common/DateDisplay'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { SurplusComponent } from 'components/common/SurplusComponent'
import Icon from 'components/Icon'
import { TokenAmount } from 'components/token/TokenAmount'
import { TEN_BIG_NUMBER } from 'const'
import { useMultipleErc20 } from 'hooks/useErc20'
import { useNetworkId } from 'state/network'
import styled from 'styled-components/macro'
import { abbreviateString } from 'utils'

import { Order, Trade } from 'api/operator'

import ShimmerBar from '../../../explorer/components/common/ShimmerBar'
import { TableState } from '../../../explorer/components/TokensTableWidget/useTable'
import { SimpleTable, SimpleTableProps } from '../../common/SimpleTable'
import { FilledProgress } from '../FilledProgress'

const StyledShimmerBar = styled(ShimmerBar)`
  min-height: 20px;
  min-width: 100px;
`

export type Props = SimpleTableProps & {
  trades: Trade[] | undefined
  order: Order | null
  tableState: TableState
  isPriceInverted: boolean
  invertPrice: Command
}

interface RowProps {
  trade: Trade
  isPriceInverted: boolean
}

function calculateExecutionPrice(
  isPriceInverted: boolean,
  sellAmount: BigNumber,
  buyAmount: BigNumber,
  sellToken?: TokenErc20 | null,
  buyToken?: TokenErc20 | null
): BigNumber | null {
  if (!sellToken || !buyToken) return null

  const sellData = { amount: sellAmount, decimals: sellToken.decimals }
  const buyData = { amount: buyAmount, decimals: buyToken.decimals }

  return calculatePrice({
    numerator: isPriceInverted ? buyData : sellData,
    denominator: isPriceInverted ? sellData : buyData,
  }).multipliedBy(TEN_BIG_NUMBER.exponentiatedBy((isPriceInverted ? buyToken : sellToken).decimals))
}

const RowFill: React.FC<RowProps> = ({ trade, isPriceInverted }) => {
  const network = useNetworkId() ?? undefined
  const {
    txHash,
    sellAmount,
    buyAmount,
    sellTokenAddress,
    buyTokenAddress,
    executionTime,
    surplusAmount,
    surplusPercentage,
  } = trade
  const { value: tokens } = useMultipleErc20({
    networkId: network,
    addresses: [sellTokenAddress, buyTokenAddress],
  })
  const buyToken = tokens[buyTokenAddress]
  const sellToken = tokens[sellTokenAddress]

  const executionPrice = calculateExecutionPrice(isPriceInverted, sellAmount, buyAmount, sellToken, buyToken)
  const executionToken = isPriceInverted ? buyToken : sellToken

  if (!network || !txHash) {
    return null
  }
  const surplus = surplusAmount && surplusPercentage ? { amount: surplusAmount, percentage: surplusPercentage } : null
  const surplusToken = !trade.kind ? null : isSellOrder(trade.kind) ? buyToken : sellToken

  return (
    <tr key={txHash}>
      <td>
        <RowWithCopyButton
          textToCopy={txHash}
          contentsToDisplay={
            <LinkWithPrefixNetwork to={`/tx/${txHash}`} rel="noopener noreferrer" target="_self">
              {abbreviateString(txHash, 6, 4)}
            </LinkWithPrefixNetwork>
          }
        />
      </td>
      <td>
        <TokenAmount amount={sellAmount} token={sellToken} />
      </td>
      <td>
        <TokenAmount amount={buyAmount} token={buyToken} />
      </td>
      <td>{surplus ? <SurplusComponent icon={faIcon} surplus={surplus} token={surplusToken} /> : '-'}</td>
      <td>{executionPrice && <TokenAmount amount={executionPrice} token={executionToken} />}</td>
      <td>{executionTime ? <DateDisplay date={executionTime} showIcon={true} /> : <StyledShimmerBar />}</td>
    </tr>
  )
}

const FillsTable: React.FC<Props> = (props) => {
  const { trades, order, tableState, isPriceInverted, invertPrice } = props

  const invertButton = <Icon icon={faExchangeAlt} onClick={invertPrice} />

  const currentPageTrades = useMemo(() => {
    return trades?.slice(tableState.pageOffset, tableState.pageOffset + tableState.pageSize)
  }, [tableState.pageOffset, tableState.pageSize, trades])

  const tradeItems = (items: Trade[] | undefined): React.ReactNode => {
    if (!items || items.length === 0) {
      return (
        <tr className="row-empty">
          <td className="row-td-empty">
            No results found. <br /> Please try another search.
          </td>
        </tr>
      )
    } else {
      return (
        <>
          {items.map((item) => (
            <RowFill key={item.txHash} trade={item} isPriceInverted={isPriceInverted} />
          ))}
        </>
      )
    }
  }

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
        body={tradeItems(currentPageTrades)}
      />
    </>
  )
}

export default FillsTable
