import { useAtom } from 'jotai'
import { ReactNode, useEffect } from 'react'

import { Trans } from '@lingui/react/macro'

import { TradeWarning } from 'modules/trade/pure/TradeWarning'
import { TradeWarningType } from 'modules/trade/pure/TradeWarning/constants'

import { noImpactWarningAcceptedAtom, useShouldShowNoImpactWarning } from './useIsNoImpactWarningAccepted'

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
  const showPriceImpactWarning = useShouldShowNoImpactWarning()

  const acceptCallback = (accepted: boolean): void => setIsAccepted(accepted)

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
