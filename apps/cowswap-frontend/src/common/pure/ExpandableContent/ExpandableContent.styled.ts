import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export type ExpandableContentVariant = 'default' | 'bordered'

export const ExpandableContent = styled.div<{ $variant: ExpandableContentVariant }>`
  overflow: hidden;
  opacity: 0;
  height: 0;
  transition:
    height var(${UI.ANIMATION_DURATION_SLOW}) ease,
    opacity var(${UI.ANIMATION_DURATION}) ease;

  &[aria-hidden='false'] {
    opacity: 1;
  }

  ${({ $variant }) =>
    $variant === 'bordered'
      ? `
    &[aria-hidden='false'] {
      border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
      border-radius: 12px;
    }
  `
      : ''}
`
