import * as styledEl from './styled'

import { BridgingStatusHeader, BridgingStatusHeaderProps } from '../BridgingStatusHeader'

interface BridgingInProgressStepProps extends BridgingStatusHeaderProps {}

export function BridgingStep({ stepName, sellToken, buyToken }: BridgingInProgressStepProps) {
  return (
    <styledEl.ProgressContainer>
      <BridgingStatusHeader stepName={stepName} sellToken={sellToken} buyToken={buyToken} />
    </styledEl.ProgressContainer>
  )
}
