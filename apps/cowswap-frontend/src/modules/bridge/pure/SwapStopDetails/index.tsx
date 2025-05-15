import { ReactNode } from 'react'

import CarretIcon from '@cowprotocol/assets/cow-swap/carret-down.svg'
import CheckmarkIcon from '@cowprotocol/assets/cow-swap/checkmark.svg'
import RefundIcon from '@cowprotocol/assets/cow-swap/icon-refund.svg'
import SpinnerIcon from '@cowprotocol/assets/cow-swap/spinner.svg'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink, isAddress, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { FiatAmount, InfoTooltip } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'

import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'
import { ReceiveAmountTitle } from 'modules/trade/pure/ReceiveAmountTitle'
import { UsdAmountInfo } from 'modules/usdAmount/hooks/useUsdAmount'

import { ProtocolIcons } from 'common/pure/ProtocolIcons'

import {
  ArrowIcon,
  ClickableStopTitle,
  Link,
  SectionContent,
  StopNumberCircle,
  StopTitle,
  StyledSpinnerIcon,
  ToggleArrow,
  ToggleIconContainer,
  TokenFlowContainer,
} from '../../styles'
import { BridgeProtocolConfig, BridgeFeeType } from '../../types'
import { getFeeTextColor } from '../../utils/fees'
import { StopStatusEnum } from '../../utils/status'
import { StyledRefundCompleteIcon } from '../BridgeStopDetails/index'
import { RecipientWrapper } from '../BridgeStopDetails/styled'
import { NetworkLogo } from '../NetworkLogo'
import { TokenAmountDisplay } from '../TokenAmountDisplay'

const StopStatusIcons: Record<StopStatusEnum, ReactNode> = {
  [StopStatusEnum.DONE]: <SVG src={CheckmarkIcon} />,
  [StopStatusEnum.PENDING]: <StyledSpinnerIcon src={SpinnerIcon} />,
  [StopStatusEnum.FAILED]: <SVG src={RefundIcon} />,
  [StopStatusEnum.REFUND_COMPLETE]: <StyledRefundCompleteIcon src={RefundIcon} />,
  [StopStatusEnum.DEFAULT]: null,
}

const StopStatusTitlePrefixes: Record<StopStatusEnum, ReactNode> = {
  [StopStatusEnum.DONE]: 'Swapped on',
  [StopStatusEnum.PENDING]: 'Swapping on',
  [StopStatusEnum.FAILED]: 'Swap failed',
  [StopStatusEnum.REFUND_COMPLETE]: 'Swap refunded',
  [StopStatusEnum.DEFAULT]: 'Swap on',
}

export interface SwapStopDetailsProps {
  isCollapsible?: boolean
  isExpanded?: boolean
  onToggle?: () => void
  status?: StopStatusEnum
  sellCurrencyAmount: CurrencyAmount<TokenWithLogo>
  buyCurrencyAmount: CurrencyAmount<TokenWithLogo>
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
  recipient?: string
  sourceChainId: SupportedChainId
}

