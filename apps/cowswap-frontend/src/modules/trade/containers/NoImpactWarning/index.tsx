import { useAtom } from 'jotai'
import { ReactNode, useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { TradeWarning } from 'modules/trade/pure/TradeWarning'
import { TradeWarningType } from 'modules/trade/pure/TradeWarning/constants'
import { ACTIVE_VALIDATION_CASES, useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { useTradeQuote } from 'modules/tradeQuote'

import { noImpactWarningAcceptedAtom } from './useIsNoImpactWarningAccepted'

import { useTradePriceImpact } from '../../hooks/useTradePriceImpact'

const NoImpactWarningMessage = (
  <div>
    <small>
      <Trans>
        We are unable to calculate the price impact for this order.
        <br />
        <br />
        You may still move forward but{' '}
        <strong>please review carefully that the receive amounts are what you expect.</strong>
      </Trans>
    </small>
  </div>
)

export interface NoImpactWarningProps {
  withoutAccepting?: boolean
  className?: string
}

export function NoImpactWarning(props: NoImpactWarningProps): ReactNode {
  const { withoutAccepting, className } = props

  const [isAccepted, setIsAccepted] = useAtom(noImpactWarningAcceptedAtom)

  const { account } = useWalletInfo()
  const priceImpactParams = useTradePriceImpact()
  const primaryFormValidation = useGetTradeFormValidation()
  const tradeQuote = useTradeQuote()

  const isTradeActive =
    !!account &&
    !tradeQuote.error &&
    (primaryFormValidation === null || ACTIVE_VALIDATION_CASES.includes(primaryFormValidation))
  const isPriceImpactUnknown = !priceImpactParams.loading && !priceImpactParams.priceImpact

  // Loading blocks the trade like an unknown impact does, but stays hidden so a requote doesn't blink the warning
  const requiresAcceptance = isTradeActive && (priceImpactParams.loading || !priceImpactParams.priceImpact)
  const showPriceImpactWarning = isTradeActive && isPriceImpactUnknown

  const acceptCallback = (accepted: boolean): void => setIsAccepted(accepted)

  useEffect(() => {
    setIsAccepted(!requiresAcceptance)
  }, [requiresAcceptance, setIsAccepted])

  if (!showPriceImpactWarning) return null

  return (
    <TradeWarning
      type={TradeWarningType.LOW}
      className={className}
      withoutAccepting={withoutAccepting}
      isAccepted={isAccepted}
      tooltipContent={NoImpactWarningMessage}
      acceptCallback={acceptCallback}
      text={
        <span>
          <Trans>
            Price impact <strong>unknown</strong> - trade carefully
          </Trans>
        </span>
      }
    />
  )
}
