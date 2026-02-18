import { ExternalLink, Media, UI } from '@cowprotocol/ui'

import { ArrowUpRight } from 'react-feather'
import styled from 'styled-components/macro'

export const HideSmall = styled.span`
  width: 100%;

  ${Media.upToSmall()} {
    display: none;
  }
`

export const Small = styled.span`
  width: 100%;
`

export const L2Icon = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 16px;
`

export const BodyText = styled.div<{ $color: string }>`
  color: ${({ $color }) => ($color ? $color : 'inherit')};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 8px;
  font-size: 14px;

  :hover {
    text-decoration: underline;
  }
`
export const RootWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  position: relative;
  margin-top: 16px;
  color: inherit;
  gap: 10px;

  ${Media.upToSmall()} {
    padding: 0 10px;
  }
`

export const StyledArrowUpRight = styled(ArrowUpRight)`
  margin-left: 12px;
  width: 24px;
  height: 24px;
`

export const ContentWrapper = styled.div<{ $logoUrl: string }>`
  background: var(${UI.COLOR_PAPER_DARKER});
  transition:
    color var(${UI.ANIMATION_DURATION}) ease-in-out,
    background var(${UI.ANIMATION_DURATION}) ease-in-out; // MOD
  border-radius: 20px;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  position: relative;
  width: 100%;
  color: inherit;

  :before {
    background-image: url(${({ $logoUrl }) => $logoUrl});
    background-repeat: no-repeat;
    background-size: 300px;
    content: '';
    height: 300px;
    opacity: 0.08;
    position: absolute;
    transform: rotate(25deg) translate(-100px, -90px);
    width: 300px;
    z-index: 0;
  }

  ${BodyText},
  ${StyledArrowUpRight} {
    color: inherit;
    stroke: currentColor;
    text-decoration: none;
    transition:
      transform var(${UI.ANIMATION_DURATION}) ease-in-out,
      stroke var(${UI.ANIMATION_DURATION}) ease-in-out,
      color var(${UI.ANIMATION_DURATION}) ease-in-out;
  }

  &:hover {
    background: var(${UI.COLOR_PAPER});

    ${BodyText},
    ${StyledArrowUpRight} {
      color: inherit;
      stroke: var(${UI.COLOR_TEXT_PAPER});
      transform: rotate(0);
    }

    ${StyledArrowUpRight} {
      transform: rotate(45deg);
    }
  }
`
export const Header = styled.h2`
  width: 100%;
  font-weight: 600;
  font-size: 16px;
  margin: 0;
`

export const LinkOutToBridge = styled(ExternalLink)`
  align-items: center;
  border-radius: 8px;
  color: inherit;
  display: flex;
  font-size: 16px;
  justify-content: space-between;
  padding: 6px 8px;
  margin-right: 12px;
  text-decoration: none !important;
  width: 100%;
`
