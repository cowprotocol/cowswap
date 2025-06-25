import React, { useMemo } from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'

import { faArrowAltCircleUp as faIcon } from '@fortawesome/free-regular-svg-icons'
import { DateDisplay } from 'components/common/DateDisplay'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { SurplusComponent } from 'components/common/SurplusComponent'
import { TokenAmount } from 'components/token/TokenAmount'
import ShimmerBar from 'explorer/components/common/ShimmerBar'
import { useMultipleErc20 } from 'hooks/useErc20'
import { useNetworkId } from 'state/network'
import styled from 'styled-components/macro'
import { abbreviateString } from 'utils'

import { Trade } from 'api/operator'
import { calculateExecutionPrice } from 'utils/orderCalculations'

const StyledShimmerBar = styled(ShimmerBar)`
  min-height: 2rem;
  min-width: 10rem;
`

interface FillsTableRowProps {
  trade: Trade
  isPriceInverted: boolean
}

export function FillsTableRow({ trade, isPriceInverted }: FillsTableRowProps): React.ReactNode {
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

  const executionPrice = useMemo(
    () => calculateExecutionPrice(isPriceInverted, sellAmount, buyAmount, sellToken, buyToken),
    [isPriceInverted, sellAmount, buyAmount, sellToken, buyToken],
  )

  const executionToken = isPriceInverted ? buyToken : sellToken

  const surplus = useMemo(() => {
    return surplusAmount && surplusPercentage ? { amount: surplusAmount, percentage: surplusPercentage } : null
  }, [surplusAmount, surplusPercentage])

  const surplusToken = useMemo(() => {
    return !trade.kind ? null : isSellOrder(trade.kind) ? buyToken : sellToken
  }, [trade.kind, buyToken, sellToken])

  if (!network || !txHash) {
    return null
  }

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
