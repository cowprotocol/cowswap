import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { FiatAmount, InfoTooltip } from '@cowprotocol/ui'

import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'
import { ReceiveAmountTitle } from 'modules/trade/pure/ReceiveAmountTitle'
import { DividerHorizontal } from 'modules/trade/pure/Row/styled'
import { UsdAmountInfo } from 'modules/usdAmount/hooks/useUsdAmount'

import { ProtocolIcons } from 'common/pure/ProtocolIcons'

import { getFeeTextColor } from './BridgeRouteBreakdown'
import { AmountWithTokenIcon, ArrowIcon, StopNumberCircle, StopTitle, TokenFlowContainer } from './styled'

import { BridgeProtocolConfig, BridgeFeeType } from '../types'

export interface SwapStopDetailsProps {
  sellAmount: string
  sellToken: string
  sellTokenObj: TokenWithLogo
  buyAmount: string
  buyToken: string
  buyTokenObj: TokenWithLogo
  sourceChainName: string
  networkCost: string
  networkCostUsdResult?: UsdAmountInfo | null
  swapExpectedToReceive?: string
  swapExpectedReceiveUsdResult?: UsdAmountInfo | null
  swapMaxSlippage?: string
  swapMinReceive?: string
  swapMinReceiveUsdResult?: UsdAmountInfo | null
  tokenLogoSize: number
  bridgeProvider: BridgeProtocolConfig
}

export function SwapStopDetails({
  sellAmount,
  sellToken,
  sellTokenObj,
  buyAmount,
  buyToken,
  buyTokenObj,
  sourceChainName,
  networkCost,
  networkCostUsdResult,
  swapExpectedToReceive,
  swapExpectedReceiveUsdResult,
  swapMaxSlippage,
  swapMinReceive,
  swapMinReceiveUsdResult,
  tokenLogoSize,
  bridgeProvider,
}: SwapStopDetailsProps): ReactNode {
  const networkCostUsdValue = networkCostUsdResult?.value
  const swapExpectedReceiveUsdValue = swapExpectedReceiveUsdResult?.value
  const swapMinReceiveUsdValue = swapMinReceiveUsdResult?.value

  return (
    <>
      <StopTitle>
        <StopNumberCircle>1</StopNumberCircle>
        <b>
          <span>Swap on </span>
          <ProtocolIcons showOnlyFirst size={21} secondProtocol={bridgeProvider} />
          <span> CoW Protocol</span>
        </b>
      </StopTitle>

      <ConfirmDetailsItem label="" withTimelineDot>
        <TokenFlowContainer>
          <AmountWithTokenIcon>
            <TokenLogo token={sellTokenObj} size={tokenLogoSize} />
            {sellAmount} {sellToken}
          </AmountWithTokenIcon>
          <ArrowIcon>→</ArrowIcon>
          <AmountWithTokenIcon>
            <TokenLogo token={buyTokenObj} size={tokenLogoSize} />
            {buyAmount} {buyToken} on {sourceChainName}
          </AmountWithTokenIcon>
        </TokenFlowContainer>
      </ConfirmDetailsItem>

      <ConfirmDetailsItem
        label={
          <>
            Swap fee <InfoTooltip content="No fee for order placement!" size={14} />
          </>
        }
        withTimelineDot
        contentTextColor={getFeeTextColor(BridgeFeeType.FREE)} // Explicitly use FREE type
      >
        FREE
      </ConfirmDetailsItem>

      <ConfirmDetailsItem
        label={
          <>
            Network cost (est.){' '}
            <InfoTooltip
              content="This is the cost of settling your order on-chain, including gas and any LP fees. CoW Swap will try to lower this cost where possible."
              size={14}
            />
          </>
        }
        withTimelineDot
      >
        {networkCost} {sellToken}&nbsp;
        {networkCostUsdValue && (
          <i>
            (<FiatAmount amount={networkCostUsdValue} />)
          </i>
        )}
      </ConfirmDetailsItem>

      {swapExpectedToReceive && (
        <ConfirmDetailsItem
          withTimelineDot
          label={
            <>
              Expected to receive{' '}
              <InfoTooltip
                content={`The estimated amount you'll receive after estimated network costs and the max slippage setting (${swapMaxSlippage}%).`}
                size={14}
              />
            </>
          }
        >
          <AmountWithTokenIcon>
            {swapExpectedToReceive} {buyToken}
            {swapExpectedReceiveUsdValue && (
              <i>
                (<FiatAmount amount={swapExpectedReceiveUsdValue} />)
              </i>
            )}
          </AmountWithTokenIcon>
        </ConfirmDetailsItem>
      )}

      {swapMaxSlippage && (
        <ConfirmDetailsItem
          label={
            <>
              Max. swap slippage{' '}
              <InfoTooltip
                content="CoW Swap dynamically adjusts your slippage tolerance to ensure your trade executes quickly while still getting the best price. Trades are protected from MEV, so your slippage can't be exploited!"
                size={14}
              />
            </>
          }
          withTimelineDot
        >
          {swapMaxSlippage}%
        </ConfirmDetailsItem>
      )}

      {swapMinReceive && (
        <ConfirmDetailsItem
          label={
            <ReceiveAmountTitle>
              <b>Min. to receive</b>
            </ReceiveAmountTitle>
          }
        >
          <b>
            <AmountWithTokenIcon>
              <TokenLogo token={buyTokenObj} size={tokenLogoSize} />
              {swapMinReceive} {buyToken}
              {swapMinReceiveUsdValue && (
                <i>
                  (<FiatAmount amount={swapMinReceiveUsdValue} />)
                </i>
              )}
            </AmountWithTokenIcon>
          </b>
        </ConfirmDetailsItem>
      )}

      <DividerHorizontal margin="8px 0 4px" />
    </>
  )
}
