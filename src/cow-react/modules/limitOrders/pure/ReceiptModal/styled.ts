import styled from 'styled-components/macro'
import { AutoRow } from 'components/Row'

export const Wrapper = styled.div`
  border-radius: 16px;
  background: ${({ theme }) => theme.bg1};
  width: 100%;
  margin: 1.2rem 0;
  overflow-y: auto;
  scrollbar-color: ${({ theme }) => `${theme.card.border} ${theme.card.background2}`};
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    background: ${({ theme }) => `${theme.card.background2}`} !important;
    width: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => `${theme.card.border}`} !important;
    border: 3px solid transparent;
    border-radius: 14px;
    background-clip: padding-box;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    overflow-y: auto;
    overflow-x: auto;
    padding-bottom: 0;
    max-height: 100vh;
  `}
`

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  padding-top: 0;
`

export const Title = styled.h3`
  font-size: 1rem;
  margin: 0;
`

export const Body = styled(AutoRow)`
  box-sizing: border-box;
  max-height: 700px;
  padding: 1rem;
  padding-top: 0;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-height: 70vh;
  `}

  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-height: 100%;
  `}
`

export const FieldsWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  gap: 2px;
`

export const Field = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: ${({ theme }) => theme.grey1};
  width: 100%;
  font-size: 13px;

  &:first-child {
    border-radius: 16px 16px 0 0;
  }

  &:last-child {
    border-radius: 0 0 16px 16px;
  }
`

export const CurrencyField = styled.div`
  display: flex;
  flex-flow: row wrap;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  background: ${({ theme }) => theme.grey1};
  width: 100%;
  border-radius: 16px;
  margin: 0 0 10px;
  gap: 10px;

  > b {
    font-size: 13px;
    font-weight: 600;
  }

  > div {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    & .open-currency-select-button {
      ${({ theme }) => theme.mediaWidth.upToSmall`
        width: auto;
    `}
    }
  }
`

export const CurrencyValue = styled.span`
  font-size: 26px;
  font-weight: 600;
`

export const LabelText = styled.span``

export const Label = styled.div``

export const Value = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px 6px;
`

export const Progress = styled.div<{ active: number | string }>`
  --height: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  height: var(--height);
  width: 150px;

  &::before {
    display: inline-block;
    content: '';
    height: 100%;
    width: 100%;
    border-radius: var(--height);
    background: ${({ theme, active }) =>
      `linear-gradient(90deg, ${theme.success} ${active}%, ${theme.bg3} ${active}%)`};
  }

  &::after {
    display: inline-block;
    content: '${({ active }) => `${active}%`}';
    color: ${({ theme }) => theme.success};
  }
`

export const InlineWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
`

export const Surplus = styled.span`
  color: ${({ theme }) => theme.success};
`

export const RateValue = styled.div``

export const OrderTypeValue = styled.span`
  &:first-letter {
    text-transform: uppercase;
  }
`
