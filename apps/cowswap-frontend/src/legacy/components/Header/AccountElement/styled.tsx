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

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  width: 100%;
  flex-direction: row;
`

export const LeftGroup = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  background: ${({ active }) => (active ? `var(${UI.COLOR_PAPER_DARKER})` : `var(${UI.COLOR_PAPER})`)};
  border-radius: 28px;
  border: none;
  transition: border var(${UI.ANIMATION_DURATION}) ease-in-out;
  pointer-events: auto;
  margin: 0px 20px 0px auto;
`
