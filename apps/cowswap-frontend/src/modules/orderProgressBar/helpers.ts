import { isSellOrder } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'

import { plural, t } from '@lingui/core/macro'

import { Order } from 'legacy/state/orders/actions'

import { SurplusData } from 'common/hooks/useGetSurplusFiatValue'
import { SolverCompetition } from 'common/types/soverCompetition'

export function getTwitterShareUrl(surplusData: SurplusData | undefined, order: Order | undefined): string {
  const surplusAmount = surplusData?.surplusAmount?.toSignificant() || '0'
  const surplusToken = surplusData?.surplusAmount?.currency.symbol || t`Unknown token`
  const orderKind = order?.kind || OrderKind.SELL

  const twitterText = getTwitterText(surplusAmount, surplusToken, orderKind)
  return `https://x.com/intent/tweet?text=${twitterText}`
}

export function getTwitterShareUrlForAuction(solvers: SolverCompetition[]): string {
  const solverCount = solvers.length
  const winnerName = solvers[0]?.displayName?.trim()
  const twitterText = encodeURIComponent(
    solverCount >= 2 && winnerName
      ? t`${plural(solverCount, {
          one: '# solver competed for my swap on @CoWSwap.',
          few: '# solvers competed for my swap on @CoWSwap.',
          many: '# solvers competed for my swap on @CoWSwap.',
          other: '# solvers competed for my swap on @CoWSwap.',
        })} ${winnerName} won 🐮⚡\n\nStart swapping on swap.cow.fi`
      : t`Solvers compete for every swap on @CoWSwap 🐮⚡\n\nStart swapping on swap.cow.fi`,
  )
  return `https://x.com/intent/tweet?text=${twitterText}`
}

export function getTwitterShareUrlForBenefit(benefit: string): string {
  const twitterText = getTwitterTextForBenefit(benefit)
  return `https://x.com/intent/tweet?text=${twitterText}`
}

export function getTwitterShareUrlForWaitAndSave(gainAmount: string, tokenSymbol: string): string {
  const gain = `${gainAmount} ${tokenSymbol}`
  const twitterText = encodeURIComponent(
    t`Hey, I just got an extra ${gain} with Wait & save on @CoWSwap! 🐮💸\n\nStart swapping on swap.cow.fi`,
  )
  return `https://x.com/intent/tweet?text=${twitterText}`
}

export function getTwitterText(surplusAmount: string, surplusToken: string, orderKind: OrderKind): string {
  const surplus = `${surplusAmount} ${surplusToken}`
  return encodeURIComponent(
    isSellOrder(orderKind)
      ? t`Hey, I just got an extra ${surplus} on @CoWSwap! 🐮💸\n\nStart swapping on swap.cow.fi`
      : t`Hey, I just saved an extra ${surplus} on @CoWSwap! 🐮💸\n\nStart swapping on swap.cow.fi`,
  )
}

export function getTwitterTextForBenefit(benefit: string): string {
  return encodeURIComponent(t`Did you know? ${benefit}\n\nStart swapping on swap.cow.fi #CoWSwap @CoWSwap 🐮`)
}

export function truncateWithEllipsis(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}
