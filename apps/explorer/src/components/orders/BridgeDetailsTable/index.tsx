import React from 'react'

import { BridgeDetails, BridgeableToken } from '@cowprotocol/bridge'
import { displayTime, ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { TruncatedText } from '@cowprotocol/ui/pure/TruncatedText'

import BigNumber from 'bignumber.js'
import { DetailRow } from 'components/common/DetailRow'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { SimpleTable } from 'components/common/SimpleTable'
import { TokenDisplay as CommonTokenDisplay } from 'components/common/TokenDisplay'
import { TokenAmount } from 'components/token/TokenAmount'
import { formatPercentage, safeTokenName } from 'utils'

import { TokenDisplayWrapper, Wrapper, FeesWrapper, FeeItem, FeeLabel, FeeValue } from './styled'

import { StatusLabel } from '../StatusLabel'

export type Props = {
  bridgeDetails?: BridgeDetails
  isLoading?: boolean
}

const tooltipTextMap = {
  from: 'The source token and chain for the bridge operation.',
  to: 'The destination token and chain for the bridge operation.',
  transactionHash:
    'The transaction hash associated with the bridge operation on the relevant chain (source or destination).',
  status: 'The current status of the bridge operation.',
  amounts: 'The amount of tokens sent to the bridge and the amount received (or expected).',
  costsAndFees: 'Estimated or actual costs and protocol fees for the bridge operation.',
  bridgingTime: 'Expected time for the bridge operation to complete.',
  maxSlippage: 'The maximum allowed slippage for the bridge in percentage.',
  provider: 'The bridging solution provider.',
  explorerLink: "Link to the bridge provider's transaction explorer.",
}

export function BridgeDetailsTable({ bridgeDetails, isLoading: isOverallLoading }: Props): React.ReactNode {
  const getTxLink = (): React.ReactNode => {
    const txHash = bridgeDetails?.destinationChainTransactionHash || bridgeDetails?.sourceChainTransactionHash
    const chainIdForLink = bridgeDetails?.destinationChainTransactionHash
      ? bridgeDetails?.destination.chainId
      : bridgeDetails?.source.chainId

    if (!txHash || !chainIdForLink) return null

    const explorerPath = getExplorerLink(chainIdForLink, txHash, ExplorerDataType.TRANSACTION)

    return (
      <RowWithCopyButton
        textToCopy={txHash}
        contentsToDisplay={
          <LinkWithPrefixNetwork to={explorerPath} target="_blank">
            <TruncatedText>{txHash}</TruncatedText> ↗
          </LinkWithPrefixNetwork>
        }
      />
    )
  }

  const explorerLinkDisplay = bridgeDetails?.explorerUrl ? (
    <a href={bridgeDetails.explorerUrl} target="_blank" rel="noopener noreferrer">
      View on {bridgeDetails.providerName} Explorer ↗
    </a>
  ) : null

  const renderTokenDisplay = (token?: BridgeableToken, amount?: string): React.ReactNode => {
    if (!token || amount === undefined || amount === null) return null

    const erc20ForAmount = {
      address: token.address,
      decimals: token.decimals === undefined ? 18 : token.decimals,
      symbol: token.symbol || 'Token',
      name: token.symbol || token.address,
    }

    const erc20ForIconAndName = {
      address: token.address,
      decimals: token.decimals === undefined ? 18 : token.decimals,
      symbol: token.symbol,
      name: undefined,
    }

    return (
      <TokenDisplayWrapper>
        <TokenAmount amount={new BigNumber(amount)} token={erc20ForAmount} />
        <CommonTokenDisplay erc20={erc20ForIconAndName} network={token.chainId} />
      </TokenDisplayWrapper>
    )
  }

  return (
    <Wrapper>
      <SimpleTable
        columnViewMobile
        body={
          <>
            <DetailRow label="From" tooltipText={tooltipTextMap.from} isLoading={isOverallLoading}>
              {bridgeDetails && renderTokenDisplay(bridgeDetails.source, bridgeDetails.inputAmount)}
            </DetailRow>
            <DetailRow label="To" tooltipText={tooltipTextMap.to} isLoading={isOverallLoading}>
              {bridgeDetails && renderTokenDisplay(bridgeDetails.destination, bridgeDetails.outputAmount)}
            </DetailRow>
            <DetailRow
              label="Transaction Hash"
              tooltipText={tooltipTextMap.transactionHash}
              isLoading={isOverallLoading}
            >
              {getTxLink()}
            </DetailRow>
            <DetailRow label="Provider Explorer" tooltipText={tooltipTextMap.explorerLink} isLoading={isOverallLoading}>
              {explorerLinkDisplay}
            </DetailRow>
            <DetailRow label="Status" tooltipText={tooltipTextMap.status} isLoading={isOverallLoading}>
              {bridgeDetails?.status ? <StatusLabel status={bridgeDetails.status} /> : null}
            </DetailRow>
            <DetailRow label="Amounts (Sell → Buy)" tooltipText={tooltipTextMap.amounts} isLoading={isOverallLoading}>
              {bridgeDetails && bridgeDetails.inputAmount && (
                <>
                  {renderTokenDisplay(bridgeDetails.source, bridgeDetails.inputAmount)}
                  {' → '}
                  {renderTokenDisplay(bridgeDetails.destination, bridgeDetails.outputAmount)}
                </>
              )}
            </DetailRow>
            <DetailRow label="Costs & Fees" tooltipText={tooltipTextMap.costsAndFees} isLoading={isOverallLoading}>
              {bridgeDetails && (
                <FeesWrapper>
                  {bridgeDetails.gasCostsNative && (
                    <FeeItem>
                      <FeeLabel>Native Gas Costs:</FeeLabel>
                      <FeeValue>{bridgeDetails.gasCostsNative} (on source chain)</FeeValue>
                    </FeeItem>
                  )}
                  {bridgeDetails.protocolFeeSellToken && (
                    <FeeItem>
                      <FeeLabel>Protocol Fee (Source):</FeeLabel>
                      <FeeValue>
                        {bridgeDetails.protocolFeeSellToken} {safeTokenName(bridgeDetails.source)}
                      </FeeValue>
                    </FeeItem>
                  )}
                  {bridgeDetails.protocolFeeBuyToken && (
                    <FeeItem>
                      <FeeLabel>Protocol Fee (Dest):</FeeLabel>
                      <FeeValue>
                        {bridgeDetails.protocolFeeBuyToken} {safeTokenName(bridgeDetails.destination)}
                      </FeeValue>
                    </FeeItem>
                  )}
                  {!bridgeDetails.gasCostsNative &&
                    !bridgeDetails.protocolFeeSellToken &&
                    !bridgeDetails.protocolFeeBuyToken && (
                      <FeeItem>
                        <FeeValue>Not available</FeeValue>
                      </FeeItem>
                    )}
                </FeesWrapper>
              )}
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
            <DetailRow label="Provider" tooltipText={tooltipTextMap.provider} isLoading={isOverallLoading}>
              {bridgeDetails?.providerName}
            </DetailRow>
          </>
        }
      />
    </Wrapper>
  )
}
