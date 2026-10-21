import { ReactNode, useMemo } from 'react'

import iconSocialXSrc from '@cowprotocol/assets/images/icon-social-x.svg'
import { getCoWExplorerLinkTitle, getExplorerOrderLink, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'
import { TEST_IDS } from '@cowprotocol/test-ids'
import { Confetti, ExternalLink } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import { useInjectedWidgetParams } from 'entities/injectedWidget'
import SVG from 'react-inlinesvg'

import { Order } from 'legacy/state/orders/actions'

import { BaseTradeConfirmation, TradeTokenPairProps } from 'modules/trade'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { SurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { SolverCompetition } from 'common/types/soverCompetition'
import { getIsCustomRecipient } from 'utils/orderUtils/getIsCustomRecipient'

import * as styledEl from './styled'

import { getTwitterShareUrl, getTwitterShareUrlForBenefit } from '../../helpers'
import { useWithConfetti } from '../../hooks/useWithConfetti'
import { OrderProgressBarStepName } from '../../types'
import { SolverCompetitionExpand } from '../SolverCompetitionExpand/SolverCompetitionExpand.pure'

export interface FinishedSuccessHeadingProps {
  order: Order
  chainId: SupportedChainId
  receiverEnsName?: string | null
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
}

export function FinishedStep({
  children,
  stepName,
  surplusData,
  solvers,
  order,
  totalSolvers,
  randomBenefit,
  debugForceShowSurplus,
}: FinishedStepProps): ReactNode {
  const { t } = useLingui()
  const { disablePostTradeTips } = useInjectedWidgetParams()
  const cancellationFailed = stepName === 'cancellationFailed'
  const { showSurplus } = surplusData || {}
  const shouldShowSurplus = Boolean(debugForceShowSurplus || showSurplus)

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
  const tokenPair = useMemo(
    () => (order ? buildFinishedTokenPair(order, soldLabel, receivedLabel) : undefined),
    [order, soldLabel, receivedLabel],
  )

  if (!order) {
    return null
  }

  const showShare = !disablePostTradeTips || shouldShowSurplus
  const solversList = solvers ?? []

  return (
    <styledEl.FinishedStepContainer>
      {showConfetti && <Confetti start={true} />}
      {cancellationFailed ? <CancellationFailedBanner /> : null}

      <BaseTradeConfirmation tokenPair={tokenPair}>
        {solversList.length > 0 ? (
          <SolverCompetitionExpand solvers={solversList} totalSolvers={totalSolvers} buyToken={order.outputToken} />
        ) : null}

        {children}

        {showShare ? <FinishedShareButton twitterUrl={twitterUrl} shouldShowSurplus={shouldShowSurplus} /> : null}
      </BaseTradeConfirmation>
    </styledEl.FinishedStepContainer>
  )
}

export function FinishedSuccessHeading({ order, chainId, receiverEnsName }: FinishedSuccessHeadingProps): ReactNode {
  return (
    <BaseTradeConfirmation
      heading={{
        title: <Trans>Swap complete</Trans>,
        subtitle: <FinishedSubtitle order={order} chainId={chainId} receiverEnsName={receiverEnsName} />,
      }}
    />
  )
}

function buildFinishedTokenPair(
  order: Order,
  soldLabel: string,
  receivedLabel: string,
): TradeTokenPairProps | undefined {
  const executedSellAmount = order.apiAdditionalInfo?.executedSellAmount
  const executedBuyAmount = order.apiAdditionalInfo?.executedBuyAmount

  if (!isNonZeroAmount(executedSellAmount) || !isNonZeroAmount(executedBuyAmount)) {
    return undefined
  }

  return {
    variant: 'slim',
    inputCurrencyInfo: {
      amount: CurrencyAmount.fromRawAmount(order.inputToken, executedSellAmount),
      fiatAmount: null,
      balance: null,
      label: soldLabel,
    },
    outputCurrencyInfo: {
      amount: CurrencyAmount.fromRawAmount(order.outputToken, executedBuyAmount),
      fiatAmount: null,
      balance: null,
      label: receivedLabel,
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
      <span>{shouldShowSurplus ? <Trans>Share this win!</Trans> : <Trans>Share this tip!</Trans>}</span>
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

    return (
      <Trans>
        Your {tokenSymbol} was sent to {recipientLabel}.{' '}
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

function isNonZeroAmount(amount: string | undefined): amount is string {
  return !!amount && amount !== '0'
}
