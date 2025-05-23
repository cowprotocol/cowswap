import { Color, Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { TabTheme } from './Tabs'

import { ButtonBase } from '../Button'

export const TabIconWrapper = styled.div`
  svg {
    margin-right: 0.6rem;
  }
`

export type TabItemWrapperProps = {
  isActive: boolean
  readonly tabTheme: TabTheme
}

export const TabItemBase = styled(ButtonBase)`
  display: flex;
  flex: 1 1 0;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 0;
  height: var(--height-button-default);
  text-align: center;
  appearance: none;
  background: ${Color.explorer_bg2};
`

export const TabItemWrapper = styled(TabItemBase)<TabItemWrapperProps>`
  background: ${({ isActive }): string => (isActive ? Color.explorer_bg2 : 'transparent')};
  color: ${({ isActive }): string => (isActive ? Color.explorer_textPrimary : Color.explorer_textSecondary2)};
  font-weight: ${({ tabTheme }): string => tabTheme.fontWeight};
  font-size: ${({ tabTheme }): string => tabTheme.fontSize};
  letter-spacing: ${({ tabTheme }): string => tabTheme.letterSpacing};
  border-bottom: ${({ isActive, tabTheme }): string =>
    `${tabTheme.indicatorTabSize}rem solid ${isActive ? Color.explorer_orange1 : 'transparent'}`};

  ${({ tabTheme }): string => {
    const radius = !tabTheme.borderRadius ? '0' : 'var(--border-radius-default)'
    return `
      &:first-of-type {
        border-top-left-radius: ${radius};
        border-bottom-left-radius: ${radius};
      }

      &:last-of-type {
        border-top-right-radius: ${radius};
        border-bottom-right-radius: ${radius};
      }
    `
  }}

  &:last-of-type {
    ${({ isActive }): string | false => isActive && `background: ${Color.explorer_bg2}`};
  }

  &:hover {
    background: ${Color.explorer_bg2};
  }
`

export const Wrapper = styled.div`
  width: 100%;
  max-width: 100%;
`

export const TabList = styled.div`
  position: sticky;
  top: 0;
  background: ${Color.explorer_bg};
  z-index: 2;
  max-width: 100%;
  display: flex;
  justify-content: flex-start;
  border-bottom: 0.1rem solid ${Color.explorer_border};
  box-sizing: border-box;
  flex-flow: row wrap;

  > button {
    flex: 0 0 auto;
    min-width: 13rem;
    padding: 1rem 2rem;
    line-height: 2;
    height: auto;

    ${Media.upToSmall()} {
      flex: 1 1 auto;
    }
  }
`
