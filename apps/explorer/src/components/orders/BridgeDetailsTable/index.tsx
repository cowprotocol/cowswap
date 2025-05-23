import React, { useMemo } from 'react'

import { BridgeDetails, BridgeStatus, BRIDGE_PROVIDER_DETAILS } from '@cowprotocol/bridge'
import { getChainInfo } from '@cowprotocol/common-const'
import { displayTime, ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { NetworkLogo } from '@cowprotocol/ui'

import BigNumber from 'bignumber.js'
import { DetailRow } from 'components/common/DetailRow'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { SimpleTable } from 'components/common/SimpleTable'
import { TokenDisplay as CommonTokenDisplay } from 'components/common/TokenDisplay'
import { formatPercentage } from 'utils'

import { getBridgeStatus } from 'utils/getBridgeStatus'
import { formatTokenAmount, mapBridgeableToErc20 } from 'utils/tokenFormatting'

import { BridgeAmountDisplay } from './BridgeAmountDisplay'
import { RefundStatus, RefundStatusEnum } from './RefundStatus'
import { ProviderDisplayWrapper, ProviderLogo, NetworkName, BridgeStatusWrapper, ErrorMessage } from './styled'
import { AmountSectionWrapper, Wrapper } from './styled'

import { Network } from '../../../types'
import { StatusLabel } from '../StatusLabel'

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
  const effectiveBridgeStatus = useMemo(
    () =>
      getBridgeStatus({
        bridgeDetails,
        swapStatus,
        partiallyFilled,
      }),
    [bridgeDetails, swapStatus, partiallyFilled],
  )

  const renderBridgeStatus = useMemo((): React.ReactNode => {
    if (effectiveBridgeStatus.isWaiting) {
      return <StatusLabel status={BridgeStatus.Pending} customText="Waiting for swap to complete" />
    }

    const statusElement = <StatusLabel status={effectiveBridgeStatus.actualStatus} />

    // Show error message when bridge failed
    if (bridgeDetails?.status === BridgeStatus.Failed && bridgeDetails.errorMessage) {
      return (
        <BridgeStatusWrapper>
          {statusElement}
          <ErrorMessage>{bridgeDetails.errorMessage}</ErrorMessage>
        </BridgeStatusWrapper>
      )
    }

    return statusElement
  }, [effectiveBridgeStatus, bridgeDetails])

  const transactionDetailsDisplay = useMemo((): React.ReactNode => {
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
  }, [bridgeDetails])

  const providerConfig = useMemo(() => {
    return bridgeDetails?.providerName
      ? Object.values(BRIDGE_PROVIDER_DETAILS).find((config) => config.title === bridgeDetails.providerName)
      : undefined
  }, [bridgeDetails?.providerName])

  const youReceivedDisplay = useMemo((): React.ReactNode => {
    if (bridgeDetails?.status !== BridgeStatus.Completed || !bridgeDetails.outputAmount || !bridgeDetails.destination) {
      return '-'
    }

    const mappedToken = mapBridgeableToErc20(bridgeDetails.destination)
    const { formattedAmount, isNative } = formatTokenAmount(new BigNumber(bridgeDetails.outputAmount), mappedToken)

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
        {isNative ? (
          tokenDisplayElement
        ) : (
          <RowWithCopyButton textToCopy={mappedToken.address} contentsToDisplay={tokenDisplayElement} />
        )}
      </span>
    )
  }, [bridgeDetails])

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
              {transactionDetailsDisplay}
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
              {renderBridgeStatus}
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
              {youReceivedDisplay}
            </DetailRow>

            {bridgeDetails?.status === BridgeStatus.Failed &&
              (bridgeDetails.sourceChainTransactionHash || bridgeDetails.destinationChainTransactionHash) && (
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
