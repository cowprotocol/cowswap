import { atom, useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useTradePriceImpact } from 'modules/trade'
import { TradeWarning, TradeWarningType } from 'modules/trade/pure/TradeWarning'
import { TradeFormValidation, useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { useTradeQuote } from 'modules/tradeQuote'

const noImpactWarningAcceptedAtom = atom(false)

const NoImpactWarningMessage = (
  <div>
    <small>
      We are unable to calculate the price impact for this order.
      <br />
      <br />
      You may still move forward but{' '}
      <strong>please review carefully that the receive amounts are what you expect.</strong>
    </small>
  </div>
)

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useIsNoImpactWarningAccepted() {
  return useAtomValue(noImpactWarningAcceptedAtom)
}

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
    (primaryFormValidation === null || primaryFormValidation === TradeFormValidation.ApproveAndSwap) &&
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
          Price impact <strong>unknown</strong> - trade carefully
        </span>
      }
    />
  )
}
