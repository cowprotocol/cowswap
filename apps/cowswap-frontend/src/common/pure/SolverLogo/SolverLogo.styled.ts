import { font, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const LogoFrame = styled.span<{ $size: number }>`
  ${font('FONT_OVERLINE', 'semibold')}
  position: relative;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  overflow: hidden;
  border-radius: 50%;
  background: var(${UI.COLOR_WHITE});
  color: var(${UI.COLOR_BLACK_OPACITY_70});

  // Chrome computes a 0.5px outline to 1px, and an inset shadow on this frame would paint under the image.
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: inset 0 0 0 0.5px color-mix(in srgb, var(${UI.COLOR_TEXT}) 24%, transparent);
  }
`

export const LogoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`
