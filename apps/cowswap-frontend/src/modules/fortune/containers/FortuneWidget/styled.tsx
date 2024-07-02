import { Media, UI } from '@cowprotocol/ui'

import { darken, transparentize } from 'color2k'
import styled from 'styled-components/macro'

const SuccessBannerColors = {
  opacity: 0.8,
  darken: 0.1,
  twitter: '#17a7ff',
  discord: '#4e72ef',
}

export const SuccessBanner = styled.div<{ type: string }>`
  width: 100%;
  height: 86px;
  padding: 0 24px;
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  margin: 0 0 12px;
  font-weight: bold;
  font-size: 21px;
  justify-content: space-between;
  align-items: center;
  transition: border var(${UI.ANIMATION_DURATION}) ease-in-out;
  border: 2px solid transparent;
  color: ${({ type, theme }) =>
    type === 'Twitter' ? SuccessBannerColors.twitter : type === 'Discord' ? SuccessBannerColors.discord : theme.text1};
  display: flex;
  background: ${({ type, theme }) =>
    type === 'Twitter'
      ? transparentize(SuccessBannerColors.twitter, SuccessBannerColors.opacity)
      : type === 'Discord'
      ? transparentize(SuccessBannerColors.discord, SuccessBannerColors.opacity)
      : theme.blueShade3};

  &:hover {
    border: 2px solid
      ${({ type, theme }) =>
        type === 'Twitter'
          ? darken(SuccessBannerColors.twitter, SuccessBannerColors.darken)
          : type === 'Discord'
          ? darken(SuccessBannerColors.discord, SuccessBannerColors.darken)
          : darken(theme.blueShade3, SuccessBannerColors.darken)};
  }

  ${Media.upToSmall()} {
    font-size: 16px;
  }

  > svg {
    width: 32px;
    height: 28px;
    object-fit: contain;
    stroke: none;
    fill: ${({ type, theme }) =>
      type === 'Twitter' ? SuccessBannerColors.twitter : type === 'Discord' ? SuccessBannerColors.discord : theme.bg2};

    ${Media.upToSmall()} {
      width: 32px;
      height: 32px;
    }

    > path {
      fill: ${({ type, theme }) =>
        type === 'Twitter'
          ? SuccessBannerColors.twitter
          : type === 'Discord'
          ? SuccessBannerColors.discord
          : theme.text1};
    }
  }
`
