import styled from 'styled-components/macro'

import { ConfirmDetailsItem } from 'modules/trade'

import { AnimatedEllipsis } from '../../../../styles'

const Wrapper = styled.div`
  white-space: nowrap;
`

export function PreparingBridgingContent() {
  return (
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
  )
}
