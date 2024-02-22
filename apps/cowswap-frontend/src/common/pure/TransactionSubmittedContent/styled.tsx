import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { CloseIcon } from 'legacy/theme'

export const ButtonCustom = styled.button<{ cowGame?: boolean }>`
  display: flex;
  flex: 1 1 auto;
  align-self: center;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  min-height: 52px;
  border: 0;
  color: ${({ cowGame }) => (cowGame ? `var(${UI.COLOR_INFO_TEXT})` : `var(${UI.COLOR_BUTTON_TEXT})`)};
  background: ${({ cowGame }) => (cowGame ? `var(${UI.COLOR_INFO_BG})` : `var(${UI.COLOR_PRIMARY})`)};
  outline: 0;
  padding: 8px 16px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
  cursor: pointer;
  width: 100%;

  &:hover {
    color: ${({ cowGame }) => (cowGame ? `var(${UI.COLOR_PAPER})` : `var(${UI.COLOR_BUTTON_TEXT})`)};
    background: ${({ cowGame }) => (cowGame ? `var(${UI.COLOR_INFO_TEXT})` : `var(${UI.COLOR_PRIMARY_DARKER})`)};
  }

  > a {
    display: flex;
    align-items: center;
    color: inherit;
    text-decoration: none;
  }
`

export const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column wrap;
  gap: 14px;
  padding: 0;
  margin: 16px auto 0;
  width: 100%;

  > a {
    width: 100%;
    text-decoration: none;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
  `}
`

export const CloseIconWrapper = styled(CloseIcon)<{ margin?: string }>`
  display: flex;
  margin: ${({ margin }) => margin ?? '0 0 0 auto'};
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  height: 28px;
  width: 28px;

  &:hover {
    opacity: 1;
  }
`

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  padding: 16px 0;
  z-index: 20;
`

export const Section = styled.div`
  padding: 0 16px 16px;
  align-items: center;
  justify-content: flex-start;
  display: flex;
  flex-flow: column wrap;
`

export const StyledIcon = styled.img`
  height: auto;
  width: 20px;
  max-height: 100%;
  margin: 0 10px 0 0;
`

export const Wrapper = styled.div`
  width: 100%;
  padding: 0;
  display: flex;
  flex-flow: column nowrap;
  overflow-y: auto; // fallback for 'overlay'
  overflow-y: overlay;
  height: inherit;
  ${({ theme }) => theme.colorScrollbar};
`
