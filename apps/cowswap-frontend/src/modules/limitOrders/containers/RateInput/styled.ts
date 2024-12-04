import { Loader, Media } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import Input from 'legacy/components/NumericalInput'

export const Wrapper = styled.div`
  background: var(${UI.COLOR_PAPER_DARKER});
  border-radius: 16px;
  padding: 10px 16px;
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

  > span > i {
    font-style: normal;
    color: var(${UI.COLOR_TEXT});
  }
`

export const MarketPriceButton = styled.button`
  color: inherit;
  white-space: nowrap;
  border: none;
  font-weight: 500;
  cursor: pointer;
  font-size: 11px;
  background: transparent;
  padding: 0;
  color: var(${UI.COLOR_TEXT});
  transition:
    background var(${UI.ANIMATION_DURATION}) ease-in-out,
    color var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
`

export const Body = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
  color: inherit;
`

export const NumericalInput = styled(Input)<{ $loading: boolean }>`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  width: max-content;
  text-align: left;
  color: inherit;

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
`

export const ActiveCurrency = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
  border: none;
  cursor: pointer;
  position: relative;
  background: ${({ $active }) => ($active ? 'var(' + UI.COLOR_PAPER + ')' : 'var(' + UI.COLOR_PAPER_DARKEST + ')')};
  color: ${({ $active }) => ($active ? 'var(' + UI.COLOR_TEXT + ')' : 'var(' + UI.COLOR_TEXT_OPACITY_70 + ')')};
  transition: all 0.2s ease-in-out;

  &:first-child {
    padding-right: 16px;

    ${({ $active }) =>
      $active &&
      `
      &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 12px;
        background: var(${UI.COLOR_PAPER_DARKER});
        transform: skew(-10deg);
      }
    `}
  }

  &:last-child {
    padding-left: 16px;

    ${({ $active }) =>
      $active &&
      `
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 12px;
        background: var(${UI.COLOR_PAPER_DARKER});
        transform: skew(-10deg);
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
`

export const ActiveSymbol = styled.span`
  color: inherit;
  font-size: 13px;
  font-weight: 500;
  text-align: right;
  padding: 10px 0;
  display: flex;
  gap: 4px;
`

export const ActiveIcon = styled.div`
  --size: 20px;
  background-color: var(${UI.COLOR_PAPER});
  color: inherit;
  width: var(--size);
  min-width: var(--size);
  height: var(--size);
  min-height: var(--size);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const RateLoader = styled(Loader)`
  margin: 5px;
`

export const EstimatedRate = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  min-height: 42px;
  margin: 0;
  padding: 12px 10px 14px;
  font-size: 13px;
  border-radius: 0 0 16px 16px;
  font-weight: 400;
  background: var(${UI.COLOR_PAPER});
  border: 2px solid var(${UI.COLOR_PAPER_DARKER});
  background: red;

  > b {
    display: flex;
    flex-flow: row nowrap;
    font-weight: normal;
    text-align: left;
    opacity: 0.7;
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

    &:hover {
      opacity: 1;
    }
  }

  // TODO: Make the question helper icon transparent through a prop instead
  > b svg {
    opacity: 0.7;
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

    &:hover {
      opacity: 1;
    }
  }

  > span > i {
    font-style: normal;
    color: inherit;
    opacity: 0.7;
  }
`
