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
`

export const CurrencyInputBox = styled.div<{ flexibleWidth: boolean }>`
  display: grid;
  width: 100%;
  grid-template-columns: ${({ flexibleWidth }) => (flexibleWidth ? 'min-content auto' : 'auto auto')};
  gap: 16px;
  font-weight: 400;
  font-size: 13px;

  > div {
    display: flex;
    align-items: center;
  }

  > div:last-child {
    text-align: right;
    margin: 0 0 0 auto;
  }

  @media screen and (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    ${({ flexibleWidth }) =>
      flexibleWidth
        ? `
    display: block;
    `
        : `
    display: flex;
    flex-direction: column-reverse;
    align-items: start;
    margin: 0;
    gap: 8px;
    `}
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
  font-size: 30px;
  font-weight: 500;
  color: ${({ theme }) => theme.text1};

  &::placeholder {
    color: ${({ theme }) => theme.text1};
    opacity: 0.5;
  }

  @media screen and (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    margin: 20px 0 0 8px;
    text-align: left;
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
