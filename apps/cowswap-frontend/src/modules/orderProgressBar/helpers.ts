import { isSellOrder } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'

import { Order } from 'legacy/state/orders/actions'

import { SurplusData } from 'common/hooks/useGetSurplusFiatValue'

export function truncateWithEllipsis(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getTwitterText(surplusAmount: string, surplusToken: string, orderKind: OrderKind) {
  const actionWord = isSellOrder(orderKind) ? 'got' : 'saved'
  const surplus = `${surplusAmount} ${surplusToken}`
  return encodeURIComponent(
    `Hey, I just ${actionWord} an extra ${surplus} on @CoWSwap! 🐮💸\n\nStart swapping on swap.cow.fi`,
  )
}

export function getTwitterShareUrl(surplusData: SurplusData | undefined, order: Order | undefined): string {
  const surplusAmount = surplusData?.surplusAmount?.toSignificant() || '0'
  const surplusToken = surplusData?.surplusAmount?.currency.symbol || 'Unknown token'
  const orderKind = order?.kind || OrderKind.SELL

  const twitterText = getTwitterText(surplusAmount, surplusToken, orderKind)
  return `https://x.com/intent/tweet?text=${twitterText}`
}

export function getTwitterTextForBenefit(benefit: string): string {
  return encodeURIComponent(`Did you know? ${benefit}\n\nStart swapping on swap.cow.fi #CoWSwap @CoWSwap 🐮`)
}

export function getTwitterShareUrlForBenefit(benefit: string): string {
  const twitterText = getTwitterTextForBenefit(benefit)
  return `https://x.com/intent/tweet?text=${twitterText}`
}

export function getSurplusText(isSell: boolean | undefined, isCustomRecipient: boolean | undefined): string {
  if (isSell) {
    return isCustomRecipient ? 'including an extra ' : 'and got an extra '
  }
  return 'and saved '
}
