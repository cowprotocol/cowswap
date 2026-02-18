import { Color, Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { LinkWithPrefixNetwork } from '../../common/LinkWithPrefixNetwork'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: row;

  ${Media.MediumAndUp()} {
    align-items: center;
  }

  ${Media.upToSmall()} {
    flex-direction: column;
  }
`

export const LinkButton = styled(LinkWithPrefixNetwork)`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: ${({ theme }): string => theme.fontBold};
  font-size: 1.3rem;
  color: ${Color.explorer_orange1};
  border: 0.1rem solid ${() => Color.explorer_orange1};
  background-color: ${Color.explorer_orangeOpacity};
  border-radius: 0.4rem;
  padding: 0.8rem 1.5rem;
  margin: 0 0 0 2rem;
  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;

  ${Media.upToSmall()} {
    margin: 1.6rem 0 0 0;
  }

  &:hover {
    opacity: 0.8;
    color: var(${UI.COLOR_NEUTRAL_100});
    text-decoration: none;
  }

  svg {
    margin-right: 0.5rem;
  }
`

export const WarningRow = styled.tr`
  background-color: ${Color.explorer_bg};
`

export const SolverBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
`

export const SolverBadgeLogo = styled.img`
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  border: 0.1rem solid ${Color.explorer_border};
  object-fit: contain;
  background: ${Color.neutral100};
`

export const SolverBadgeFallback = styled.div`
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  border: 0.1rem solid ${Color.explorer_border};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: ${({ theme }): string => theme.fontBold};
`

export const SolverBadgeName = styled.span`
  color: ${Color.explorer_textSecondary1};
  font-weight: ${({ theme }): string => theme.fontMedium};
`
