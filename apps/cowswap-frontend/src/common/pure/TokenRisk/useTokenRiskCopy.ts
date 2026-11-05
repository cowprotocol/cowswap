import { useCallback } from 'react'

import { TokenWarning } from '@cowprotocol/tokens'

import { useLingui } from '@lingui/react/macro'

export interface TokenRiskCopy {
  title: string
  description: string | undefined
}

/**
 * The single sentence the import checkbox asks a person to confirm.
 *
 * One checkbox has to name every serious risk, so the issuer's powers are spelled out per
 * combination rather than joined from fragments: "freeze", "take" and " or " are not sentences a
 * translator can place.
 */
export function useAcknowledgementSentence(symbol: string): (seriousCodes: string[]) => string {
  const { t } = useLingui()

  return useCallback(
    (seriousCodes: string[]): string => {
      const canFreeze = seriousCodes.includes('FREEZE')
      const canTake = seriousCodes.includes('PERM_DEL')

      if (canFreeze && canTake) {
        return t`I understand the issuer can freeze or take my ${symbol}, and I may not be able to sell it.`
      }

      if (canFreeze) {
        return t`I understand the issuer can freeze my ${symbol}, and I may not be able to sell it.`
      }

      if (canTake) {
        return t`I understand the issuer can take my ${symbol}, and I may not be able to sell it.`
      }

      return t`I understand ${symbol} carries serious risks and I may not be able to sell it.`
    },
    [t, symbol],
  )
}

/**
 * Plain-words copy for a published warning code.
 *
 * The title is the consequence for the holder and the description says why it matters, which is
 * what the published `message` cannot be: it is Jupiter's wording for the token, not for the
 * person holding it. A code without an entry here keeps that message as its title, so a code
 * added upstream still renders.
 */
export function useTokenRiskCopy(symbol: string): (warning: TokenWarning) => TokenRiskCopy {
  const { t } = useLingui()

  return useCallback(
    (warning: TokenWarning): TokenRiskCopy => {
      switch (warning.code) {
        case 'FREEZE':
          return {
            title: t`Issuer can freeze your tokens`,
            description: t`The issuer can freeze any holder's tokens. If they do, you can't sell or move ${symbol}.`,
          }
        case 'PERM_DEL':
          return {
            title: t`Issuer can take your tokens`,
            description: t`The issuer can move ${symbol} out of your wallet at any time, without asking you.`,
          }
        case 'NO_SELL':
          return {
            title: t`${symbol} may not be sellable`,
            description: t`No route to sell ${symbol} was found. You may not be able to get out of this position.`,
          }
        case 'MINT':
          return {
            title: t`Issuer can mint more tokens`,
            description: t`The issuer can create more tokens at any time, which can dilute your share.`,
          }
        case 'CONCENTRATED':
          return {
            title: t`A few wallets own most of the supply`,
            description: t`A few large holders selling could move the price sharply.`,
          }
        case 'LOW_LIQ':
          return {
            title: t`Low liquidity`,
            description: t`Trades can move the price sharply, and a large order may not fill.`,
          }
        case 'LOW_ORGANIC':
          return {
            title: t`Low organic activity`,
            description: t`Most recent trading looks automated.`,
          }
        case 'LOW_VOLUME':
          return {
            title: t`Very low trading activity`,
            description: t`Almost nothing has traded recently, so the price may not mean much.`,
          }
        default:
          return { title: warning.message, description: undefined }
      }
    },
    [t, symbol],
  )
}
