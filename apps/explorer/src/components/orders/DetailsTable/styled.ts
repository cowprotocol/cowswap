import { Color, Media } from '@cowprotocol/ui'

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
    color: ${Color.neutral100};
    text-decoration: none;
  }

  svg {
    margin-right: 0.5rem;
  }
`

export const WarningRow = styled.tr`
  background-color: ${Color.explorer_bg};
`
