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

export const Field = styled.div<{ border?: 'rounded-full' | 'rounded-top' | 'rounded-bottom' }>`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: ${({ theme }) => theme.input.bg1};
  margin-bottom: 5px;
  width: 100%;
  border-radius: ${({ border }) => {
    if (border === 'rounded-full') return '1rem'
    else if (border === 'rounded-top') return '1rem 1rem 0 0'
    else if (border === 'rounded-bottom') return '0 0 1rem 1rem'
    else return ''
  }};
`

export const CurrencyField = styled(Field)`
  margin-bottom: 10px;
  flex-direction: column;
  align-items: flex-start;
`

export const CurrencyValue = styled.span`
  font-size: 1.4rem;
  font-weight: 600;
`

export const FieldBody = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  width: 100%;

  & .open-currency-select-button {
    ${({ theme }) => theme.mediaWidth.upToSmall`
      width: auto;
    `}
  }
`

export const FieldTitle = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
`

export const LabelText = styled.span`
  font-size: 0.8rem;
`

export const Label = styled.div``

export const Value = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.8rem;

  & a {
    font-size: 0.9rem;
  }
`

export const Progress = styled.div<{ active: number | string }>`
  position: relative;
  height: 4px;
  width: 150px;
  background: ${({ theme }) => theme.bg3};
  margin-right: 5px;

  &:after {
    content: '';
    position: absolute;
    height: 100%;
    background: green;
    width: ${({ active }) => `${active}%`};
  }
`

export const ProgressPercent = styled.span`
  color: ${({ theme }) => theme.green1};
`

export const InlineWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 0.75rem;

  & > * {
    margin-left: 2px;
  }
`

export const Surplus = styled.span`
  color: ${({ theme }) => theme.green1};
`

export const SurplusValue = styled.strong`
  margin-left: 10px;
`

export const RateValue = styled.div`
  font-size: 12px;
`

export const OrderTypeValue = styled.span`
  &:first-letter {
    text-transform: uppercase;
  }
`
