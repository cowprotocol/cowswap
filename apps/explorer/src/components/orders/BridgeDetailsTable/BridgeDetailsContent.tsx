import React from 'react'

import { displayTime } from '@cowprotocol/common-utils'
import { BridgeStatus, CrossChainOrder } from '@cowprotocol/cow-sdk'

import { BridgeAmountDisplay } from './BridgeAmountDisplay'
import { BridgeDetailsTooltips } from './bridgeDetailsTooltips'
import { BridgeReceiveAmount } from './BridgeReceiveAmount'
import { RefundStatus, RefundStatusEnum } from './RefundStatus'
import { AmountSectionWrapper, ProviderDisplayWrapper, ProviderLogo } from './styled'

import { useCrossChainTokens } from '../../../modules/bridge/hooks/useCrossChainTokens'
import { AddressLink } from '../../common/AddressLink'
import { DetailRow } from '../../common/DetailRow'
import { RowWithCopyButton } from '../../common/RowWithCopyButton'
import { StatusLabel } from '../StatusLabel'

interface BridgeDetailsContentProps {
  crossChainOrder: CrossChainOrder
}

export function BridgeDetailsContent({ crossChainOrder }: BridgeDetailsContentProps) {
  const {
    statusResult: { status: bridgeStatus, fillTxHash, depositTxHash, fillTimeInSeconds },
    bridgingParams: { inputAmount, outputAmount, owner, sourceChainId, destinationChainId, recipient },
    provider: { info: providerInfo },
  } = crossChainOrder
  const { sourceToken, destinationToken } = useCrossChainTokens(crossChainOrder)

  return (
    <>
      <DetailRow label="Provider" tooltipText={BridgeDetailsTooltips.provider}>
        <ProviderDisplayWrapper>
          {providerInfo.logoUrl && <ProviderLogo src={providerInfo.logoUrl} alt={`${providerInfo.name} logo`} />}
          <a href={providerInfo.website} target="_blank" rel="noopener noreferrer">
            {providerInfo.name} ↗
          </a>
        </ProviderDisplayWrapper>
      </DetailRow>

      <DetailRow label="From" tooltipText={BridgeDetailsTooltips.ownerAddress}>
        <RowWithCopyButton
          textToCopy={owner}
          contentsToDisplay={<AddressLink address={owner} chainId={sourceChainId} />}
        />
      </DetailRow>

      <DetailRow label="To" tooltipText={BridgeDetailsTooltips.receiverAddress}>
        <RowWithCopyButton
          textToCopy={recipient}
          contentsToDisplay={<AddressLink address={recipient} chainId={destinationChainId} />}
        />
      </DetailRow>

      <DetailRow label="Status" tooltipText={BridgeDetailsTooltips.status}>
        {!bridgeStatus || bridgeStatus === BridgeStatus.UNKNOWN ? (
          <StatusLabel status={BridgeStatus.IN_PROGRESS} customText="Waiting for swap to complete" />
        ) : (
          <StatusLabel status={bridgeStatus} />
        )}
      </DetailRow>

      <DetailRow label="Amounts" tooltipText={BridgeDetailsTooltips.amounts}>
        <AmountSectionWrapper>
          <BridgeAmountDisplay labelPrefix="From:" bridgeToken={sourceToken} amount={inputAmount.toString()} />
          <BridgeAmountDisplay
            labelPrefix="To at least:"
            bridgeToken={destinationToken}
            amount={outputAmount?.toString() || '0'}
          />
        </AmountSectionWrapper>
      </DetailRow>

      <DetailRow label="You received" tooltipText={BridgeDetailsTooltips.youReceived}>
        {outputAmount && destinationToken && bridgeStatus === BridgeStatus.EXECUTED && (
          <BridgeReceiveAmount amount={outputAmount} destinationToken={destinationToken} />
        )}
      </DetailRow>

      {bridgeStatus === BridgeStatus.EXPIRED && (depositTxHash || fillTxHash) && (
        <DetailRow label="Refund Status" tooltipText="Status of the refund process for the failed bridge transaction">
          <RefundStatus
            status={RefundStatusEnum.NOT_INITIATED} // TODO: add refund statuses once we have them
          />
        </DetailRow>
      )}

      {/*TODO: uncomment once we know bridge fee*/}
      {/*<DetailRow label="Bridge fee" tooltipText="The fee charged by the bridge provider">*/}
      {/*  {bridgeDetails ? (*/}
      {/*    bridgeDetails.protocolFeeSellToken ? (*/}
      {/*      <span>${bridgeDetails.protocolFeeSellToken}</span>*/}
      {/*    ) : (*/}
      {/*      <span>Not available</span>*/}
      {/*    )*/}
      {/*  ) : null}*/}
      {/*</DetailRow>*/}
      {bridgeStatus === BridgeStatus.IN_PROGRESS && fillTimeInSeconds !== undefined && (
        <DetailRow label="Bridging Time" tooltipText={BridgeDetailsTooltips.bridgingTime}>
          {displayTime(fillTimeInSeconds, true)}
        </DetailRow>
      )}
      {/*TODO: uncomment once we know bridge slippage*/}
      {/*<DetailRow label="Max Slippage" tooltipText={BridgeDetailsTooltips.maxSlippage}>*/}
      {/*  {bridgeDetails?.maxSlippageBps !== undefined*/}
      {/*    ? formatPercentage(new BigNumber(bridgeDetails.maxSlippageBps).div(10000))*/}
      {/*    : null}*/}
      {/*</DetailRow>*/}
    </>
  )
}
