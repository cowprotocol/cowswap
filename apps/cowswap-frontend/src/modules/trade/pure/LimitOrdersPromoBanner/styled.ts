import { UI, Media } from '@cowprotocol/ui'

import { X } from 'react-feather'
import styled, { css, keyframes } from 'styled-components/macro'

const springEasing = `linear(
  0, 0.002, 0.01 0.9%, 0.038 1.8%, 0.156, 0.312 5.8%, 0.789 11.1%, 1.015 14.2%,
  1.096, 1.157, 1.199, 1.224 20.3%, 1.231, 1.231, 1.226, 1.214 24.6%,
  1.176 26.9%, 1.057 32.6%, 1.007 35.5%, 0.984, 0.968, 0.956, 0.949 42%,
  0.946 44.1%, 0.95 46.5%, 0.998 57.2%, 1.007, 1.011 63.3%, 1.012 68.3%,
  0.998 84%, 1
)`

const wipe = keyframes`
  0% {
    mask-position: 200% center;
  }
  100% {
    mask-position: 0% center;
  }
`

const text = keyframes`
  0% {
    background-position: 100% center;
  }    
  100% {
    background-position: -100% center;
  }    
`

export const BannerWrapper = styled.div`
  position: relative;
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
  margin: 10px 0;
  color: var(${UI.COLOR_TEXT});
  overflow: hidden;
`

export const CloseButton = styled(X)`
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }
`

export const TitleSection = styled.div`
  text-align: center;
  color: inherit;
  margin: 18px auto;
  width: 95%;

  > h3 {
    font-size: 32px;
    font-weight: 600;
    margin: 0 auto 24px;
    color: inherit;

    ${Media.upToSmall()} {
      font-size: 24px;
    }

    > span {
      white-space: nowrap;
    }
  }

  > strong {
    font-weight: 400;
    font-size: 19px;
    margin: 0;
    opacity: 0.7;
  }
`

export const List = styled.ul`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: max-content;
  list-style: none;
  margin: 0 0 28px;
  padding: 0;
  font-size: 14px;
  gap: 10px 12px;

  ${Media.upToSmall()} {
    grid-template-columns: 1fr;
  }

  > li {
    background: transparent;
    display: grid;
    grid-template-columns: 20px auto;
    grid-template-rows: max-content;
    align-items: flex-start;
    gap: 6px;
    margin: 0;
    padding: 10px;
    border-radius: 10px;
    line-height: 1.5;
  }

  > li > span {
    --size: 18px;
    width: var(--size);
    height: var(--size);
    display: inline-block;
    width: auto;
  }

  > li > span > svg {
    width: var(--size);
    height: var(--size);
    display: block;
  }

  > li > span > svg > path {
    fill: var(${UI.COLOR_SUCCESS});
  }
`

export const ControlSection = styled.div`
  text-align: center;
  color: inherit;
`

interface ButtonTextProps {
  $hover?: boolean
}

export const ButtonText = styled.span<ButtonTextProps>`
  position: relative;
  z-index: 1;
  color: var(--button-text);

  ${(props) =>
    props.$hover &&
    css`
      color: transparent;
      background-clip: text;
      -webkit-background-clip: text;
      background-color: var(--button-text);
      background-image: linear-gradient(
        120deg,
        var(--button-text) 0%,
        var(--button-text) 45%,
        color-mix(in srgb, var(--button-darker) 90%, transparent) 50%,
        var(--button-text) 55%,
        var(--button-text) 100%
      );
      background-repeat: no-repeat;
      background-size: 200% 100%;
      background-position: 100% center;
      animation: ${text} 0.66s ease-in-out 1 both;
    `}
`

export const Shimmer = styled.span`
  position: absolute;
  inset: -40px;
  border-radius: inherit;
  mix-blend-mode: color-dodge;
  mix-blend-mode: plus-lighter;
  pointer-events: none;

  &::before,
  &::after {
    transition: all 0.5s ease;
    content: '';
    border-radius: inherit;
    position: absolute;
    inset: 40px;
  }

  &::before {
    box-shadow:
      0 0 3px 2px color-mix(in srgb, var(--button-lighter) 95%, transparent),
      0 0 7px 4px color-mix(in srgb, var(--button-lighter) 80%, transparent),
      0 0 13px 8px color-mix(in srgb, var(--button-lighter) 60%, transparent),
      0 0 22px 6px color-mix(in srgb, var(--button-lighter) 40%, transparent);
    z-index: -1;
    opacity: 0.4;
  }

  &::after {
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--button-lighter) 95%, transparent),
      inset 0 0 3px 1px color-mix(in srgb, var(--button-lighter) 80%, transparent),
      inset 0 0 9px 1px color-mix(in srgb, var(--button-lighter) 70%, transparent);
    z-index: 2;
    opacity: 0.35;
  }

  mask-image: linear-gradient(90deg, transparent 15%, black 45%, black 55%, transparent 85%);
  mask-size: 200% 200%;
  mask-position: center;
  animation: ${wipe} 3s linear infinite both -0.5s;
`

export const CTAButton = styled.button`
  --shimmer-hue-1: 213deg;
  --shimmer-hue-2: 248deg;
  --button-base: var(${UI.COLOR_PRIMARY});
  --button-darker: var(${UI.COLOR_PRIMARY_DARKER});
  --button-lighter: ${({ theme }) => (theme.darkMode ? `var(${UI.COLOR_WHITE})` : `var(${UI.COLOR_PRIMARY_LIGHTER})`)};
  --button-text: var(${UI.COLOR_BUTTON_TEXT});
  --spring-duration: 1.33s;

  width: 100%;
  padding: 0.8em 1.4em;
  border-radius: 0.66em;
  border: none;
  outline: none;
  background-image: linear-gradient(315deg, var(--button-darker) 0%, var(--button-base) 47%, var(--button-darker) 100%);
  color: var(--button-text);
  font-size: 1.2em;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  isolation: isolate;
  box-shadow: 0 2px 3px 1px color-mix(in srgb, var(--button-base) 50%, transparent);
  scale: 1;
  transition: all var(--spring-duration) ${springEasing};
  text-transform: unset;

  &:hover:not(:active) {
    scale: 1.03;
    transition-duration: calc(var(--spring-duration) * 0.5);
  }

  &:active {
    scale: 1.02;
    transition-duration: calc(var(--spring-duration) * 0.5);
  }

  &:focus ${Shimmer}, &:active ${Shimmer} {
    animation-play-state: paused !important;
    mask-image: none !important;
  }
`

export const DismissLink = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 16px;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  margin: 24px auto 12px;
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out;
  display: block;

  &:hover {
    opacity: 1;
  }
`
