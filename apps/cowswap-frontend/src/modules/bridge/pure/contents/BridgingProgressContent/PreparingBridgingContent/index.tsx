import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'
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
      {targetRecipient && <RecipientDetailsItem recipient={targetRecipient} chainId={targetCurrency.chainId} />}
      <ConfirmDetailsItem
        withTimelineDot
        label={
          <Wrapper>
            <Trans>
              Loading bridge data <AnimatedEllipsis isVisible />
            </Trans>
          </Wrapper>
        }
      >
        <span></span>
      </ConfirmDetailsItem>
    </>
  )
}
