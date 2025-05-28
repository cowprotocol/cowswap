import styled from 'styled-components/macro'

import { ProgressDetails, SwapAndBridgeContext, SwapAndBridgeStatus } from 'modules/bridge'

import * as styledEl from './styled'

import { BridgingFlowStep } from '../../types'
import { BridgingStatusHeader } from '../BridgingStatusHeader'

const statusesMap: Record<SwapAndBridgeStatus, BridgingFlowStep> = {
  [SwapAndBridgeStatus.DONE]: 'bridgingFinished',
  [SwapAndBridgeStatus.DEFAULT]: 'bridgingInProgress',
  [SwapAndBridgeStatus.PENDING]: 'bridgingInProgress',
  [SwapAndBridgeStatus.FAILED]: 'bridgingFailed',
  [SwapAndBridgeStatus.REFUND_COMPLETE]: 'refundCompleted',
}

const Wrapper = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: column;
  width: 100%;
`

const ProgressDetailsStyled = styled(ProgressDetails)`
  border-radius: 16px;
  background: #f2f2f2;
  padding: 16px;
`

interface BridgingInProgressStepProps {
  context: SwapAndBridgeContext
}

export function BridgingStep({ context }: BridgingInProgressStepProps) {
  return (
    <styledEl.ProgressContainer>
      <Wrapper>
        <BridgingStatusHeader
          stepName={statusesMap[context.bridgingStatus]}
          sellToken={context.overview.sourceAmounts.sellAmount.currency}
          buyToken={context.overview.sourceAmounts.buyAmount.currency}
        />
        <ProgressDetailsStyled context={context} />
      </Wrapper>
    </styledEl.ProgressContainer>
  )
}
