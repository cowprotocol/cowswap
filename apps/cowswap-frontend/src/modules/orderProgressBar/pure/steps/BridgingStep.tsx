import { ReactNode } from 'react'

import { Confetti } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { ProgressDetails, SwapAndBridgeContext, SwapAndBridgeStatus } from 'modules/bridge'

import type { SurplusData } from 'common/hooks/useGetSurplusFiatValue'

import * as styledEl from './styled'

import { OrderProgressBarStepName } from '../../constants'
import { useWithConfetti } from '../../hooks/useWithConfetti'
import { BridgingFlowStep } from '../../types'
import { BridgingStatusHeader } from '../BridgingStatusHeader'

const statusesMap: Record<SwapAndBridgeStatus, BridgingFlowStep> = {
  [SwapAndBridgeStatus.DONE]: OrderProgressBarStepName.BRIDGING_FINISHED,
  [SwapAndBridgeStatus.DEFAULT]: OrderProgressBarStepName.BRIDGING_IN_PROGRESS,
  [SwapAndBridgeStatus.PENDING]: OrderProgressBarStepName.BRIDGING_IN_PROGRESS,
  [SwapAndBridgeStatus.FAILED]: OrderProgressBarStepName.BRIDGING_FAILED,
  [SwapAndBridgeStatus.REFUND_COMPLETE]: OrderProgressBarStepName.REFUND_COMPLETED,
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
  surplusData?: SurplusData
}

export function BridgingStep({ context, surplusData }: BridgingInProgressStepProps): ReactNode {
  const showConfetti = useWithConfetti({
    isFinished: context.bridgingStatus === SwapAndBridgeStatus.DONE,
    surplusData,
  })

  return (
    <styledEl.ProgressContainer>
      {showConfetti && <Confetti start={true} />}
      <Wrapper>
        <BridgingStatusHeader
          stepName={statusesMap[context.bridgingStatus]}
          sellToken={context.overview.sourceAmounts.sellAmount.currency}
          buyToken={context.overview.targetCurrency}
        />
        <ProgressDetailsStyled context={context} />
      </Wrapper>
    </styledEl.ProgressContainer>
  )
}
