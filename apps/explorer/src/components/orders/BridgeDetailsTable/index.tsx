import { ReactNode } from 'react'

import { BridgeDetails } from '@cowprotocol/bridge'
import { getChainInfo } from '@cowprotocol/common-const'
import { displayTime, ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { DetailRow } from 'components/common/DetailRow'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { SimpleTable } from 'components/common/SimpleTable'
import { Spinner } from 'components/common/Spinner'
import { TokenDisplay as CommonTokenDisplay } from 'components/common/TokenDisplay'
import { formatPercentage, safeTokenName, formatSmartMaxPrecision, isNativeToken } from 'utils'

import { MOCK_BRIDGE_PROVIDER_DETAILS } from './mockBridgeProviders'
import { ProviderDisplayWrapper, ProviderLogo } from './styled'
import {
  AmountSectionWrapper,
  AmountDetailBlock,
  AmountLabel,
  AmountTokenDisplayAndCopyWrapper,
  FeeItem,
  FeeLabel,
  FeesWrapper,
  FeeValue,
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
function BridgeAmountDisplay({ labelPrefix, bridgeToken, amount, isLoading }: BridgeAmountDisplayProps): ReactNode {
  if (isLoading) {
    return <Spinner size="sm" />
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

function BridgeFeesDisplay({ bridgeDetails }: { bridgeDetails: BridgeDetails }): ReactNode {
  const feeItems: ReactNode[] = []

  if (bridgeDetails.gasCostsNative) {
    feeItems.push(
      <FeeItem key="gas-costs">
        <FeeLabel>Native Gas Costs:</FeeLabel>
        <FeeValue>
          {bridgeDetails.gasCostsNative} on {getChainInfo(bridgeDetails.source.chainId as SupportedChainId).label}
        </FeeValue>
      </FeeItem>,
    )
  }

  if (bridgeDetails.protocolFeeSellToken) {
    feeItems.push(
      <FeeItem key="protocol-fee-source">
        <FeeLabel>Protocol Fee (Source):</FeeLabel>
        <FeeValue>
          {bridgeDetails.protocolFeeSellToken} {safeTokenName(bridgeDetails.source)}
        </FeeValue>
      </FeeItem>,
    )
  }

  if (bridgeDetails.protocolFeeBuyToken) {
    feeItems.push(
      <FeeItem key="protocol-fee-dest">
        <FeeLabel>Protocol Fee (Dest):</FeeLabel>
        <FeeValue>
          {bridgeDetails.protocolFeeBuyToken} {safeTokenName(bridgeDetails.destination)}
        </FeeValue>
      </FeeItem>,
    )
  }

  if (feeItems.length > 0) {
    return <FeesWrapper>{feeItems}</FeesWrapper>
  }

  return (
    <FeeItem>
      <FeeValue>Not available</FeeValue>
    </FeeItem>
  )
}

const tooltipTextMap = {
  transactionHash: 'The transaction hash or provider-specific explorer link for the bridge operation.',
  status: 'The current status of the bridge operation.',
  amounts: 'The amount of tokens sent to the bridge and the amount received (or expected).',
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

export function BridgeDetailsTable({
  bridgeDetails,
  isLoading: isOverallLoading,
  ownerAddress,
  receiverAddress,
}: {
  bridgeDetails?: BridgeDetails
  isLoading?: boolean
  ownerAddress?: string
  receiverAddress?: string
}): ReactNode {
  // Early return if no bridge details to render
  if (!bridgeDetails && !isOverallLoading) {
    return null
  }

  function getTransactionDetailsDisplay(): ReactNode {
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
    ? Object.values(MOCK_BRIDGE_PROVIDER_DETAILS).find((config) => config.title === bridgeDetails.providerName)
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
                    <LinkWithPrefixNetwork
                      to={getExplorerLink(bridgeDetails.source.chainId, ownerAddress, ExplorerDataType.ADDRESS)}
                      target="_blank"
                    >
                      {ownerAddress} ↗
                    </LinkWithPrefixNetwork>
                  }
                />
              </DetailRow>
            )}

            {receiverAddress && bridgeDetails?.destination && (
              <DetailRow label="To" tooltipText={tooltipTextMap.receiverAddress} isLoading={isOverallLoading}>
                <RowWithCopyButton
                  textToCopy={receiverAddress}
                  contentsToDisplay={
                    <LinkWithPrefixNetwork
                      to={getExplorerLink(bridgeDetails.destination.chainId, receiverAddress, ExplorerDataType.ADDRESS)}
                      target="_blank"
                    >
                      {receiverAddress} ↗
                    </LinkWithPrefixNetwork>
                  }
                />
              </DetailRow>
            )}

            <DetailRow label="Status" tooltipText={tooltipTextMap.status} isLoading={isOverallLoading}>
              {bridgeDetails?.status ? <StatusLabel status={bridgeDetails.status} /> : null}
            </DetailRow>

            <DetailRow label="Amounts" tooltipText={tooltipTextMap.amounts} isLoading={isOverallLoading}>
              {bridgeDetails && bridgeDetails.source && bridgeDetails.inputAmount ? (
                <AmountSectionWrapper>
                  <BridgeAmountDisplay
                    labelPrefix="From:"
                    bridgeToken={bridgeDetails.source}
                    amount={bridgeDetails.inputAmount}
                    isLoading={isOverallLoading}
                  />
                  <BridgeAmountDisplay
                    labelPrefix={bridgeDetails.outputAmount ? 'To:' : 'To (est.):'}
                    bridgeToken={bridgeDetails.destination}
                    amount={bridgeDetails.outputAmount}
                    isLoading={isOverallLoading}
                  />
                </AmountSectionWrapper>
              ) : isOverallLoading ? null : (
                'N/A'
              )}
            </DetailRow>

            <DetailRow label="Costs & Fees" tooltipText={tooltipTextMap.costsAndFees} isLoading={isOverallLoading}>
              {bridgeDetails ? <BridgeFeesDisplay bridgeDetails={bridgeDetails} /> : null}
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
