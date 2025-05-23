import styled from 'styled-components/macro'

import { ProgressDetails, StopStatusEnum, SwapAndBridgeContext } from 'modules/bridge'

import * as styledEl from './styled'

import { BridgingFlowStep } from '../../types'
import { BridgingStatusHeader } from '../BridgingStatusHeader'

const statusesMap: Record<StopStatusEnum, BridgingFlowStep> = {
  [StopStatusEnum.DONE]: 'bridgingFinished',
  [StopStatusEnum.DEFAULT]: 'bridgingInProgress',
  [StopStatusEnum.PENDING]: 'bridgingInProgress',
  [StopStatusEnum.FAILED]: 'bridgingFailed',
  [StopStatusEnum.REFUND_COMPLETE]: 'refundCompleted',
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
          sellToken={context.quoteBridgeContext.sellAmount.currency}
          buyToken={context.quoteBridgeContext.buyAmount.currency}
        />
        <ProgressDetailsStyled context={context} />
      </Wrapper>
    </styledEl.ProgressContainer>
  )
}
