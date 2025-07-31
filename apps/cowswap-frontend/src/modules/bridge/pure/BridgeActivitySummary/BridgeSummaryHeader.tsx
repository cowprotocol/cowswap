import { ReactNode } from 'react'

import {
  areAddressesEqual,
  capitalizeFirstLetter,
  ExplorerDataType,
  getExplorerLink,
  shortenAddress,
} from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { ExternalLink, Icon, IconType, TokenAmount, UI } from '@cowprotocol/ui'

import type { Order } from 'legacy/state/orders/actions'

import { ShimmerWrapper, SummaryRow } from 'common/pure/OrderSummaryRow'

import { SwapAndBridgeContext, SwapAndBridgeOverview, SwapAndBridgeStatus } from '../../types'

interface BridgeSummaryHeaderProps {
  order: Order
  swapAndBridgeOverview: SwapAndBridgeOverview
  isCustomRecipientWarning: boolean
  swapAndBridgeContext: SwapAndBridgeContext | undefined
}

export function BridgeSummaryHeader({
  order,
  swapAndBridgeOverview,
  isCustomRecipientWarning,
  swapAndBridgeContext,
}: BridgeSummaryHeaderProps): ReactNode {
  const { sourceAmounts, targetAmounts, sourceChainName, targetChainName, targetRecipient } = swapAndBridgeOverview
  const isCustomRecipient = !!targetRecipient && !areAddressesEqual(order.owner, targetRecipient)
  const targetAmount = targetAmounts?.buyAmount

  // Only show destination chain when we have confirmed bridge data (crossChainOrder loaded)
  const showDestinationChain = !!swapAndBridgeContext?.statusResult
  const isFinished = swapAndBridgeContext?.bridgingStatus === SwapAndBridgeStatus.DONE

  return (
    <>
      <SummaryRow>
        <b>From</b>
        <i>
          <TokenLogo token={sourceAmounts.sellAmount.currency} size={20} />
          <TokenAmount amount={sourceAmounts.sellAmount} tokenSymbol={sourceAmounts.sellAmount.currency} />
          {` on ${capitalizeFirstLetter(sourceChainName)}`}
        </i>
      </SummaryRow>

      <SummaryRow>
        <b>{isFinished ? 'To' : 'To at least'}</b>

        <i>
          {targetAmount && showDestinationChain ? (
            <>
              <TokenLogo token={targetAmount.currency} size={20} />
              <TokenAmount amount={targetAmount} tokenSymbol={targetAmount.currency} />
              {` on ${capitalizeFirstLetter(targetChainName)}`}
            </>
          ) : (
            <ShimmerWrapper />
          )}
        </i>
      </SummaryRow>

      {isCustomRecipient && targetRecipient && targetAmount && (
        <SummaryRow>
          <b>Recipient:</b>
          <i>
            {isCustomRecipientWarning && (
              <Icon image={IconType.ALERT} color={UI.COLOR_ALERT} description="Alert" size={18} />
            )}
            <ExternalLink
              href={getExplorerLink(targetAmount.currency.chainId, targetRecipient, ExplorerDataType.ADDRESS)}
            >
              {shortenAddress(targetRecipient)} ↗
            </ExternalLink>
          </i>
        </SummaryRow>
      )}
    </>
  )
}
