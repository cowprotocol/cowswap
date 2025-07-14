import { ReactNode } from 'react'

import styled from 'styled-components/macro'

import { ConfirmDetailsItem } from 'modules/trade'

import { AnimatedEllipsis } from '../../../../styles'
import { SwapAndBridgeOverview } from '../../../../types'
import { RecipientDetailsItem } from '../../../RecipientDetailsItem'

const Wrapper = styled.div`
  white-space: nowrap;
`

interface PreparingBridgingContentProps {
  overview: SwapAndBridgeOverview
}

export function PreparingBridgingContent({
  overview: { targetRecipient, targetCurrency },
}: PreparingBridgingContentProps): ReactNode {
  return (
    <>
      <ConfirmDetailsItem
        withTimelineDot
        label={
          <Wrapper>
            Preparing <AnimatedEllipsis isVisible />
          </Wrapper>
        }
      >
        <span></span>
      </ConfirmDetailsItem>
      {targetRecipient && <RecipientDetailsItem recipient={targetRecipient} chainId={targetCurrency.chainId} />}
    </>
  )
}
