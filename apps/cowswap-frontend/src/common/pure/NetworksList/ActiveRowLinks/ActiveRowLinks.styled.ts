import { Media } from '@cowprotocol/ui'
import { ExternalLink } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import { ArrowDownCircle } from 'react-feather'
import styled from 'styled-components/macro'

import { ROW_HEIGHT_DESKTOP, ROW_HEIGHT_MOBILE, TAP_DESKTOP, TAP_MOBILE } from '../NetworksList.constants'

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
