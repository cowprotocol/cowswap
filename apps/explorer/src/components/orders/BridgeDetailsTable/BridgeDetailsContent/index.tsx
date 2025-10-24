import React, { ReactNode } from 'react'

import { RECEIVED_LABEL_EXPLORER } from '@cowprotocol/common-const'
import { BridgeStatus, CrossChainOrder } from '@cowprotocol/sdk-bridging'

import { AddressLink } from 'components/common/AddressLink'
import { DetailRow } from 'components/common/DetailRow'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'

import { useCrossChainTokens } from 'modules/bridge'

import { BridgingTime, RefundStatusItem } from './contents'

import { StatusLabel } from '../../StatusLabel'
import { BridgeAmountDisplay } from '../BridgeAmountDisplay'
import { BridgeDetailsTooltips } from '../bridgeDetailsTooltips'
import { BridgeReceiveAmount } from '../BridgeReceiveAmount'
import { AmountSectionWrapper, ProviderDisplayWrapper, ProviderLogo } from '../styled'

interface BridgeDetailsContentProps {
  crossChainOrder: CrossChainOrder
}

// TODO: Break down this large function into smaller functions

export function BridgeDetailsContent({ crossChainOrder }: BridgeDetailsContentProps): ReactNode {
  const {
    statusResult: { status: bridgeStatus, fillTxHash, depositTxHash, fillTimeInSeconds },
    bridgingParams: { inputAmount, outputAmount, owner, sourceChainId, destinationChainId, recipient },
    provider: { info: providerInfo },
  } = crossChainOrder
  const bridgeProvider = crossChainOrder.provider
  const { sourceToken, destinationToken } = useCrossChainTokens(crossChainOrder)

  const RecipientAddress = recipient ? (
    <AddressLink address={recipient} chainId={destinationChainId} bridgeProvider={bridgeProvider} showNetworkName />
  ) : null

  return (
    <>
      <DetailRow label="Provider" tooltipText={BridgeDetailsTooltips.provider}>
        <ProviderDisplayWrapper>
          {providerInfo.logoUrl && <ProviderLogo src={providerInfo.logoUrl} alt={`${providerInfo.name} logo`} />}
          <span>{providerInfo.name}</span>
        </ProviderDisplayWrapper>
      </DetailRow>

      <DetailRow label="From" tooltipText={BridgeDetailsTooltips.accountFromProxy}>
        <RowWithCopyButton
          textToCopy={owner}
          contentsToDisplay={<AddressLink address={owner} chainId={sourceChainId} showNetworkName />}
        />
      </DetailRow>

      <DetailRow label="To" tooltipText={BridgeDetailsTooltips.receiverAddress}>
        {recipient ? <RowWithCopyButton textToCopy={recipient} contentsToDisplay={RecipientAddress} /> : <span>-</span>}
      </DetailRow>

      <DetailRow label="Status" tooltipText={BridgeDetailsTooltips.status}>
        {bridgeStatus === BridgeStatus.UNKNOWN ? (
          <StatusLabel status={BridgeStatus.IN_PROGRESS} customText="Waiting for swap to complete" />
        ) : (
          <StatusLabel status={bridgeStatus} />
        )}
      </DetailRow>

      <DetailRow label="Amounts" tooltipText={BridgeDetailsTooltips.amounts}>
        <AmountSectionWrapper>
          <BridgeAmountDisplay labelPrefix="From:" bridgeToken={sourceToken} amount={inputAmount.toString()} />
          <BridgeAmountDisplay
            labelPrefix="To:"
            bridgeToken={destinationToken}
            amount={outputAmount?.toString() || '0'}
            bridgeProvider={bridgeProvider}
          />
        </AmountSectionWrapper>
      </DetailRow>

      <DetailRow label={RECEIVED_LABEL_EXPLORER} tooltipText={BridgeDetailsTooltips.youReceived}>
        {outputAmount && destinationToken && bridgeStatus === BridgeStatus.EXECUTED && (
          <BridgeReceiveAmount
            amount={outputAmount}
            destinationToken={destinationToken}
            bridgeProvider={bridgeProvider}
          />
        )}
      </DetailRow>

      <RefundStatusItem bridgeStatus={bridgeStatus} hash={depositTxHash || fillTxHash} />

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
      <BridgingTime bridgeStatus={bridgeStatus} fillTimeInSeconds={fillTimeInSeconds} />
      {/*TODO: uncomment once we know bridge slippage*/}
      {/*<DetailRow label="Max Slippage" tooltipText={BridgeDetailsTooltips.maxSlippage}>*/}
      {/*  {bridgeDetails?.maxSlippageBps !== undefined*/}
      {/*    ? formatPercentage(new BigNumber(bridgeDetails.maxSlippageBps).div(10000))*/}
      {/*    : null}*/}
      {/*</DetailRow>*/}
    </>
  )
}
