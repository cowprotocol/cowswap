import { ReactNode, useMemo, useState } from 'react'

import iconSocialXSrc from '@cowprotocol/assets/images/icon-social-x.svg'
import { getRandomInt } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { InfoTooltip } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import { useInjectedWidgetParams } from 'entities/injectedWidget'
import { PiCaretDown, PiCaretUp, PiTrophyFill } from 'react-icons/pi'
import SVG from 'react-inlinesvg'

import { AMM_LOGOS } from 'legacy/components/AMMsLogo'
import { Order } from 'legacy/state/orders/actions'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { SurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { SolverCompetition } from 'common/types/soverCompetition'

import * as styledEl from './styled'

import { CHAIN_SPECIFIC_BENEFITS } from '../../constants'
import { getTwitterShareUrl, getTwitterShareUrlForBenefit } from '../../helpers'
import { OrderProgressBarStepName } from '../../types'
import { PrintedOrderReceipt } from '../PrintedOrderReceipt/PrintedOrderReceipt.pure'

// Temporary launch flag: let the printed receipt own the successful-completion surface.
const SHOW_POST_TRADE_EXTRAS_ON_SUCCESS = false

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
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
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
}: FinishedStepProps): ReactNode {
  const { t } = useLingui()
  const { disablePostTradeTips } = useInjectedWidgetParams()
  const [showAllSolvers, setShowAllSolvers] = useState(false)
  const cancellationFailed = stepName === 'cancellationFailed'
  const { showSurplus } = surplusData || {}
  const shouldShowSurplus = debugForceShowSurplus || showSurplus
  const showPostTradeExtras = SHOW_POST_TRADE_EXTRAS_ON_SUCCESS || stepName !== OrderProgressBarStepName.FINISHED

  const visibleSolvers = useMemo(() => {
    return showAllSolvers ? solvers : solvers?.slice(0, 3)
  }, [showAllSolvers, solvers])

  const { randomBenefit } = useMemo(() => {
    const benefits = CHAIN_SPECIFIC_BENEFITS[chainId]

    return {
      randomBenefit: t(benefits[getRandomInt(0, benefits.length - 1)]),
    }
  }, [chainId, t])

  const twitterUrl = useMemo(() => {
    return shouldShowSurplus ? getTwitterShareUrl(surplusData, order) : getTwitterShareUrlForBenefit(randomBenefit)
  }, [shouldShowSurplus, surplusData, order, randomBenefit])

  // If order is not set, return null
  if (!order) {
    return null
  }
  const solversLength = solvers?.length || 0

  return (
    <styledEl.FinishedStepContainer>
      {cancellationFailed && (
        <styledEl.CancellationFailedBanner>
          <b>
            <Trans>Cancellation failed</Trans>:
          </b>{' '}
          <Trans>The order was executed before it could be cancelled.</Trans>
        </styledEl.CancellationFailedBanner>
      )}

      <styledEl.ConclusionContent>
        <PrintedOrderReceipt
          order={order}
          chainId={chainId}
          receiverEnsName={receiverEnsName}
          surplusData={surplusData}
          winningSolver={solvers?.[0]}
        />

        {showPostTradeExtras && solvers && solversLength > 0 && (
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
              <tbody>
                {visibleSolvers?.map((solver, index) => (
                  <SolverRow key={`${solver.solver}-${index}`} solver={solver} index={index} solvers={solvers} />
                ))}
              </tbody>
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

      {showPostTradeExtras && children}
      {showPostTradeExtras && (!disablePostTradeTips || shouldShowSurplus) && (
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
          <span>
            <Trans>Share this</Trans> {shouldShowSurplus ? <Trans>win</Trans> : <Trans>tip</Trans>}!
          </span>
        </styledEl.ShareButton>
      )}
    </styledEl.FinishedStepContainer>
  )
}

function SolverRow({
  solver,
  index,
  solvers,
}: {
  solver: SolverCompetition
  index: number
  solvers: SolverCompetition[]
}): ReactNode {
  return (
    <styledEl.SolverTableRow isWinner={index === 0}>
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
