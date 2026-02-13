import { ExternalLink, Media, UI } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import { ArrowDownCircle } from 'react-feather'
import styled from 'styled-components/macro'

import { ROW_HEIGHT_DESKTOP, ROW_HEIGHT_MOBILE, TAP_DESKTOP, TAP_MOBILE } from './NetworksList.const'

export const ActiveRowWrapper = styled.div`
  background-color: var(${UI.COLOR_PAPER_DARKER});
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  padding: 8px;
  margin: 12px 0;

  ${Media.upToMedium()} {
    padding: 0;
    order: -1;
  }
`

const NETWORK_ICON_SIZE_DESKTOP = '24px'
const NETWORK_ICON_SIZE_MOBILE = '32px'

export const ActiveRowLinkList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 0 0;

  ${Media.upToMedium()} {
    padding: 0 0 0 8px;
  }
`

export const ActiveRowLink = styled(ExternalLink)`
  align-items: center;
  color: inherit;
  display: flex;
  flex-direction: row;
  font-size: 14px;
  font-weight: 400;
  justify-content: space-between;
  padding: 0;
  text-decoration: none;
  width: 100%;
  border-radius: 8px;

  &:hover {
    background: ${({ theme }) => transparentize(theme.text, 0.9)};
    text-decoration: none;
  }

  &:active {
    background: ${({ theme }) => transparentize(theme.text, 0.85)};
  }

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_PRIMARY});
    outline-offset: 2px;
    border-radius: 8px;
  }

  ${Media.MediumAndUp()} {
    min-height: ${ROW_HEIGHT_DESKTOP};
    height: ${ROW_HEIGHT_DESKTOP};
    padding: 0 0 0 8px;
  }

  ${Media.upToMedium()} {
    min-height: ${ROW_HEIGHT_MOBILE};
    height: ${ROW_HEIGHT_MOBILE};
    padding: 0 6px;
  }
`

export const ActiveRowLinkLabel = styled.span`
  flex: 1 1 auto;
  min-width: 0;
`

export const LinkOutIconWrapper = styled.span`
  align-items: center;
  display: grid;
  flex-shrink: 0;
  justify-content: center;
  min-height: ${TAP_DESKTOP};
  min-width: ${TAP_DESKTOP};

  ${Media.upToMedium()} {
    min-height: ${TAP_MOBILE};
    min-width: ${TAP_MOBILE};
  }
`
export const LinkOutCircle = styled(ArrowDownCircle)`
  transform: rotate(230deg);
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`
export const FlyoutRow = styled.button<{ active: boolean }>`
  align-items: center;
  background-color: ${({ active, theme }) => (active ? theme.bg2 : 'transparent')};
  border-radius: 8px;
  border: 0;
  cursor: pointer;
  display: flex;
  font-weight: 400;
  justify-content: space-between;
  padding: 6px 8px;
  text-align: left;
  width: 100%;
  color: ${({ active, theme }) => (active ? theme.white : `var(${UI.COLOR_TEXT})`)};
  appearance: none;

  &:hover {
    color: ${({ theme, active }) => !active && theme.text1};
    background: ${({ theme, active }) => !active && transparentize(theme.text, 0.9)};
  }

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_PRIMARY});
    outline-offset: 2px;
  }

  ${Media.MediumAndUp()} {
    min-height: ${ROW_HEIGHT_DESKTOP};
    height: ${ROW_HEIGHT_DESKTOP};
  }

  ${Media.upToMedium()} {
    min-height: ${ROW_HEIGHT_MOBILE};
    height: ${ROW_HEIGHT_MOBILE};
  }

  transition: background 0.13s ease-in-out;
`
export const FlyoutRowActiveIndicator = styled.div<{ active: boolean }>`
  background-color: ${({ active, theme }) => (active ? theme.green1 : '#a7a7a7')};
  border-radius: 50%;
  height: 9px;
  width: 9px;
`
export const Logo = styled.img`
  --size: ${NETWORK_ICON_SIZE_DESKTOP};
  width: var(--size);
  height: var(--size);
  margin-right: 8px;

  ${Media.upToMedium()} {
    --size: ${NETWORK_ICON_SIZE_MOBILE};
  }
`
export const NetworkLabel = styled.div<{ color: string }>`
  flex: 1 1 auto;
  margin: 0 auto 0 8px;
  font-size: 15px;

  ${Media.upToMedium()} {
    font-weight: 500;
    font-size: 16px;
  }
`
