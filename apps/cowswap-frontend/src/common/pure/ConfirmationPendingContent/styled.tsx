import { BackButton, UI } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import { X } from 'react-feather'
import styled, { css } from 'styled-components/macro'

export const Wrapper = styled.div`
  width: 100%;
  padding: 0;
  display: flex;
  flex-flow: column nowrap;
  overflow-y: auto; // fallback for 'overlay'
  overflow-y: overlay;
  height: inherit;

  strong {
    font-weight: 600;
  }
  ${({ theme }) => theme.colorScrollbar};
`

export const WalletIcon = styled.div`
  --icon-size: 56px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size);
  height: var(--icon-size);
  border-radius: var(--icon-size);
  animation: pulser 6s var(${UI.ANIMATION_DURATION}) ease-in-out infinite;
  position: relative;

  @keyframes pulser {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  > div {
    height: 100%;
    width: 100%;
    position: relative;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 0;
  }

  > div > img,
  > div > div > svg {
    height: 100%;
    width: 100%;
    object-fit: contain;
  }

  > div > img[alt='Gnosis Safe Multisig logo'] {
    ${({ theme }) => theme.util.invertImageForDarkMode};
  }
`

export const UpperSection = styled.div`
  display: flex;
  flex-flow: column wrap;
  padding: 26px 16px 32px;
  background: var(${UI.COLOR_PAPER_DARKER});
  border-radius: 16px 16px 0 0;
  color: inherit;
  position: relative;

  > span {
    font-size: 18px;
    font-weight: 300;
    width: 100%;
    text-align: center;
    margin: 0;
    color: inherit;
  }

  // Targets TokenSymbol
  > span > span {
    font-weight: 600;
  }
`

export const LowerSection = styled.div`
  display: flex;
  flex-flow: column wrap;
  padding: 32px 16px;
  color: inherit;
  background: var(${UI.COLOR_PAPER});
  border-radius: 0 0 16px 16px;

  > h3 {
    text-align: center;
    width: 100%;
    font-weight: 400;
    font-size: 21px;
    margin: 0 auto 16px;
    color: inherit;
  }
`

export const StepsIconWrapper = styled.div`
  --circle-size: 65px;
  --border-radius: 100%;
  --border-size: 2px;
  border-radius: var(--circle-size);
  height: var(--circle-size);
  width: var(--circle-size);
  margin: 0 auto 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: var(--border-size);
    right: var(--border-size);
    bottom: var(--border-size);
    left: var(--border-size);
    z-index: -1;
    border-radius: calc(var(--border-radius) - var(--border-size));
    ${({ theme }) => theme.card.boxShadow};
  }

  > svg {
    height: 100%;
    width: 100%;
    padding: 18px;
    stroke: var(${UI.COLOR_TEXT_PAPER});
  }

  @keyframes spin {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
`

