import React, { useCallback, useMemo, useState } from 'react'

import ICON_SOCIAL_X from '@cowprotocol/assets/images/icon-social-x.svg'
import LOTTIE_GREEN_CHECKMARK_DARK from '@cowprotocol/assets/lottie/green-checkmark-dark.json'
import LOTTIE_GREEN_CHECKMARK from '@cowprotocol/assets/lottie/green-checkmark.json'
import { RECEIVED_LABEL } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink, getRandomInt, isSellOrder, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { Confetti, ExternalLink, InfoTooltip, TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { i18n } from '@lingui/core'
import { Trans, useLingui } from '@lingui/react/macro'
import Lottie from 'lottie-react'
import { PiCaretDown, PiCaretUp, PiTrophyFill } from 'react-icons/pi'
import SVG from 'react-inlinesvg'

import { AMM_LOGOS } from 'legacy/components/AMMsLogo'
import { Order } from 'legacy/state/orders/actions'
import { useIsDarkMode } from 'legacy/state/user/hooks'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { SurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { SolverCompetition } from 'common/types/soverCompetition'
import { getIsCustomRecipient } from 'utils/orderUtils/getIsCustomRecipient'

import * as styledEl from './styled'

import { CHAIN_SPECIFIC_BENEFITS, SURPLUS_IMAGES } from '../../constants'
import { getSurplusText, getTwitterShareUrl, getTwitterShareUrlForBenefit } from '../../helpers'
import { useWithConfetti } from '../../hooks/useWithConfetti'
import { OrderProgressBarStepName } from '../../types'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getTransactionStatus(isDarkMode: boolean) {
  return (
    <styledEl.TransactionStatus margin={'0 auto 24px'}>
      <Lottie
        animationData={isDarkMode ? LOTTIE_GREEN_CHECKMARK_DARK : LOTTIE_GREEN_CHECKMARK}
        loop={false}
        autoplay
        style={{ width: '36px', height: '36px' }}
      />
      <Trans>Transaction completed!</Trans>
    </styledEl.TransactionStatus>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getSoldAmount(order: Order) {
  return (
    <styledEl.SoldAmount>
      <Trans>
        You sold <TokenLogo token={order.inputToken} size={20} />
      </Trans>
      <b>
        <TokenAmount
          amount={CurrencyAmount.fromRawAmount(order.inputToken, order.apiAdditionalInfo?.executedSellAmount || 0)}
          tokenSymbol={order.inputToken}
        />
      </b>
    </styledEl.SoldAmount>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getReceivedAmount(
  order: Order,
  chainId: SupportedChainId,
  isCustomRecipient?: boolean,
  receiver?: string | null,
  receiverEnsName?: string | null,
) {
  return (
    <styledEl.ReceivedAmount>
      {!isCustomRecipient && i18n._(RECEIVED_LABEL)}
      <TokenLogo token={order.outputToken} size={20} />
      <b>
        <TokenAmount
          amount={CurrencyAmount.fromRawAmount(order.outputToken, order.apiAdditionalInfo?.executedBuyAmount || 0)}
          tokenSymbol={order.outputToken}
        />
      </b>{' '}
      {isCustomRecipient && receiver && (
        <>
          <Trans>was sent to</Trans>
          <ExternalLink href={getExplorerLink(chainId, receiver, ExplorerDataType.ADDRESS)}>
            {receiverEnsName || shortenAddress(receiver)} ↗
          </ExternalLink>
        </>
      )}
    </styledEl.ReceivedAmount>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getExtraAmount(
  surplusAmount?: CurrencyAmount<Currency> | null,
  surplusFiatValue?: CurrencyAmount<Currency> | null,
  isCustomRecipient?: boolean,
  isSell?: boolean,
) {
  return (
    <styledEl.ExtraAmount>
      {getSurplusText(isSell, isCustomRecipient)}
      <i>
        +<TokenAmount amount={surplusAmount} tokenSymbol={surplusAmount?.currency} />
      </i>{' '}
      {surplusFiatValue && +surplusFiatValue.toFixed(2) > 0 && <>(~${surplusFiatValue.toFixed(2)})</>}
    </styledEl.ExtraAmount>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getSolverRow(solver: SolverCompetition, index: number, solvers: SolverCompetition[]) {
  return (
    <styledEl.SolverTableRow key={`${solver.solver}-${index}`} isWinner={index === 0}>
      {solvers.length > 1 && <styledEl.SolverRank>{index + 1}</styledEl.SolverRank>}
      <styledEl.SolverTableCell>
        <styledEl.SolverInfo>
          <styledEl.SolverLogo>
            <img
              src={solver.image || AMM_LOGOS[solver.solver]?.src || AMM_LOGOS.default.src}
              alt={`${solver.solver} logo`}
              width="24"
              height="24"
            />
          </styledEl.SolverLogo>
          <styledEl.SolverName>
            {solver.displayName || solver.solver}
            {solver.description && (
              <span>
                <InfoTooltip content={solver.description} />
              </span>
            )}
          </styledEl.SolverName>
        </styledEl.SolverInfo>
      </styledEl.SolverTableCell>
      <styledEl.SolverTableCell>
        {index === 0 && (
          <styledEl.WinningBadge>
            <styledEl.TrophyIcon>
              <PiTrophyFill />
            </styledEl.TrophyIcon>
            <span>
              <Trans>Winning solver</Trans>
            </span>
          </styledEl.WinningBadge>
        )}
      </styledEl.SolverTableCell>
    </styledEl.SolverTableRow>
  )
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
  debugForceShowSurplus?: boolean
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function FinishedStep({
  children,
  stepName,
  surplusData,
  solvers,
  order,
  chainId,
  receiverEnsName,
  totalSolvers,
  debugForceShowSurplus,
}: FinishedStepProps) {
  const { t } = useLingui()
  const [showAllSolvers, setShowAllSolvers] = useState(false)
  const cancellationFailed = stepName === 'cancellationFailed'
  const { surplusFiatValue, surplusAmount, showSurplus } = surplusData || {}
  const shouldShowSurplus = debugForceShowSurplus || showSurplus

  const showConfetti = useWithConfetti({
    isFinished: stepName === 'finished',
    surplusData,
    debugForceShowSurplus,
  })

  const visibleSolvers = useMemo(() => {
    return showAllSolvers ? solvers : solvers?.slice(0, 3)
  }, [showAllSolvers, solvers])

  const isSell = order && isSellOrder(order.kind)
  const isCustomRecipient = order && getIsCustomRecipient(order)
  const receiver = order?.receiver || order?.owner

  const isDarkMode = useIsDarkMode()

  const { randomBenefit } = useMemo(() => {
    const benefits = CHAIN_SPECIFIC_BENEFITS[chainId]

    return {
      randomImage: SURPLUS_IMAGES[getRandomInt(0, SURPLUS_IMAGES.length - 1)],
      randomBenefit: t(benefits[getRandomInt(0, benefits.length - 1)]),
    }
  }, [chainId, t])

  const shareOnTwitter = useCallback(() => {
    const twitterUrl = shouldShowSurplus
      ? getTwitterShareUrl(surplusData, order)
      : getTwitterShareUrlForBenefit(randomBenefit)
    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
  }, [shouldShowSurplus, surplusData, order, randomBenefit])

  // If order is not set, return null
  if (!order) {
    return null
  }
  const solversLength = solvers?.length || 0

  return (
    <styledEl.FinishedStepContainer>
      {showConfetti && <Confetti start={true} />}
      {cancellationFailed && (
        <styledEl.CancellationFailedBanner>
          <b>
            <Trans>Cancellation failed</Trans>:
          </b>{' '}
          <Trans>The order was executed before it could be cancelled.</Trans>
        </styledEl.CancellationFailedBanner>
      )}

      <styledEl.ConclusionContent>
        {getTransactionStatus(isDarkMode)}

        {order?.apiAdditionalInfo?.executedSellAmount && getSoldAmount(order)}

        {order?.apiAdditionalInfo?.executedBuyAmount &&
          getReceivedAmount(order, chainId, isCustomRecipient, receiver, receiverEnsName)}

        {shouldShowSurplus ? getExtraAmount(surplusAmount, surplusFiatValue, isCustomRecipient, isSell) : null}

        {solvers && solversLength > 0 && (
          <styledEl.SolverRankings>
            <h3>
              <Trans>Solver auction rankings</Trans>
            </h3>
            {solversLength > 1 && (
              <p>
                <b>
                  {totalSolvers ? (
                    <Trans>
                      {solversLength} out of {totalSolvers} solvers
                    </Trans>
                  ) : (
                    <Trans>{solversLength} solvers</Trans>
                  )}
                </b>{' '}
                <Trans>submitted a solution</Trans>
              </p>
            )}

            <styledEl.SolverTable>
              <tbody>{visibleSolvers?.map((solver, index) => getSolverRow(solver, index, solvers))}</tbody>
            </styledEl.SolverTable>

            {solversLength > 3 && (
              <styledEl.ViewMoreButton
                data-click-event={toCowSwapGtmEvent({
                  category: CowSwapAnalyticsCategory.PROGRESS_BAR,
                  action: 'Click Toggle Solvers',
                  label: showAllSolvers ? 'Hide' : 'Show',
                })}
                onClick={() => setShowAllSolvers((prev) => !prev)}
              >
                {showAllSolvers ? (
                  <>
                    <Trans>Collapse</Trans> <PiCaretUp />
                  </>
                ) : (
                  <>
                    <Trans>View</Trans> {solversLength - 3} <Trans>more</Trans> <PiCaretDown />
                  </>
                )}
              </styledEl.ViewMoreButton>
            )}
          </styledEl.SolverRankings>
        )}
      </styledEl.ConclusionContent>

      {children}
      <styledEl.ShareButton
        data-click-event={toCowSwapGtmEvent({
          category: CowSwapAnalyticsCategory.PROGRESS_BAR,
          action: 'Click Share Button',
          label: shouldShowSurplus ? 'Surplus' : 'Tip',
        })}
        onClick={shareOnTwitter}
      >
        <SVG src={ICON_SOCIAL_X} />
        <span>
          <Trans>Share this</Trans> {shouldShowSurplus ? <Trans>win</Trans> : <Trans>tip</Trans>}!
        </span>
      </styledEl.ShareButton>
    </styledEl.FinishedStepContainer>
  )
}
