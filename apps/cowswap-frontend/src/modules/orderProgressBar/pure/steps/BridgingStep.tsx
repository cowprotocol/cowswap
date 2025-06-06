import React from 'react'

import { Confetti } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { ProgressDetails, SwapAndBridgeContext, SwapAndBridgeStatus } from 'modules/bridge'

import type { SurplusData } from 'common/hooks/useGetSurplusFiatValue'

import * as styledEl from './styled'

import { useWithConfetti } from '../../hooks/useWithConfetti'
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
  surplusData?: SurplusData
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function BridgingStep({ context, surplusData }: BridgingInProgressStepProps) {
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
