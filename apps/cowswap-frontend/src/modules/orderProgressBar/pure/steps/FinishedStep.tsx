import { ReactNode, useMemo } from 'react'

import iconSocialXSrc from '@cowprotocol/assets/images/icon-social-x.svg'
import {
  ExplorerDataType,
  getCoWExplorerLinkTitle,
  getExplorerLink,
  getExplorerOrderLink,
  isSellOrder,
  shortenAddress,
} from '@cowprotocol/common-utils'
import { isSupportedAddress, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'
import { TEST_IDS } from '@cowprotocol/test-ids'
import { Confetti, ExternalLink } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import { useInjectedWidgetParams } from 'entities/injectedWidget'
import SVG from 'react-inlinesvg'

import { Order } from 'legacy/state/orders/actions'

import { BaseTradeConfirmation, CowParticipationFooter, TradeTokenPairProps } from 'modules/trade'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { SurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { CurrencyPreviewSecondaryAmount } from 'common/pure/CurrencyAmountPreview'
import { SolverCompetition } from 'common/types/soverCompetition'
import { getIsCustomRecipient } from 'utils/orderUtils/getIsCustomRecipient'

import * as styledEl from './styled'

import { getTwitterShareUrl, getTwitterShareUrlForBenefit } from '../../helpers'
import { useWithConfetti } from '../../hooks/useWithConfetti'
import { OrderProgressBarProps, OrderProgressBarStepName } from '../../types'
import { ConfirmationOutcomeSlot } from '../ConfirmationOutcomeSlot/ConfirmationOutcomeSlot.pure'
import { SolverAuctionResult } from '../SolverAuctionResult/SolverAuctionResult.pure'
import { SolverCompetitionExpand } from '../SolverCompetitionExpand/SolverCompetitionExpand.pure'
import { WaitAndSaveOutcome } from '../WaitAndSaveOutcome/WaitAndSaveOutcome.pure'

export interface FinishedSuccessHeadingProps {
  order: Order
  chainId: SupportedChainId
  receiverEnsName?: string | null
  stepName?: OrderProgressBarStepName
  title?: ReactNode
}

interface FinishedStepProps {
  children: React.ReactNode
  stepName?: OrderProgressBarStepName
  surplusData?: SurplusData
  solvers?: SolverCompetition[]
  order?: Order
  chainId: SupportedChainId
  receiverEnsName?: string | null
  totalSolvers?: number
  randomBenefit: string
  debugForceShowSurplus?: boolean
  solverCompetitionPending?: boolean
  waitAndSave?: OrderProgressBarProps['waitAndSave']
}

// eslint-disable-next-line complexity
export function FinishedStep({
  children,
  stepName,
  surplusData,
  solvers,
  order,
  totalSolvers,
  randomBenefit,
  debugForceShowSurplus,
  solverCompetitionPending = false,
  waitAndSave,
}: FinishedStepProps): ReactNode {
  const { t } = useLingui()
  const { disablePostTradeTips } = useInjectedWidgetParams()
  const cancellationFailed = stepName === 'cancellationFailed'
  const { showSurplus } = surplusData || {}
  const shouldShowSurplus = Boolean(debugForceShowSurplus || showSurplus)
  const showWaitAndSaveCard = Boolean(waitAndSave?.outcome)
  const isSell = Boolean(order && isSellOrder(order.kind))
  const surplusTooltip = isSell
    ? t`The extra amount you received compared to your limit price.`
    : t`The amount you saved compared to your limit price.`
  const surplusPrefix = isSell ? '+' : `${t`saved`} `
  const surplusSecondaryAmount = useMemo(
    () =>
      getFinishedSurplusSecondaryAmount(
        surplusData,
        shouldShowSurplus && !showWaitAndSaveCard,
        surplusTooltip,
        surplusPrefix,
      ),
    [surplusData, shouldShowSurplus, showWaitAndSaveCard, surplusTooltip, surplusPrefix],
  )

  const showConfetti = useWithConfetti({
    isFinished: stepName === 'finished',
    surplusData,
    debugForceShowSurplus,
  })

  const twitterUrl = useMemo(() => {
    return shouldShowSurplus ? getTwitterShareUrl(surplusData, order) : getTwitterShareUrlForBenefit(randomBenefit)
  }, [shouldShowSurplus, surplusData, order, randomBenefit])

  const soldLabel = t`You sold`
  const receivedLabel = t`You received`
  const celebrateWin = shouldShowSurplus || showWaitAndSaveCard
  const tokenPair = useFinishedTokenPair(order, soldLabel, receivedLabel, surplusSecondaryAmount, waitAndSave)

  const showShare = !disablePostTradeTips || celebrateWin
  const competitionPending = waitAndSave?.pending === true
  const surplusPending = !cancellationFailed && surplusData?.isReady === false
  const outcomeLoading = solverCompetitionPending || competitionPending || surplusPending
  const solversList = competitionPending ? [] : (solvers ?? [])
  const hasSolvers = solversList.length > 0
  const showExpandedAuction = hasSolvers && !shouldShowSurplus && !showWaitAndSaveCard
  const showCollapsedSolvers = !outcomeLoading && hasSolvers && !showExpandedAuction

  if (!order) {
    return null
  }

  return (
    <styledEl.FinishedStepContainer>
      {showConfetti && <Confetti start={true} />}
      {cancellationFailed ? <CancellationFailedBanner /> : null}

      <BaseTradeConfirmation tokenPair={tokenPair}>
        {waitAndSave?.outcome ? <WaitAndSaveOutcome {...waitAndSave.outcome} /> : null}

        {outcomeLoading || !showWaitAndSaveCard ? (
          <ConfirmationOutcomeSlot loading={outcomeLoading}>
            {showExpandedAuction ? (
              <SolverAuctionResult
                solvers={solversList}
                totalSolvers={totalSolvers}
                buyToken={order.outputToken}
                framed
              />
            ) : (
              children
            )}
          </ConfirmationOutcomeSlot>
        ) : null}

        {showCollapsedSolvers ? (
          <SolverCompetitionExpand solvers={solversList} totalSolvers={totalSolvers} buyToken={order.outputToken} />
        ) : null}

        {showShare ? <FinishedShareButton twitterUrl={twitterUrl} shouldShowSurplus={celebrateWin} /> : null}
      </BaseTradeConfirmation>
    </styledEl.FinishedStepContainer>
  )
}

export function FinishedSuccessHeading({
  order,
  chainId,
  receiverEnsName,
  stepName,
  title,
}: FinishedSuccessHeadingProps): ReactNode {
  return (
    <BaseTradeConfirmation
      heading={{
        title: title ?? getFinishedSuccessTitle(stepName),
        subtitle: <FinishedSubtitle order={order} chainId={chainId} receiverEnsName={receiverEnsName} />,
      }}
    />
  )
}

function buildFinishedTokenPair(
  order: Order,
  soldLabel: string,
  receivedLabel: string,
  surplusSecondaryAmount?: CurrencyPreviewSecondaryAmount,
): TradeTokenPairProps {
  const sold = settledPreview(order.inputToken, order.apiAdditionalInfo?.executedSellAmount)
  const received = settledPreview(order.outputToken, order.apiAdditionalInfo?.executedBuyAmount)
  const showSurplusOnSoldSide = Boolean(surplusSecondaryAmount) && !isSellOrder(order.kind)

  return {
    variant: 'slim',
    inputCurrencyInfo: {
      ...sold,
      fiatAmount: null,
      balance: null,
      label: soldLabel,
      secondaryAmount: showSurplusOnSoldSide ? surplusSecondaryAmount : undefined,
    },
    outputCurrencyInfo: {
      ...received,
      fiatAmount: null,
      balance: null,
      label: receivedLabel,
      secondaryAmount: showSurplusOnSoldSide ? undefined : surplusSecondaryAmount,
    },
    priceImpact: { priceImpact: undefined, loading: false },
    inputTestId: TEST_IDS.orderSoldAmount,
    outputTestId: TEST_IDS.orderReceivedAmount,
  }
}

function CancellationFailedBanner(): ReactNode {
  return (
    <styledEl.CancellationFailedBanner>
      <b>
        <Trans>Cancellation failed</Trans>:
      </b>{' '}
      <Trans>The order was executed before it could be cancelled.</Trans>
    </styledEl.CancellationFailedBanner>
  )
}

function FinishedShareButton({
  twitterUrl,
  shouldShowSurplus,
}: {
  twitterUrl: string
  shouldShowSurplus: boolean
}): ReactNode {
  return (
    <styledEl.ShareButton
      as="a"
      href={twitterUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-click-event={toCowSwapGtmEvent({
        category: CowSwapAnalyticsCategory.PROGRESS_BAR,
        action: 'Click Share Button',
        label: shouldShowSurplus ? 'Surplus' : 'Tip',
      })}
    >
      <SVG src={iconSocialXSrc} />
      <span>{shouldShowSurplus ? <Trans>Share this win!</Trans> : <Trans>Share this swap</Trans>}</span>
    </styledEl.ShareButton>
  )
}

function FinishedSubtitle({
  order,
  chainId,
  receiverEnsName,
}: {
  order: Order
  chainId: SupportedChainId
  receiverEnsName?: string | null
}): ReactNode {
  const isCustomRecipient = getIsCustomRecipient(order)
  const receiver = order.receiver || order.owner
  const tokenSymbol = order.outputToken.symbol ?? order.outputToken.name ?? ''
  const explorerHref = getExplorerOrderLink(chainId, order.id)
  const explorerTitle = getCoWExplorerLinkTitle()

  if (isCustomRecipient && receiver) {
    const recipientLabel = receiverEnsName || shortenAddress(receiver)
    const recipientHref = isSupportedAddress(receiver)
      ? getExplorerLink(chainId, receiver, ExplorerDataType.ADDRESS)
      : null
    const recipientNode = recipientHref ? (
      <ExternalLink href={recipientHref}>{recipientLabel}</ExternalLink>
    ) : (
      recipientLabel
    )

    return (
      <Trans>
        Your {tokenSymbol} was sent to {recipientNode}.{' '}
        <ExternalLink href={explorerHref}>{explorerTitle} ↗</ExternalLink>
      </Trans>
    )
  }

  return (
    <Trans>
      Your {tokenSymbol} is in your wallet. <ExternalLink href={explorerHref}>{explorerTitle} ↗</ExternalLink>
    </Trans>
  )
}

function getFinishedSuccessTitle(stepName?: OrderProgressBarStepName): ReactNode {
  if (stepName === OrderProgressBarStepName.CANCELLATION_FAILED) {
    return <Trans>Order complete</Trans>
  }

  return <Trans>Swap complete</Trans>
}

function getFinishedSurplusSecondaryAmount(
  surplusData: SurplusData | undefined,
  shouldShowReceivedSurplus: boolean,
  tooltip: string,
  prefix: ReactNode,
): CurrencyPreviewSecondaryAmount | undefined {
  if (!shouldShowReceivedSurplus || !surplusData?.surplusAmount) {
    return undefined
  }

  return {
    amount: surplusData.surplusAmount,
    fiatAmount: surplusData.showFiatValue ? surplusData.surplusFiatValue : undefined,
    prefix,
    tooltip,
    variant: 'success',
  }
}

function isNonZeroAmount(amount: string | undefined): amount is string {
  return !!amount && amount !== '0'
}

function settledPreview(
  token: Order['inputToken'],
  rawAmount: string | undefined,
): { amount: CurrencyAmount<Order['inputToken']> | null; token: Order['inputToken']; amountLoading: boolean } {
  if (!isNonZeroAmount(rawAmount)) {
    return { amount: null, token, amountLoading: true }
  }

  return { amount: CurrencyAmount.fromRawAmount(token, rawAmount), token, amountLoading: false }
}

function useFinishedTokenPair(
  order: Order | undefined,
  soldLabel: string,
  receivedLabel: string,
  surplusSecondaryAmount: CurrencyPreviewSecondaryAmount | undefined,
  waitAndSave: OrderProgressBarProps['waitAndSave'],
): TradeTokenPairProps | undefined {
  return useMemo(() => {
    if (!order) {
      return undefined
    }

    const pair = buildFinishedTokenPair(order, soldLabel, receivedLabel, surplusSecondaryAmount)

    if (!pair || !waitAndSave?.strip) {
      return pair
    }

    return {
      ...pair,
      footer: <CowParticipationFooter {...waitAndSave.strip} />,
    }
  }, [order, soldLabel, receivedLabel, surplusSecondaryAmount, waitAndSave])
}
