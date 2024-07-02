import { Media, UI } from '@cowprotocol/ui'

import { Text } from 'rebass'
import styled from 'styled-components/macro'

export const BalanceText = styled(Text)`
  font-weight: 500;
  font-size: 13px;
  padding: 0 9px 0 11px;
  min-width: initial;
  color: var(${UI.COLOR_TEXT_OPACITY_70});

  ${Media.upToExtraSmall()} {
    display: none;
  }

  ${Media.upToMedium()} {
    overflow: hidden;
    max-width: 100px;
    text-overflow: ellipsis;
  }

  ${Media.upToSmall()} {
    display: none;
  }
`

export const Wrapper = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  white-space: nowrap;
  cursor: pointer;
  background: ${({ active }) => (active ? `var(${UI.COLOR_PAPER_DARKER})` : `var(${UI.COLOR_PAPER})`)};
  border-radius: 28px;
  border: none;
  transition: border var(${UI.ANIMATION_DURATION}) ease-in-out;
  pointer-events: auto;
  width: auto;
  height: 100%;

  ${Media.upToMedium()} {
    height: 100%;
  }

  ${({ theme }) =>
    theme.isInjectedWidgetMode &&
    `
    background-color: transparent;
    margin: 0 20px 0 auto!important;
    border: 0!important;
  `}
`
