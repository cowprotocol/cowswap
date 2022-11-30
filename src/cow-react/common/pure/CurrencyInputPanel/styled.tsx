import styled from 'styled-components/macro'
import { loadingOpacityMixin } from 'components/Loader/styled'
import Input from 'components/NumericalInput'
import { MEDIA_WIDTHS } from 'theme'

export const Wrapper = styled.div<{ withReceiveAmountInfo: boolean; disabled: boolean }>`
  display: flex;
  flex-flow: row wrap;
  align-content: space-between;
  gap: 10px;
  padding: 16px;
  background: ${({ theme }) => theme.input.bg1};
  border: none;
  border-radius: ${({ withReceiveAmountInfo }) => (withReceiveAmountInfo ? '16px 16px 0 0' : '16px')};
  min-height: 106px;
  pointer-events: ${({ disabled }) => (disabled ? 'none' : '')};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap: 10px;
    padding: 12px;
  `}
`

export const CurrencyInputBox = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: auto auto;
  gap: 16px;
  margin: 0;
  font-weight: 400;
  font-size: 13px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap: 8px;
    grid-template-columns: minmax(auto, 50%) auto;
  `}

  > div {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
  }

  > div:last-child {
    text-align: right;
    margin: 0 0 0 auto;
  }
`

export const CurrencyTopLabel = styled.div`
  font-size: 13px;
  font-weight: 400;
  opacity: 0.8;
  margin: auto 0;
`

export const NumericalInput = styled(Input)<{ $loading: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  background: none;
  font-size: 28px;
  font-weight: 500;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 26px;
  `}

  &::placeholder {
    color: ${({ theme }) => theme.text1};
    opacity: 0.5;
  }

  ${loadingOpacityMixin}
`

export const BalanceText = styled.span`
  font-weight: inherit;
  font-size: inherit;

  @media screen and (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    opacity: 0.75;
  }
`

export const FiatAmountText = styled.span`
  // TODO: inherit font styles from 'CurrencyInputBox' instead
  > div {
    font-weight: 400;
    font-size: 13px;
  }
`

export const SetMaxBtn = styled.button`
  display: inline-block;
  cursor: pointer;
  margin: 0;
  background: none;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.text3};
  font-weight: 500;
  font-size: inherit;

  :hover {
    opacity: 0.85;
  }
`
