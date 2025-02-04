import { Loader, Media, TokenSymbol } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import Input from 'legacy/components/NumericalInput'

export const Wrapper = styled.div`
  padding: 16px 16px 0;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-flow: row wrap;
  color: inherit;

  ${Media.upToSmall()} {
    gap: 10px;
  }
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 500;
  width: 100%;
  color: inherit;

  ${Media.upToSmall()} {
    flex-flow: row wrap;
    gap: 14px;
  }

  > span > i {
    font-style: normal;
    color: var(${UI.COLOR_TEXT});
  }
`

export const MarketRateWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 400;

  > i {
    font-style: normal;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }
`

export const MarketPriceButton = styled.button`
  color: inherit;
  white-space: nowrap;
  border: none;
  font-weight: 500;
  cursor: pointer;
  font-size: inherit;
  background: transparent;
  padding: 0;
  color: var(${UI.COLOR_TEXT});
  transition:
    background var(${UI.ANIMATION_DURATION}) ease-in-out,
    color var(${UI.ANIMATION_DURATION}) ease-in-out;
  text-decoration: underline;
  text-decoration-style: dashed;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
  text-decoration-color: var(${UI.COLOR_TEXT_OPACITY_70});

  > svg {
    margin: 0 0 -2px 7px;
  }

  &:disabled {
    cursor: default;
    opacity: 0.7;
    text-decoration: none;
  }
`

export const Body = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 100%;
  gap: 0;
  padding: 12px 0 4px;
  color: inherit;
`

export const NumericalInput = styled(Input)<{ $loading: boolean }>`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  text-align: left;
  color: inherit;
  font-size: 32px;
  letter-spacing: -1.5px;
  flex: 1 1 auto;

  &::placeholder {
    opacity: 0.7;
    color: inherit;
  }
`

export const CurrencyToggleGroup = styled.div`
  display: flex;
  align-items: center;
  background: transparent;
  overflow: hidden;
  margin: 0 0 0 8px;
`

export const ActiveCurrency = styled.button<{ $active?: boolean }>`
  --height: 25px;
  --skew-width: 6px;
  --skew-offset: -3px;
  --skew-angle: -10deg;
  --padding: 10px;
  --gap: 6px;
  --font-size: 13px;
  --border-radius: 8px;

  display: flex;
  align-items: center;
  gap: var(--gap);
  font-size: var(--font-size);
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
  border: none;
  cursor: pointer;
  position: relative;
  height: var(--height);
  border-radius: var(--border-radius);
  transition: all 0.2s ease-in-out;
  background: ${({ $active }) => ($active ? 'var(' + UI.COLOR_PAPER + ')' : 'var(' + UI.COLOR_PAPER_DARKEST + ')')};
  color: ${({ $active }) => ($active ? 'var(' + UI.COLOR_TEXT + ')' : 'var(' + UI.COLOR_TEXT_OPACITY_50 + ')')};
  padding: 0 10px;

  &:first-child {
    padding-right: var(--padding);
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;

    ${({ $active }) =>
      $active &&
      `
      &::after {
        content: '';
        position: absolute;
        right: var(--skew-offset);
        top: 0;
        bottom: 0;
        width: var(--skew-width);
        background: var(${UI.COLOR_PAPER_DARKER});
        transform: skew(var(--skew-angle));
        z-index: 5;
      }
    `}
  }

  &:last-child {
    padding-left: var(--padding);
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;

    ${({ $active }) =>
      $active &&
      `
      &::before {
        content: '';
        position: absolute;
        left: var(--skew-offset);
        top: 0;
        bottom: 0;
        width: var(--skew-width);
        background: var(${UI.COLOR_PAPER_DARKER});
        transform: skew(var(--skew-angle));
        z-index: 5;
      }
    `}
  }

  &:hover {
    color: var(${UI.COLOR_TEXT});
  }
`

export const UsdButton = styled(ActiveCurrency)`
  font-weight: var(${UI.FONT_WEIGHT_BOLD});
  min-width: 40px;
  justify-content: center;

  > svg {
    width: 10px;
    height: 16px;
    color: inherit;
  }
`

export const ActiveSymbol = styled.span<{ $active?: boolean }>`
  color: inherit;
  font-size: 13px;
  font-weight: 500;
  text-align: right;
  padding: 10px 0;
  display: flex;
  gap: 4px;

  ${({ $active }) =>
    !$active &&
    `
    > div {
    background: transparent;
    }
    > div > img {
      opacity: 0.5;
    }
    
    > ${TokenSymbol} {
      color: var(${UI.COLOR_TEXT_OPACITY_50});
    }
  `}
`

export const ActiveIcon = styled.div`
  --size: 19px;
  color: inherit;
  width: var(--size);
  min-width: var(--size);
  height: var(--size);
  min-height: var(--size);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 0 2px 0 0;
  transition:
    color var(${UI.ANIMATION_DURATION}) ease-in-out,
    background var(${UI.ANIMATION_DURATION}) ease-in-out;
  background: transparent;
  border: 1px solid var(${UI.COLOR_PAPER_DARKEST});

  &:hover {
    color: var(${UI.COLOR_TEXT});
    background: var(${UI.COLOR_PAPER});
    border-color: var(${UI.COLOR_PAPER});
  }
`

export const RateLoader = styled(Loader)`
  margin: 5px;
`

export const EstimatedRate = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  min-height: 36px;
  margin: 0;
  padding: 12px 10px 14px;
  font-size: 16px;
  border-radius: 0 0 16px 16px;
  font-weight: 500;
  color: var(${UI.COLOR_TEXT});
  background: var(${UI.COLOR_PAPER});
  border: 2px solid var(${UI.COLOR_PAPER_DARKER});

  > b {
    display: flex;
    flex-flow: row nowrap;
    font-weight: inherit;
    text-align: left;
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
    color: inherit;
  }

  > b svg {
    opacity: 0.7;
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
    color: inherit;

    &:hover {
      opacity: 1;
    }
  }

  > span > i {
    font-style: normal;
    color: inherit;
    opacity: 0.7;
  }

  > span {
    display: flex;
    align-items: center;
    font-size: 13px;
    font-weight: 400;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }
`

export const LockIcon = styled.span`
  --size: 19px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: inherit;
  border-radius: var(--size);
  width: var(--size);
  min-width: var(--size);
  height: var(--size);
  border: 1px solid var(${UI.COLOR_PAPER_DARKEST});
  cursor: pointer;
  transition:
    border-color var(${UI.ANIMATION_DURATION}) ease-in-out,
    background var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    border-color: var(${UI.COLOR_PAPER});
    background: var(${UI.COLOR_PAPER});
  }
`