export function SwapStopDetails({
  isCollapsible = false,
  isExpanded = true,
  onToggle = () => {},
  status = StopStatusEnum.DEFAULT,
  sellCurrencyAmount,
  buyCurrencyAmount,
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
  recipient,
  sourceChainId,
}: SwapStopDetailsProps): ReactNode {
  const sellToken = sellCurrencyAmount.currency
  const sellAmount = sellCurrencyAmount.toSignificant(6)
  const sellTokenSymbol = sellToken.symbol || '???'

  const buyToken = buyCurrencyAmount.currency
  const buyAmount = buyCurrencyAmount.toSignificant(6)
  const buyTokenSymbol = buyToken.symbol || '???'

  const networkCostUsdValue = networkCostUsdResult?.value
  const swapExpectedReceiveUsdValue = swapExpectedReceiveUsdResult?.value
  const swapMinReceiveUsdValue = swapMinReceiveUsdResult?.value

  const TitleContent = (
    <>
      <StopNumberCircle status={status} stopNumber={1}>
        {StopStatusIcons[status]}
      </StopNumberCircle>
      <b>
        <span>{StopStatusTitlePrefixes[status]} </span>
        <ProtocolIcons showOnlyFirst size={21} secondProtocol={bridgeProvider} />
        <span> CoW Protocol</span>
      </b>
      {isCollapsible && (
        <ToggleIconContainer>
          <ToggleArrow isOpen={isExpanded}>
            <SVG src={CarretIcon} title={isExpanded ? 'Close' : 'Open'} />
          </ToggleArrow>
        </ToggleIconContainer>
      )}
    </>
  )

  return (
    <>
      {isCollapsible ? (
        <ClickableStopTitle isCollapsible={true} onClick={onToggle}>
          {TitleContent}
        </ClickableStopTitle>
      ) : (
        <StopTitle>{TitleContent}</StopTitle>
      )}

      <SectionContent isExpanded={isExpanded}>
        <ConfirmDetailsItem label="" withTimelineDot>
          <TokenFlowContainer>
            <TokenAmountDisplay
              token={sellToken}
              amount={sellAmount}
              displaySymbol={sellTokenSymbol}
              tokenLogoSize={tokenLogoSize}
              hideFiatAmount={true}
            />
            <ArrowIcon>→</ArrowIcon>
            <TokenAmountDisplay
              token={buyToken}
              amount={buyAmount}
              displaySymbol={buyTokenSymbol}
              tokenLogoSize={tokenLogoSize}
              hideFiatAmount={true}
            />
            {` on ${sourceChainName}`}
          </TokenFlowContainer>
        </ConfirmDetailsItem>

        <ConfirmDetailsItem
          label={
            <>
              Swap fee <InfoTooltip content="No fee for order placement!" size={14} />
            </>
          }
          withTimelineDot
          contentTextColor={getFeeTextColor(BridgeFeeType.FREE)}
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
          {networkCost} {sellTokenSymbol}&nbsp;
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
                  content={`The estimated amount you\'ll receive after estimated network costs and the max slippage setting (${swapMaxSlippage}%).`}
                  size={14}
                />
              </>
            }
          >
            <TokenAmountDisplay
              token={buyToken}
              amount={swapExpectedToReceive}
              displaySymbol={buyTokenSymbol}
              usdValue={swapExpectedReceiveUsdValue}
              tokenLogoSize={tokenLogoSize}
            />
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

        {recipient && (
          <ConfirmDetailsItem
            label={
              <>
                Recipient <InfoTooltip content="The address that will receive the tokens." size={14} />
              </>
            }
            withTimelineDot
          >
            <RecipientWrapper>
              <NetworkLogo chainId={sourceChainId} size={16} />
              {isAddress(recipient) ? (
                <Link
                  href={getExplorerLink(sourceChainId, recipient, ExplorerDataType.ADDRESS)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {shortenAddress(recipient)} ↗
                </Link>
              ) : (
                recipient
              )}
            </RecipientWrapper>
          </ConfirmDetailsItem>
        )}

        {status !== StopStatusEnum.FAILED && status !== StopStatusEnum.REFUND_COMPLETE && swapMinReceive && (
          <ConfirmDetailsItem
            label={<ReceiveAmountTitle>Min. to receive</ReceiveAmountTitle>}
            isLast={status !== StopStatusEnum.DONE && status !== StopStatusEnum.PENDING}
          >
            <b>
              <TokenAmountDisplay
                token={buyToken}
                amount={swapMinReceive}
                displaySymbol={buyTokenSymbol}
                usdValue={swapMinReceiveUsdValue}
                tokenLogoSize={tokenLogoSize}
              />
            </b>
          </ConfirmDetailsItem>
        )}
      </SectionContent>
    </>
  )
}
