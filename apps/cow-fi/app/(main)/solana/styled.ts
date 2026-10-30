import { Color, Media, UI } from '@cowprotocol/ui'

import styled, { css, keyframes } from 'styled-components/macro'

import { Link } from '@/components/Link'
import {
  HeroButtonWrapper,
  HeroContainer,
  HeroContent,
  HeroDescription,
  HeroTitle,
  PageWrapper,
  SectionTitleDescription,
} from '@/styles/styled'

const EASE_OUT_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)'
const AVATAR_SIZE = 80
const AVATAR_SIZE_MOBILE = 64
const AVATAR_OVERLAP = 20
const SUBTLE_LINE = `color-mix(in srgb, ${Color.cowfi_purple_bright} 25%, transparent)`

const slideInFromLeft = keyframes`
  from { transform: translateX(-24px); }
`

const slideInFromRight = keyframes`
  from { transform: translateX(24px); }
`

const sparkPop = keyframes`
  from { transform: scale(0.4) rotate(-45deg); }
`

const IDLE_LOOP = '6s'
const IDLE_DELAY = '1.2s'

const nuzzleRight = keyframes`
  0%, 84%, 100% { translate: 0 0; }
  90% { translate: 3px 0; }
`

const nuzzleLeft = keyframes`
  0%, 84%, 100% { translate: 0 0; }
  90% { translate: -3px 0; }
`

const sparkTwinkle = keyframes`
  0%, 84%, 100% { scale: 1; rotate: 0deg; }
  90% { scale: 1.25; rotate: 20deg; }
`

const breathe = keyframes`
  0%, 100% { scale: 1; opacity: 1; }
  50% { scale: 0.6; opacity: 0.5; }
`

const riseIn = keyframes`
  from { opacity: 0; translate: 0 6px; }
`

const chipPop = keyframes`
  from { opacity: 0; scale: 0.9; }
`

export const SolanaPageWrapper = styled(PageWrapper)`
  h1,
  h2,
  h5,
  ${SectionTitleDescription} {
    text-wrap: balance;
  }

  p {
    text-wrap: pretty;
  }

  ::selection {
    background: ${Color.cowfi_purple_bright};
    color: ${Color.cowfi_purple_dark};
  }

  a:focus-visible,
  button:focus-visible {
    outline: 3px solid ${Color.cowfi_purple4};
    outline-offset: 3px;
  }
`

export const MatchCard = styled.article`
  position: relative;
  flex: 0 0 auto;
  width: 470px;
  max-width: 100%;
  margin: 0 0 0 auto;
  padding: 28px 32px;
  border-radius: 32px;
  background: ${Color.cowfi_purple3};
  color: ${Color.neutral98};

  ${Media.upToMedium()} {
    width: 100%;
    margin: 0;
    padding: 20px;
  }
`

export const SolanaHero = styled(HeroContainer)`
  align-items: center;

  ${Media.upToMedium()} {
    align-items: stretch;

    ${HeroContent} {
      display: contents;
    }

    ${HeroTitle} {
      order: 1;
    }

    ${MatchCard} {
      order: 2;
    }

    ${HeroDescription} {
      order: 3;
      margin: 0;
    }

    ${HeroButtonWrapper} {
      order: 4;
      align-items: flex-start;
      margin: 0;
    }
  }
`

export const SubheadLine = styled.span`
  display: block;
  text-wrap: balance;
`

export const StatusPill = styled.p`
  position: absolute;
  top: 28px;
  right: 28px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 6px 12px 6px 10px;
  border-radius: 999px;
  background: ${Color.cowfi_purple_dark};
  color: ${Color.cowfi_purple_bright};
  font-size: 14px;
  font-weight: var(${UI.FONT_WEIGHT_BOLD});
  line-height: 1.2;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${Color.cowfi_purple4};
    animation: ${breathe} 2.4s ease-in-out infinite;
  }

  ${Media.upToMedium()} {
    top: 20px;
    right: 20px;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation: none;
    }
  }
`

export const MatchAvatars = styled.div`
  position: relative;
  display: flex;
  width: max-content;
  margin: 0 0 16px;
`

