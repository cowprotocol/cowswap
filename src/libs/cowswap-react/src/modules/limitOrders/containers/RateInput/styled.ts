import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import Loader from 'legacy/components/Loader'
import Input from 'legacy/components/NumericalInput'

export const Wrapper = styled.div`
  background: ${({ theme }) => theme.grey1};
  border-radius: 16px;
  padding: 10px 16px;
  flex: 1 1 70%;
  min-height: 80px;
  justify-content: space-between;
  display: flex;
  flex-flow: row wrap;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap: 10px;
  `}
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 500;
  width: 100%;
  color: ${({ theme }) => transparentize(0.3, theme.text1)};
`

export const MarketPriceButton = styled.button`
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1};
  white-space: nowrap;
  border: none;
  font-weight: 500;
  cursor: pointer;
  border-radius: 9px;
  padding: 5px 8px;
  font-size: 11px;

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
`

export const NumericalInput = styled(Input)<{ $loading: boolean }>`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  width: 100%;
  text-align: left;

  &::placeholder {
    color: ${({ theme }) => transparentize(0.3, theme.text1)};
  }
`

export const ActiveCurrency = styled.button`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border: none;
  background: none;
  padding: 0;
  margin: 0 0 0 auto;
  gap: 8px;
  max-width: 130px;
  width: auto;
  cursor: pointer;
`

export const ActiveSymbol = styled.span`
  color: ${({ theme }) => theme.text1};
  font-size: 13px;
  font-weight: 500;
  text-align: right;
  padding: 10px 0;
`

export const ActiveIcon = styled.div`
  --size: 20px;
  background-color: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1};
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
  background: ${({ theme }) => theme.bg1};
  border: 2px solid ${({ theme }) => theme.grey1};

  > b {
    display: flex;
    flex-flow: row nowrap;
    font-weight: normal;
    text-align: left;
    color: ${({ theme }) => transparentize(0.3, theme.text1)};
  }

  // TODO: Make the question helper icon transparent through a prop instead
  > b svg {
    opacity: 0.7;
    transition: opacity 0.2s ease-in-out;

    &:hover {
      opacity: 1;
    }
  }

  > span > i {
    font-style: normal;
    color: ${({ theme }) => transparentize(0.3, theme.text1)};
  }
`
