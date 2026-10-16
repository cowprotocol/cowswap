import { font, fontFamilyBrand, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  padding: 24px;
  color: var(${UI.COLOR_BLUE_900_PRIMARY});
`

export const Timer = styled.div`
  ${fontFamilyBrand}
  font-size: 68px;
  font-weight: bold;
  line-height: 1;
  font-variant-numeric: slashed-zero;
  letter-spacing: -3px;
  color: var(${UI.COLOR_BLUE_900_PRIMARY});
`

export const Caption = styled.div`
  ${font('FONT_MEDIUM', 500)}
  text-align: center;
  color: var(${UI.COLOR_BLUE_900_PRIMARY});
`
