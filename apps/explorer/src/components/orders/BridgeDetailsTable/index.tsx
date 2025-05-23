import React from 'react'

import { BridgeDetails, BridgeStatus, BRIDGE_PROVIDER_DETAILS } from '@cowprotocol/bridge'
import { getChainInfo } from '@cowprotocol/common-const'
import { displayTime, ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { NetworkLogo } from '@cowprotocol/ui'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { DetailRow } from 'components/common/DetailRow'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { SimpleTable } from 'components/common/SimpleTable'
import { TokenDisplay as CommonTokenDisplay } from 'components/common/TokenDisplay'
import ShimmerBar from 'explorer/components/common/ShimmerBar'
import { formatPercentage, formatSmartMaxPrecision, isNativeToken } from 'utils'

import { getBridgeStatus } from 'utils/getBridgeStatus'

import { RefundStatus, RefundStatusEnum } from './RefundStatus'
import { ProviderDisplayWrapper, ProviderLogo, NetworkName } from './styled'
import {
  AmountSectionWrapper,
  AmountDetailBlock,
  AmountLabel,
  AmountTokenDisplayAndCopyWrapper,
  Wrapper,
} from './styled'

import { Network } from '../../../types'
import { StatusLabel } from '../StatusLabel'

type BridgeAmountDisplayProps = {
  labelPrefix: string
  bridgeToken?: BridgeDetails['source'] // Could be source or destination
  amount?: string | BigNumber | null
  isLoading?: boolean
}

// TODO: This is a temporary component to display the bridge amount.
// It should be replaced with a consolidated component with apps/explorer/src/components/orders/AmountsDisplay
const BridgeAmountDisplay: React.FC<BridgeAmountDisplayProps> = ({ labelPrefix, bridgeToken, amount, isLoading }) => {
  if (isLoading) {
    return (
      <AmountDetailBlock>
        <AmountLabel>{labelPrefix}</AmountLabel>
        <ShimmerBar height={1.6} />
      </AmountDetailBlock>
    )
  }
  if (!bridgeToken) {
    return (
      <AmountDetailBlock>
        <AmountLabel>{labelPrefix}</AmountLabel>
        <span>N/A</span>
      </AmountDetailBlock>
    )
  }

  const mappedToken = mapBridgeableToErc20(bridgeToken)

  if (amount === undefined || amount === null) {
    return (
      <AmountDetailBlock>
        <AmountLabel>{labelPrefix}</AmountLabel>
        <span>N/A</span>
      </AmountDetailBlock>
    )
  }

  const formattedAmount = formatSmartMaxPrecision(new BigNumber(amount), mappedToken)
  const tokenDisplayElement = (
    <CommonTokenDisplay erc20={mappedToken} network={bridgeToken.chainId as Network} showNetworkName={true} />
  )

  return (
    <AmountDetailBlock>
      <AmountLabel>{labelPrefix}</AmountLabel>
      <AmountTokenDisplayAndCopyWrapper>
        <span>{formattedAmount}</span>
        {isNativeToken(mappedToken.address) ? (
          tokenDisplayElement
        ) : (
          <RowWithCopyButton textToCopy={mappedToken.address} contentsToDisplay={tokenDisplayElement} />
        )}
      </AmountTokenDisplayAndCopyWrapper>
    </AmountDetailBlock>
  )
}

const tooltipTextMap = {
  transactionHash: 'The transaction hash or provider-specific explorer link for the bridge operation.',
  status: 'The current status of the bridge operation.',
  amounts: 'The amount of tokens sent to the bridge and the expected amount to be received.',
  youReceived:
    'The actual amount of tokens received from the bridge operation. Shows "-" until the bridge is completed.',
  costsAndFees: 'Estimated or actual costs and protocol fees for the bridge operation.',
  bridgingTime: 'Expected time for the bridge operation to complete.',
  maxSlippage: 'The maximum allowed slippage for the bridge in percentage.',
  provider: 'The bridging solution provider.',
  ownerAddress: 'The account address from which the tokens are bridged.',
  receiverAddress: 'The account address to which the tokens are bridged on the destination chain.',
}

const mapBridgeableToErc20 = (
  bridgeToken: BridgeDetails['source'] | BridgeDetails['destination'],
): TokenErc20 & { chainId?: Network } => {
  if (!bridgeToken) {
    return { address: '', decimals: 18, symbol: 'ERR', name: 'Error Token' } as TokenErc20 & { chainId?: Network }
  }
  return {
    address: bridgeToken.address,
    decimals: bridgeToken.decimals === undefined ? 18 : bridgeToken.decimals,
    symbol: bridgeToken.symbol || 'N/A',
    name: bridgeToken.symbol || bridgeToken.address,
    chainId: bridgeToken.chainId as Network,
  }
}

export type Props = {
  bridgeDetails?: BridgeDetails
  isLoading?: boolean
  ownerAddress?: string
  receiverAddress?: string
  swapStatus?: string // Swap order status to determine if swap is complete
  partiallyFilled?: boolean // Note: swap+bridge orders don't support partial fills for now
}

export function BridgeDetailsTable({
  bridgeDetails,
  isLoading: isOverallLoading,
  ownerAddress,
  receiverAddress,
  swapStatus,
  partiallyFilled,
}: Props): React.ReactNode {
  const effectiveBridgeStatus = getBridgeStatus({
    bridgeDetails,
    swapStatus,
    partiallyFilled,
  })

  const renderBridgeStatus = (): React.ReactNode => {
    if (effectiveBridgeStatus.isWaiting) {
      return <StatusLabel status={BridgeStatus.Pending} customText="Waiting for swap to complete" />
    }

    return <StatusLabel status={effectiveBridgeStatus.actualStatus} />
  }

  const getTransactionDetailsDisplay = (): React.ReactNode => {
    if (!bridgeDetails) return null

    if (bridgeDetails.explorerUrl) {
      return (
        <RowWithCopyButton
          textToCopy={bridgeDetails.explorerUrl}
          contentsToDisplay={
            <a href={bridgeDetails.explorerUrl} target="_blank" rel="noopener noreferrer">
              View on {bridgeDetails.providerName} ↗
            </a>
          }
        />
      )
    }

    const txHash = bridgeDetails.destinationChainTransactionHash || bridgeDetails.sourceChainTransactionHash
    const chainIdForLink = bridgeDetails.destinationChainTransactionHash
      ? bridgeDetails.destination.chainId
      : bridgeDetails.source.chainId

    if (!txHash || !chainIdForLink) return null

    const explorerPath = getExplorerLink(chainIdForLink, txHash, ExplorerDataType.TRANSACTION)

    return (
      <RowWithCopyButton
        textToCopy={txHash}
        contentsToDisplay={
          <LinkWithPrefixNetwork to={explorerPath} target="_blank">
            {txHash} ↗
          </LinkWithPrefixNetwork>
        }
      />
    )
  }

  const providerConfig = bridgeDetails?.providerName
    ? Object.values(BRIDGE_PROVIDER_DETAILS).find((config) => config.title === bridgeDetails.providerName)
    : undefined

  return (
    <Wrapper>
      <SimpleTable
        columnViewMobile
        body={
          <>
            <DetailRow
              label="Transaction Details"
              tooltipText={tooltipTextMap.transactionHash}
              isLoading={isOverallLoading}
            >
              {getTransactionDetailsDisplay()}
            </DetailRow>

            <DetailRow label="Provider" tooltipText={tooltipTextMap.provider} isLoading={isOverallLoading}>
              {bridgeDetails?.providerName && (
                <ProviderDisplayWrapper>
                  {providerConfig?.icon && (
                    <ProviderLogo src={providerConfig.icon} alt={`${bridgeDetails.providerName} logo`} />
                  )}
                  {bridgeDetails.providerUrl ? (
                    <a href={bridgeDetails.providerUrl} target="_blank" rel="noopener noreferrer">
                      {bridgeDetails.providerName} ↗
                    </a>
                  ) : (
                    bridgeDetails.providerName
                  )}
                </ProviderDisplayWrapper>
              )}
            </DetailRow>

            {ownerAddress && bridgeDetails?.source && (
              <DetailRow label="From" tooltipText={tooltipTextMap.ownerAddress} isLoading={isOverallLoading}>
                <RowWithCopyButton
                  textToCopy={ownerAddress}
                  contentsToDisplay={
                    <span>
                      <LinkWithPrefixNetwork
                        to={getExplorerLink(bridgeDetails.source.chainId, ownerAddress, ExplorerDataType.ADDRESS)}
                        target="_blank"
                      >
                        <NetworkLogo chainId={bridgeDetails.source.chainId} size={16} forceLightMode />
                        {ownerAddress} ↗
                      </LinkWithPrefixNetwork>
                      <NetworkName>on {getChainInfo(bridgeDetails.source.chainId).label}</NetworkName>
                    </span>
                  }
                />
              </DetailRow>
            )}

            {receiverAddress && bridgeDetails?.destination && (
              <DetailRow label="To" tooltipText={tooltipTextMap.receiverAddress} isLoading={isOverallLoading}>
                <RowWithCopyButton
                  textToCopy={receiverAddress}
                  contentsToDisplay={
                    <span>
                      <LinkWithPrefixNetwork
                        to={getExplorerLink(
                          bridgeDetails.destination.chainId,
                          receiverAddress,
                          ExplorerDataType.ADDRESS,
                        )}
                        target="_blank"
                      >
                        <NetworkLogo chainId={bridgeDetails.destination.chainId} size={16} forceLightMode />
                        {receiverAddress} ↗
                      </LinkWithPrefixNetwork>
                      <NetworkName>on {getChainInfo(bridgeDetails.destination.chainId).label}</NetworkName>
                    </span>
                  }
                />
              </DetailRow>
            )}

            <DetailRow label="Status" tooltipText={tooltipTextMap.status} isLoading={isOverallLoading}>
              {renderBridgeStatus()}
            </DetailRow>

            <DetailRow label="Amounts" tooltipText={tooltipTextMap.amounts} isLoading={isOverallLoading}>
              {bridgeDetails && bridgeDetails.source ? (
                <AmountSectionWrapper>
                  <BridgeAmountDisplay
                    labelPrefix="From:"
                    bridgeToken={bridgeDetails.source}
                    amount={bridgeDetails.inputAmount || '0'}
                    isLoading={isOverallLoading}
                  />
                  <BridgeAmountDisplay
                    labelPrefix="To at least:"
                    bridgeToken={bridgeDetails.destination}
                    amount={bridgeDetails.outputAmount || bridgeDetails.inputAmount || '0'}
                    isLoading={isOverallLoading}
                  />
                </AmountSectionWrapper>
              ) : isOverallLoading ? null : (
                'N/A'
              )}
            </DetailRow>

            <DetailRow label="You received" tooltipText={tooltipTextMap.youReceived} isLoading={isOverallLoading}>
              {bridgeDetails?.status === BridgeStatus.Completed &&
              bridgeDetails.outputAmount &&
              bridgeDetails.destination
                ? (() => {
                    const mappedToken = mapBridgeableToErc20(bridgeDetails.destination)
                    const formattedAmount = formatSmartMaxPrecision(
                      new BigNumber(bridgeDetails.outputAmount),
                      mappedToken,
                    )
                    const tokenDisplayElement = (
                      <CommonTokenDisplay
                        erc20={mappedToken}
                        network={bridgeDetails.destination.chainId as Network}
                        showNetworkName={true}
                      />
                    )

                    return (
                      <span>
                        <span>{formattedAmount} </span>
                        {isNativeToken(mappedToken.address) ? (
                          tokenDisplayElement
                        ) : (
                          <RowWithCopyButton textToCopy={mappedToken.address} contentsToDisplay={tokenDisplayElement} />
                        )}
                      </span>
                    )
                  })()
                : '-'}
            </DetailRow>

            {bridgeDetails?.status === BridgeStatus.Failed && (
              <DetailRow
                label="Refund Status"
                tooltipText="Status of the refund process for the failed bridge transaction"
                isLoading={isOverallLoading}
              >
                <RefundStatus
                  status={(bridgeDetails as any).refundStatus || RefundStatusEnum.NOT_INITIATED}
                  refundWalletAddress={(bridgeDetails as any).refundWalletAddress}
                  refundChainId={(bridgeDetails as any).refundChainId}
                />
              </DetailRow>
            )}

            <DetailRow
              label="Bridge fee"
              tooltipText="The fee charged by the bridge provider"
              isLoading={isOverallLoading}
            >
              {bridgeDetails ? (
                bridgeDetails.protocolFeeSellToken ? (
                  <span>${bridgeDetails.protocolFeeSellToken}</span>
                ) : (
                  <span>Not available</span>
                )
              ) : null}
            </DetailRow>
            <DetailRow label="Bridging Time" tooltipText={tooltipTextMap.bridgingTime} isLoading={isOverallLoading}>
              {bridgeDetails?.expectedFillTimeSeconds !== undefined
                ? displayTime(bridgeDetails.expectedFillTimeSeconds * 1000, true)
                : null}
            </DetailRow>
            <DetailRow label="Max Slippage" tooltipText={tooltipTextMap.maxSlippage} isLoading={isOverallLoading}>
              {bridgeDetails?.maxSlippageBps !== undefined
                ? formatPercentage(new BigNumber(bridgeDetails.maxSlippageBps).div(10000))
                : null}
            </DetailRow>
          </>
        }
      />
    </Wrapper>
  )
}
