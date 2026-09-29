import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ExpandableContent = styled.div`
  overflow: hidden;
  opacity: 0;
  height: 0;
  transition:
    height var(${UI.ANIMATION_DURATION_SLOW}) ease,
    opacity var(${UI.ANIMATION_DURATION}) ease;

  &[aria-hidden='false'] {
    opacity: 1;
  }
`
