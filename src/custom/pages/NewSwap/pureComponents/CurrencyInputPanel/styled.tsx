import styled from 'styled-components/macro'
import { loadingOpacityMixin } from 'components/Loader/styled'
import Input from 'components/NumericalInput'
import { MEDIA_WIDTHS } from 'theme'

export const Wrapper = styled.div<{ withReceiveAmountInfo: boolean }>`
  padding: 1rem;
  background: ${({ theme }) => theme.currencyInput?.background};
  border: ${({ theme }) => theme.currencyInput?.border};
  border-radius: ${({ withReceiveAmountInfo }) => (withReceiveAmountInfo ? '20px 20px 0 0' : '20px')};
  border-bottom: ${({ withReceiveAmountInfo }) => (withReceiveAmountInfo ? '0' : 'auto')};
`

export const CurrencyInputBox = styled.div<{ flexibleWidth: boolean }>`
  display: grid;
  grid-template-columns: ${({ flexibleWidth }) => (flexibleWidth ? 'min-content auto' : 'auto auto')};
  gap: 0.75rem;

  :last-child {
    margin-top: 0.75rem;
  }

  > :last-child {
    text-align: right;
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
    margin-top: 0;
    gap: 0.5rem;
    `}
  }
`

export const NumericalInput = styled(Input)<{ $loading: boolean }>`
  width: 100%;
  background: none;

  @media screen and (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    margin: 20px 0 0 8px;
    text-align: left;
  }

  ${loadingOpacityMixin}
`

export const BalanceText = styled.span`
  font-weight: 400;
  font-size: 14px;

  @media screen and (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    opacity: 0.75;
  }
`

export const FiatAmountText = styled.span`
  font-weight: 400;
  font-size: 14px;
`

export const SetMaxBtn = styled.button`
  display: inline-block;
  cursor: pointer;
  margin-left: 4px;

  background: none;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.primary4};
  font-weight: 500;
  font-size: 14px;

  :hover {
    opacity: 0.85;
  }
`
