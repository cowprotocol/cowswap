import { ButtonOutlined, Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { TransactionInnerDetail } from 'common/pure/TransactionInnerDetail'

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

export const ButtonSecondary = styled(ButtonOutlined)`
  width: 100%;
  min-height: 46px;
  font-size: 16px;
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

  ${Media.upToSmall()} {
    flex-direction: column;
  }
`

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: var(${UI.COLOR_PAPER});
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  padding: 16px 0;
  z-index: 20;

  ${Media.upToSmall()} {
    border-radius: 0;
  }
`

export const ActionsWrapper = styled.div`
  display: flex;
  gap: 16px;
  width: auto;
  align-items: center;
  justify-content: center;
  line-height: 1;
  flex-flow: row wrap;
  font-size: 14px;

  > a,
  > button {
    transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;
    text-decoration: none;
    color: var(${UI.COLOR_TEXT_OPACITY_70});

    &:hover {
      text-decoration: underline;
      color: var(${UI.COLOR_TEXT});
    }
  }
`

export const Section = styled.div`
  padding: 0 16px 16px;
  align-items: center;
  justify-content: flex-start;
  display: flex;
  flex-flow: row wrap;
  transition: height 1s ease-in-out;

  ${Media.upToSmall()} {
    padding: 0 16px 78px;
  }

  ${TransactionInnerDetail} {
    margin: 0 auto;
    width: 100%;
    align-items: center;
  }
`

export const Wrapper = styled.div`
  width: 100%;
  padding: 0;
  display: flex;
  flex-flow: column nowrap;
  overflow-y: auto; // fallback for 'overlay'
  overflow-y: overlay;
  height: inherit;
  transition: height 1s ease-in-out;
  ${({ theme }) => theme.colorScrollbar};
`

export const Title = styled.div`
  font-size: 28px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0 0 16px;
  width: 100%;
  text-align: center;
`
