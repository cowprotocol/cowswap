import { useAtom } from 'jotai'
import { useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { TradeWarning } from 'modules/trade/pure/TradeWarning'
import { TradeWarningType } from 'modules/trade/pure/TradeWarning/constants'
import { TradeFormValidation, useGetTradeFormValidation } from 'modules/tradeFormValidation'
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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function NoImpactWarning(props: NoImpactWarningProps) {
  const { withoutAccepting, className } = props

  const [isAccepted, setIsAccepted] = useAtom(noImpactWarningAcceptedAtom)

  const { account } = useWalletInfo()
  const priceImpactParams = useTradePriceImpact()
  const primaryFormValidation = useGetTradeFormValidation()
  const tradeQuote = useTradeQuote()

  const canTrade =
    (primaryFormValidation === null || primaryFormValidation === TradeFormValidation.ApproveAndSwapInBundle) &&
    !tradeQuote.error

  const showPriceImpactWarning = canTrade && !!account && !priceImpactParams.loading && !priceImpactParams.priceImpact

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const acceptCallback = () => setIsAccepted((state) => !state)

  useEffect(() => {
    setIsAccepted(!showPriceImpactWarning)
  }, [showPriceImpactWarning, setIsAccepted])

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
