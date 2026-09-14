import styled from 'styled-components/macro'

import { UI } from '../../../enum'
import { font } from '../../../utils/font'
import { ButtonOutlined, ButtonPrimary } from '../../Button'

export const Footer = styled.div<{ $inline?: boolean }>`
  width: 100%;
  padding: ${({ $inline }) => ($inline ? '8px 0 0' : '8px 10px 10px')};
`

export const TwoButtonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
`

export const SecondaryButton = styled(ButtonOutlined)`
  ${font('FONT_MEDIUM', 'semibold')}
  width: 100%;
  min-height: 48px;
  color: var(${UI.COLOR_TEXT});

  &:hover:not(:disabled) {
    background: var(${UI.COLOR_PRIMARY});
    color: var(${UI.COLOR_BUTTON_TEXT});
    border: 1px solid var(${UI.COLOR_PRIMARY});
  }
`

export const PrimaryButton = styled(ButtonPrimary)`
  ${font('FONT_MEDIUM', 'semibold')}
  width: 100%;
  min-height: 48px;
`