export const StepsWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  position: relative;

  > div {
    flex: 0 1 35%;
    display: flex;
    flex-flow: column wrap;
    animation: SlideInStep 1s forwards linear;
    opacity: 0;
    transform: translateX(-5px);
    z-index: 2;
  }

  > div:first-child {
    ${StepsIconWrapper} {
      &::before {
        content: '';
        ${({ theme }) => theme.iconGradientBorder};
        display: block;
        width: var(--circle-size);
        padding: 0;
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        margin: auto;
        border-radius: 100%;
        z-index: -2;
        animation: spin 1.5s linear infinite;
      }
    }
  }

  > div:last-child {
    animation-delay: 1s;
  }

  > hr {
    flex: 1 1 auto;
    height: 2px;
    border: 0;
    background: var(${UI.COLOR_TEXT});
    margin: auto;
    position: absolute;
    width: 100%;
    max-width: 35%;
    left: 0;
    right: 0;
    top: 32px;
    z-index: 1;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      max-width: 25%;
    `}

    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      max-width: 20%;
    `}
  }

  > hr::before {
    content: '';
    height: 4px;
    width: 100%;
    background: var(${UI.COLOR_PAPER_DARKER});
    display: block;
    margin: 0;
    animation: Shrink 1s forwards linear;
    transform: translateX(0%);
  }

  > div > p {
    font-size: 15px;
    line-height: 1.4;
    text-align: center;
  }

  > div > p > span {
    display: block;
    margin: 6px auto 0;
    opacity: 0.7;
  }

  @keyframes SlideInStep {
    from {
      opacity: 0;
      transform: translateX(-5px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes Shrink {
    from {
      transform: translateX(0%);
    }
    to {
      transform: translateX(100%);
    }
  }
`

export const CloseIcon = styled(X)`
  cursor: pointer;
  position: absolute;
  top: 16px;
  right: 16px;
  color: var(${UI.COLOR_TEXT});
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    color: var(${UI.COLOR_PRIMARY});
  }
`

export const BackButtonStyled = styled(BackButton)`
  position: absolute;
  top: 16px;
  left: 16px;
`

export const ApproveComparison = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: max-content;
  grid-gap: 16px;
  margin: 0 auto;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    flex-flow: column wrap;
    gap: 24px;
  `};
`

export const CompareItem = styled.div<{ highlight?: boolean; recommended?: boolean }>`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: flex-start;
  padding: 32px 24px;
  gap: 16px;
  border-radius: 12px;
  font-size: 13px;
  background: ${({ theme, highlight }) =>
    highlight ? (theme.darkMode ? transparentize(theme.text3, 0.8) : transparentize(theme.text3, 0.9)) : theme.bg1};
  border: 1px solid ${({ highlight }) => (highlight ? 'none' : `var(${UI.COLOR_TEXT})`)};
  position: relative;

  &::before {
    content: ${({ recommended }) => (recommended ? "'Recommended'" : 'none')};
    position: absolute;
    top: -7px;
    left: 0;
    right: 0;
    width: fit-content;
    border-radius: 12px;
    display: block;
    margin: 0 auto;
    padding: 2px 6px;
    text-transform: uppercase;
    font-size: 10px;
    font-weight: bold;
    letter-spacing: 0.5px;
    text-align: center;
    background: ${({ theme }) => theme.text3};
    color: ${({ theme }) => (theme.darkMode ? theme.blueDark1 : theme.white)};
  }

  > h5 {
    font-size: 21px;
    font-weight: ${({ highlight }) => (highlight ? 700 : 500)};
    margin: 0;
    padding: 0;
  }
`

export const ItemList = styled.div<{ listIconAlert?: boolean }>`
  margin: 0 auto;
  padding: 0;
  list-style: none;
  font-size: inherit;
  color: inherit;
  gap: 6px;
  display: flex;
  flex-flow: column wrap;

  > li {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  > li > svg {
    --size: 12px;
    display: inline-block;
    width: var(--size);
    height: var(--size);

    ${({ listIconAlert }) =>
      !listIconAlert &&
      css`
        > path:nth-child(1) {
          fill: ${({ theme }) => theme.text3};
          opacity: 1;
        }

        > path:nth-child(2) {
          fill: ${({ theme }) => theme.text3};
        }

        > path:nth-child(3) {
          fill: ${({ theme }) => theme.white};
        }
      `}

    ${({ listIconAlert }) =>
      listIconAlert &&
      css`
        > path {
          fill: ${({ theme }) => transparentize(theme.text, 0.6)};
        }
      `}
  }
`

export const ApproveFooter = styled.div`
  display: flex;
  flex-flow: column wrap;
  font-size: 13px;
  margin: 0 auto;

  > h6 {
    margin: 0 auto 16px;
    width: 100%;
    font-weight: 600;
    font-size: 14px;
    text-align: center;
  }

  > ul {
    margin: 0 auto;
    padding: 0;
    list-style: none;
    font-size: inherit;
    color: var(${UI.COLOR_TEXT_OPACITY_25});
    gap: 6px;
    display: flex;
    flex-flow: column wrap;
  }

  > ul > li {
    display: flex;
    align-items: center;
  }

  > ul > li > svg {
    --size: 12px;
    display: inline-block;
    width: var(--size);
    height: var(--size);
    margin: 0 6px 0 0;

    > path:nth-child(1) {
      fill: ${({ theme }) => theme.text3};
      opacity: 1;
    }

    > path:nth-child(2) {
      fill: ${({ theme }) => theme.text3};
    }

    > path:nth-child(3) {
      fill: ${({ theme }) => theme.white};
    }
  }
`
