import { UI } from '@cowprotocol/ui'

import { Text } from 'rebass'
import styled from 'styled-components/macro'

export const BalanceText = styled(Text)`
  font-weight: 500;
  font-size: 13px;
  padding: 0 6px 0 12px;
  min-width: initial;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    overflow: hidden;
    max-width: 100px;
    text-overflow: ellipsis;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

export const Wrapper = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  white-space: nowrap;
  cursor: pointer;
  background-color: ${({ theme, active }) => (!active ? theme.bg1 : theme.bg1)};
  border-radius: 21px;
  border: 2px solid transparent;
  transition: border var(${UI.ANIMATION_DURATION}) ease-in-out;
  pointer-events: auto;
  width: auto;

  :focus {
    border: 1px solid blue;
  }

  &:hover {
    border: 2px solid var(${UI.COLOR_TEXT_OPACITY_25});
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    height: 100%;
  `}

  ${({ theme }) =>
    theme.isInjectedWidgetMode &&
    `
    background-color: transparent;
    margin: 0 20px 0 auto!important;
    border: 0!important;
  `}
`
