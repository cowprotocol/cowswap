import { MenuButton, MenuList } from '@reach/menu-button'
import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

import { blankButtonMixin } from '../commonElements'

export const Wrapper = styled.div<{ $enabled: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 20px;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid var(${UI.COLOR_GREY});
  background-color: ${({ $enabled, theme }) => ($enabled ? transparentize(0.8, theme.bg2) : 'transparent')};
`

export const SettingsButton = styled(MenuButton)`
  ${blankButtonMixin}

  > svg {
    color: ${`var(${UI.COLOR_TEXT})`};

    &:hover {
      color: var(${UI.COLOR_SECONDARY_TEXT});
    }
  }
`

export const SettingsContainer = styled(MenuList)`
  position: relative;
  z-index: 12;
  background: var(${UI.COLOR_PAPER});
  padding: 10px;
  border-radius: 10px;
  border: 1px solid var(${UI.COLOR_GREY});
`

export const SettingsAction = styled.div`
  color: var(${UI.COLOR_LINK});
  cursor: pointer;
  padding: 5px;
  box-sizing: content-box;

  > a {
    text-decoration: none;
    color: inherit;
  }

  &:hover {
    text-decoration: underline;
  }
`

export const ListVersion = styled.div`
  color: var(${UI.COLOR_TEXT_INACTIVE});
  border-bottom: 1px solid var(${UI.COLOR_GREY});
  padding: 0 5px 10px 5px;
`