export const Avatar = styled.span<{ $variant: 'cow' | 'builders' }>`
  display: grid;
  place-items: center;
  align-content: center;
  width: ${AVATAR_SIZE}px;
  height: ${AVATAR_SIZE}px;
  border-radius: 50%;
  border: 4px solid ${Color.cowfi_purple3};
  color: ${Color.cowfi_purple_dark};

  ${({ $variant }) =>
    $variant === 'cow'
      ? css`
          background: ${Color.cowfi_purple_bright};
          animation:
            ${slideInFromLeft} 0.9s ${EASE_OUT_EXPO} both,
            ${nuzzleRight} ${IDLE_LOOP} ease-in-out ${IDLE_DELAY} infinite;

          svg {
            width: 40px;
            height: auto;
          }
        `
      : css`
          margin-left: -${AVATAR_OVERLAP}px;
          background: ${Color.cowfi_purple2};
          animation:
            ${slideInFromRight} 0.9s ${EASE_OUT_EXPO} both,
            ${nuzzleLeft} ${IDLE_LOOP} ease-in-out ${IDLE_DELAY} infinite;
          text-align: center;
          line-height: 1.1;

          > strong {
            font-size: 16px;
            font-weight: var(${UI.FONT_WEIGHT_BOLD});
          }

          > span {
            font-size: 12px;
            font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
          }
        `}

  ${Media.upToMedium()} {
    width: ${AVATAR_SIZE_MOBILE}px;
    height: ${AVATAR_SIZE_MOBILE}px;

    svg {
      width: 32px;
    }

    > strong {
      font-size: 14px;
    }

    > span {
      font-size: 11px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const MatchSpark = styled.svg`
  position: absolute;
  top: -6px;
  left: ${AVATAR_SIZE - AVATAR_OVERLAP / 2 - 12}px;
  width: 24px;
  height: 24px;
  color: ${Color.cowfi_purple4};
  animation:
    ${sparkPop} 0.9s ${EASE_OUT_EXPO} 0.25s both,
    ${sparkTwinkle} ${IDLE_LOOP} ease-in-out ${IDLE_DELAY} infinite;

  ${Media.upToMedium()} {
    left: ${AVATAR_SIZE_MOBILE - AVATAR_OVERLAP / 2 - 12}px;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const MatchCardTitle = styled.h2`
  margin: 0;
  font-size: 38px;
  line-height: 1.1;
  font-weight: var(${UI.FONT_WEIGHT_BOLD});
  color: ${Color.neutral98};
`

export const MatchCardSubtitle = styled.p`
  margin: 6px 0 16px;
  font-size: 18px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
  color: ${Color.cowfi_purple_bright};

  ${Media.upToMedium()} {
    margin: 8px 0 16px;
  }
`

export const MutualFriends = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 20px;

  > p {
    margin: 0;
    font-size: 14px;
    line-height: 1.35;
    color: ${Color.neutral98};
    text-wrap: balance;
  }

  > p > strong {
    font-weight: var(${UI.FONT_WEIGHT_BOLD});
    color: ${Color.cowfi_purple_bright};
  }

  ${Media.upToMedium()} {
    margin: 0 0 8px;
  }
`

export const FriendAvatars = styled.span`
  display: flex;
  flex: 0 0 auto;
`

export const FriendAvatar = styled.span`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid ${Color.cowfi_purple3};
  background: ${Color.neutral98};
  color: ${Color.cowfi_purple_dark};

  & + & {
    margin-left: -8px;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

export const ProfileToggle = styled.button`
  display: none;

  ${Media.upToMedium()} {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 48px;
    margin: 0;
    padding: 0;
    border: 0;
    border-top: 1px solid ${SUBTLE_LINE};
    background: none;
    color: ${Color.cowfi_purple_bright};
    font: inherit;
    font-size: 16px;
    font-weight: var(${UI.FONT_WEIGHT_BOLD});
    text-align: left;
    cursor: pointer;

    > svg {
      width: 20px;
      height: 20px;
      transition: transform 0.3s ${EASE_OUT_EXPO};
    }

    &[aria-expanded='true'] > svg {
      transform: rotate(180deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    > svg {
      transition: none;
    }
  }
`

export const ProfileList = styled.dl`
  display: grid;
  gap: 28px;
  margin: 0;
  padding: 24px 0 0;
  border-top: 1px solid ${SUBTLE_LINE};

  > div {
    animation: ${riseIn} 0.7s ${EASE_OUT_EXPO} both;
  }

  > div:nth-child(2) {
    animation-delay: 0.1s;
  }

  > div:nth-child(3) {
    animation-delay: 0.2s;
  }

  @media (prefers-reduced-motion: reduce) {
    > div {
      animation: none;
    }
  }

  dt {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: var(${UI.FONT_WEIGHT_BOLD});
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${Color.cowfi_purple_bright};
  }

  dd {
    margin: 0;
    font-size: 18px;
    line-height: 1.4;
    color: ${Color.neutral98};
  }

  ${Media.upToMedium()} {
    padding: 8px 0 4px;
    border-top: 0;

    &[data-expanded='false'] {
      display: none;
    }
  }
`

export const Chips = styled.ul`
  display: flex;
  flex-flow: row wrap;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
`

export const Chip = styled.li<{ $muted?: boolean; $delay: number }>`
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
  line-height: 1.3;
  animation: ${chipPop} 0.5s ${EASE_OUT_EXPO} ${({ $delay }) => $delay}s both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  ${({ $muted }) =>
    $muted
      ? css`
          color: ${Color.cowfi_purple_bright};
          box-shadow: inset 0 0 0 1px ${SUBTLE_LINE};
          text-decoration: line-through;
          text-decoration-color: ${Color.cowfi_purple4};
          text-decoration-thickness: 2px;
        `
      : css`
          background: ${Color.cowfi_purple_bright};
          color: ${Color.cowfi_purple_dark};
        `}
`

export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`

export const SignOff = styled.p`
  margin: 8px 0 0;
  font-size: 21px;
  font-weight: var(${UI.FONT_WEIGHT_BOLD});
  color: ${Color.cowfi_purple3};
`

export const DeveloperParagraphs = styled.div`
  display: grid;
  gap: 12px;
  margin: 16px 0;

  > p {
    margin: 0;
    font-size: 18px;
    font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
    line-height: 1.5;
    color: inherit;
  }
`

export const CardFooter = styled.div`
  margin-top: auto;
  align-self: flex-start;
`

export const LeadAside = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: space-between;
  text-align: left;
  gap: 40px;
  height: 100%;
`

export const LeadStat = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 8px;

  > strong {
    font-size: 67px;
    line-height: 1;
    font-weight: var(${UI.FONT_WEIGHT_BOLD});
    color: ${Color.neutral98};
  }

  > span {
    font-size: 18px;
    line-height: 1.4;
    color: ${Color.cowfi_purple_bright};
  }

  ${Media.upToMedium()} {
    > strong {
      font-size: 51px;
    }
  }
`

export const InlineLink = styled(Link)`
  color: ${Color.cowfi_purple3};
  font-weight: var(${UI.FONT_WEIGHT_BOLD});
  text-decoration: underline;
  text-underline-offset: 3px;
`
