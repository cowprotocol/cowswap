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

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

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

  const isFinished = swapAndBridgeContext?.bridgingStatus === SwapAndBridgeStatus.DONE

  return (
    <>
      <SummaryRow>
        <b>
          <Trans>From</Trans>
        </b>
        <i>
          <TokenLogo token={sourceAmounts.sellAmount.currency} size={20} />
          <TokenAmount amount={sourceAmounts.sellAmount} tokenSymbol={sourceAmounts.sellAmount.currency} />{' '}
          <Trans>on</Trans> {capitalizeFirstLetter(sourceChainName)}
        </i>
      </SummaryRow>

      <SummaryRow>
        <b>{isFinished ? <Trans>To</Trans> : <Trans>To at least</Trans>}</b>

        <i>
          {targetAmount ? (
            <>
              <TokenLogo token={targetAmount.currency} size={20} />
              <TokenAmount amount={targetAmount} tokenSymbol={targetAmount.currency} /> <Trans>on</Trans>{' '}
              {capitalizeFirstLetter(targetChainName)}
            </>
          ) : (
            <ShimmerWrapper />
          )}
        </i>
      </SummaryRow>

      {isCustomRecipient && targetRecipient && targetAmount && (
        <SummaryRow>
          <b>
            <Trans>Recipient</Trans>:
          </b>
          <i>
            {isCustomRecipientWarning && (
              <Icon image={IconType.ALERT} color={UI.COLOR_ALERT} description={t`Alert`} size={18} />
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
