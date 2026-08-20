import { ReactNode } from 'react'

import iconCowSrc from '@cowprotocol/assets/images/logo-icon-cow.svg'
import { CHAIN_INFO } from '@cowprotocol/common-const'
import {
  ExplorerDataType,
  getExplorerLink,
  getExplorerOrderLink,
  shortenAddress,
  shortenOrderId,
} from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Price, Token } from '@cowprotocol/currency'
import { ExternalLink, TokenAmount } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import { PiArrowRightBold, PiDotsNineBold, PiSparkleFill } from 'react-icons/pi'
import SVG from 'react-inlinesvg'

import { Order } from 'legacy/state/orders/actions'

import { SurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { SolverCompetition } from 'common/types/soverCompetition'

import cowswapThermalHeroSrc from './assets/cowswap-thermal-hero.png'
import cowswapThermalWordmarkSrc from './assets/cowswap-thermal-wordmark.png'
import successCheckSrc from './assets/success-check-1bit@2x.png'
import * as styledEl from './PrintedOrderReceipt.styled'

interface PrintedOrderReceiptProps {
  order: Order
  chainId: SupportedChainId
  receiverEnsName?: string | null
  surplusData?: SurplusData
  winningSolver?: SolverCompetition
}

interface ReceiptData {
  executedPrice: Price<Token, Token> | null
  executionTime: string | null
  filledAt: Date | null
  networkName: string
  receivedAmount: CurrencyAmount<Token>
  receiver: string
  soldAmount: CurrencyAmount<Token>
  transactionHash: string | undefined
}

export function PrintedOrderReceipt({
  order,
  chainId,
  receiverEnsName,
  surplusData,
  winningSolver,
}: PrintedOrderReceiptProps): ReactNode {
  const { i18n, t } = useLingui()
  const receiptData = getReceiptData(order, chainId)

  return (
    <styledEl.ReceiptStage>
      <styledEl.PrinterDevice aria-hidden="true">
        <styledEl.SpeakerGrille>
          <PiDotsNineBold />
        </styledEl.SpeakerGrille>

        <styledEl.PrinterCore>
          <styledEl.DeviceMark>
            <SVG src={iconCowSrc} />
            <styledEl.DeviceIdentity>
              <strong>CASHCOW SYSTEMS</strong>
            </styledEl.DeviceIdentity>
          </styledEl.DeviceMark>
          <styledEl.PrinterMouth />
        </styledEl.PrinterCore>

        <styledEl.SpeakerGrille>
          <PiDotsNineBold />
        </styledEl.SpeakerGrille>
      </styledEl.PrinterDevice>

      <styledEl.ReceiptReveal data-testid="printed-receipt-reveal">
        <styledEl.ReceiptPaper
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label={t`Completed swap receipt`}
        >
          <ReceiptHeader order={order} chainId={chainId} />
          <ReceiptAmounts order={order} receiptData={receiptData} />
          <ReceiptDetails
            chainId={chainId}
            locale={i18n.locale || 'en'}
            receiptData={receiptData}
            receiverEnsName={receiverEnsName}
            surplusData={surplusData}
            winningSolver={winningSolver}
          />

          <styledEl.Divider />

          <styledEl.ReceiptFooter>
            <styledEl.ReceiptSignoff>
              <Trans>Thanks for swapping</Trans>
            </styledEl.ReceiptSignoff>
            <styledEl.PrintedWordmark src={cowswapThermalWordmarkSrc} alt="CoW Swap" width={204} height={26} />
          </styledEl.ReceiptFooter>
        </styledEl.ReceiptPaper>
      </styledEl.ReceiptReveal>
    </styledEl.ReceiptStage>
  )
}

function formatReceiptTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

function getExecutionTime(createdAt: Date | null, filledAt: Date | null): string | null {
  if (!createdAt || !filledAt) return null

  const elapsedSeconds = Math.max(0, Math.round((filledAt.getTime() - createdAt.getTime()) / 1_000))
  if (elapsedSeconds < 60) return `${elapsedSeconds}s`

  const minutes = Math.floor(elapsedSeconds / 60)
  const seconds = elapsedSeconds % 60
  return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`
}

function getReceiptData(order: Order, chainId: SupportedChainId): ReceiptData {
  const executedSellAmount =
    order.apiAdditionalInfo?.executedSellAmountBeforeFees ||
    order.apiAdditionalInfo?.executedSellAmount ||
    order.sellAmount
  const executedBuyAmount = order.apiAdditionalInfo?.executedBuyAmount || order.buyAmount
  const soldAmount = CurrencyAmount.fromRawAmount(order.inputToken, executedSellAmount)
  const receivedAmount = CurrencyAmount.fromRawAmount(order.outputToken, executedBuyAmount)
  const filledAt = getValidDate(order.fulfillmentTime)

  return {
    executedPrice:
      executedSellAmount === '0' || executedBuyAmount === '0'
        ? null
        : new Price({ baseAmount: soldAmount, quoteAmount: receivedAmount }),
    executionTime: getExecutionTime(getValidDate(order.creationTime), filledAt),
    filledAt,
    networkName: CHAIN_INFO[chainId]?.label || String(chainId),
    receivedAmount,
    receiver: order.receiver || order.owner,
    soldAmount,
    transactionHash: order.fulfilledTransactionHash,
  }
}

function getValidDate(value: string | undefined): Date | null {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function ReceiptAmounts({ order, receiptData }: { order: Order; receiptData: ReceiptData }): ReactNode {
  return (
    <>
      <styledEl.TearOffDivider data-testid="receipt-tear-off" aria-hidden="true">
        <hr />
      </styledEl.TearOffDivider>
      <styledEl.AmountsContent>
        <styledEl.AmountBlock>
          <span>
            <Trans>You sold</Trans>
          </span>
          <strong>
            <TokenAmount amount={receiptData.soldAmount} tokenSymbol={order.inputToken} />
          </strong>
        </styledEl.AmountBlock>
        <styledEl.SwapArrow aria-hidden="true">
          <PiArrowRightBold />
        </styledEl.SwapArrow>
        <styledEl.AmountBlock>
          <span>
            <Trans>You received</Trans>
          </span>
          <strong>
            <TokenAmount amount={receiptData.receivedAmount} tokenSymbol={order.outputToken} />
          </strong>
        </styledEl.AmountBlock>
      </styledEl.AmountsContent>
      <styledEl.Divider />
    </>
  )
}

function ReceiptDetails({
  chainId,
  locale,
  receiptData,
  receiverEnsName,
  surplusData,
  winningSolver,
}: {
  chainId: SupportedChainId
  locale: string
  receiptData: ReceiptData
  receiverEnsName?: string | null
  surplusData?: SurplusData
  winningSolver?: SolverCompetition
}): ReactNode {
  const { executedPrice, executionTime, filledAt, networkName, receiver, transactionHash } = receiptData
  const showSurplus = Boolean(surplusData?.showSurplus && surplusData.surplusAmount)

  return (
    <>
      {executedPrice && (
        <ReceiptRow
          label={<Trans>Execution price</Trans>}
          value={`1 ${executedPrice.baseCurrency.symbol || ''} = ${executedPrice.toSignificant(6)} ${
            executedPrice.quoteCurrency.symbol || ''
          }`}
          emphasize
        />
      )}
      {showSurplus && surplusData?.surplusAmount && <ReceiptSurplus surplusData={surplusData} />}
      <ReceiptRow label={<Trans>Network</Trans>} value={networkName} />
      {executionTime && <ReceiptRow label={<Trans>Time to fill</Trans>} value={executionTime} />}
      {filledAt && <ReceiptRow label={<Trans>Filled</Trans>} value={formatReceiptTime(filledAt, locale)} />}
      <ReceiptRow
        label={<Trans>Received by</Trans>}
        value={
          <ExternalLink href={getExplorerLink(chainId, receiver, ExplorerDataType.ADDRESS)}>
            {receiverEnsName || shortenAddress(receiver)} ↗
          </ExternalLink>
        }
      />
      {winningSolver && (
        <ReceiptRow label={<Trans>Winning solver</Trans>} value={winningSolver.displayName || winningSolver.solver} />
      )}
      {transactionHash && (
        <ReceiptRow
          label={<Trans>Settlement</Trans>}
          value={
            <ExternalLink href={getExplorerLink(chainId, transactionHash, ExplorerDataType.TRANSACTION)}>
              {shortenAddress(transactionHash)} ↗
            </ExternalLink>
          }
        />
      )}
    </>
  )
}

function ReceiptHeader({ order, chainId }: { order: Order; chainId: SupportedChainId }): ReactNode {
  return (
    <>
      <styledEl.Brand>
        <Trans>Order receipt</Trans>
      </styledEl.Brand>
      <styledEl.CompletionHeading>
        <styledEl.HeroArtwork aria-hidden="true">
          <styledEl.HeroSparkle $side="left">
            <PiSparkleFill />
          </styledEl.HeroSparkle>
          <styledEl.PrintedHero src={cowswapThermalHeroSrc} alt="" width={120} height={80} />
          <styledEl.HeroSparkle $side="right">
            <PiSparkleFill />
          </styledEl.HeroSparkle>
          <styledEl.SuccessStamp src={successCheckSrc} alt="" width={24} height={24} />
        </styledEl.HeroArtwork>
        <strong>
          <Trans>Trade succeeded</Trans>
        </strong>
      </styledEl.CompletionHeading>
      <styledEl.OrderLink href={getExplorerOrderLink(chainId, order.id)}>
        <Trans>Order</Trans> {shortenOrderId(order.id)} ↗
      </styledEl.OrderLink>
    </>
  )
}

function ReceiptRow({
  label,
  value,
  emphasize = false,
}: {
  label: ReactNode
  value: ReactNode
  emphasize?: boolean
}): ReactNode {
  return (
    <styledEl.ReceiptRow $emphasize={emphasize}>
      <span>{label}</span>
      <strong>{value}</strong>
    </styledEl.ReceiptRow>
  )
}

function ReceiptSurplus({ surplusData }: { surplusData: SurplusData }): ReactNode {
  const { surplusAmount, surplusFiatValue } = surplusData
  if (!surplusAmount) return null

  return (
    <ReceiptRow
      label={<Trans>Price improvement</Trans>}
      value={
        <styledEl.SurplusValue>
          +<TokenAmount amount={surplusAmount} tokenSymbol={surplusAmount.currency} />
          {surplusFiatValue && +surplusFiatValue.toFixed(2) > 0 ? ` (~$${surplusFiatValue.toFixed(2)})` : null}
        </styledEl.SurplusValue>
      }
      emphasize
    />
  )
}
