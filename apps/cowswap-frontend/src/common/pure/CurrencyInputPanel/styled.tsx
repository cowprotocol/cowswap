import { TokenAmount, loadingOpacityMixin, Media } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import Input from 'legacy/components/NumericalInput'

export const OuterWrapper = styled.div`
  max-width: 100%;
  display: flex;
  flex-flow: column wrap;
`

export const Wrapper = styled.div<{ withReceiveAmountInfo: boolean; readOnly: boolean; pointerDisabled: boolean }>`
  display: flex;
  flex-flow: row wrap;
  align-content: space-between;
  gap: 10px;
  padding: 16px;
  background: ${({ readOnly }) => (readOnly ? 'transparent' : `var(${UI.COLOR_PAPER_DARKER})`)};
  border: ${({ readOnly }) => (readOnly ? `1px solid var(${UI.COLOR_PAPER_DARKER})` : 'none')};
  border-radius: ${({ withReceiveAmountInfo }) => (withReceiveAmountInfo ? '16px 16px 0 0' : '16px')};
  color: inherit;
  min-height: 106px;
  pointer-events: ${({ pointerDisabled }) => (pointerDisabled ? 'none' : '')};
  max-width: 100%;

  ${Media.upToSmall()} {
    padding: 16px 12px;
  }
`

export const CurrencyInputBox = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, auto);
  grid-template-rows: max-content;
  word-break: break-all;
  gap: 16px;
  margin: 0;
  font-weight: 400;
  font-size: 13px;
  color: inherit;

  ${Media.upToSmall()} {
    gap: 8px;
  }

  > div {
    display: flex;
    align-items: center;
    color: inherit;
  }

  > div:last-child {
    text-align: right;
    margin: 0 0 0 auto;
  }
`

export const CurrencyTopLabel = styled.div`
  font-size: 13px;
  font-weight: 400;
  margin: auto 0;
  color: inherit;
  opacity: 0.7;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
`

export const TopRow = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
`

export const NumericalInput = styled(Input)<{ $loading: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  background: none;
  font-size: 28px;
  font-weight: 500;
  color: inherit;
  text-align: left;

  &::placeholder {
    opacity: 0.7;
    color: inherit;
  }

  ${Media.upToSmall()} {
    font-size: 26px;
  }

  ${loadingOpacityMixin}
`

export const TokenAmountStyled = styled(TokenAmount)`
  font-size: 28px;
  font-weight: 500;
  color: inherit;

  ${Media.upToSmall()} {
    font-size: 26px;
  }
`

export const BalanceText = styled.span`
  font-weight: inherit;
  font-size: 13px;
  gap: 5px;
  display: flex;
  align-items: center;
  opacity: 0.7;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  color: inherit;

  &:hover {
    opacity: 1;
  }
`

export const FiatAmountText = styled.span`
  // TODO: inherit font styles from 'CurrencyInputBox' instead
  color: inherit;

  > div {
    font-weight: 500;
    font-size: 13px;
    opacity: 0.7;
    color: inherit;
    transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

    &:hover {
      opacity: 1;
    }
  }
`

export const SetMaxBtn = styled.button`
  display: inline-block;
  cursor: pointer;
  margin: 0;
  background: none;
  border: none;
  outline: none;
  color: inherit;
  font-weight: 600;
  font-size: 11px;
  background: var(${UI.COLOR_PAPER});
  border-radius: 6px;
  padding: 3px 4px;
  text-transform: uppercase;
  white-space: nowrap;
  transition:
    background var(${UI.ANIMATION_DURATION}) ease-in-out,
    color var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    background: var(${UI.COLOR_PRIMARY});
    color: var(${UI.COLOR_BUTTON_TEXT});
  }
`
