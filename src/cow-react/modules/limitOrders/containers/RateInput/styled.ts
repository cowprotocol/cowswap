import styled from 'styled-components/macro'
import Input from 'components/NumericalInput'
import Loader from 'components/Loader'

export const Wrapper = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 12px;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  flex: 3;
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
`

export const MarketPriceButton = styled.button`
  background-color: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1};
  border: none;
  cursor: pointer;
  border-radius: 16px;
  padding: 5px 10px;
`

export const Body = styled.div`
  padding: 0.5rem 0;
  display: flex;
`

export const InputWrapper = styled.div`
  flex: 1;
`

export const NumericalInput = styled(Input)<{ $loading: boolean }>`
  background: none;
  border: none;
  width: 100%;
  text-align: left;
`

export const ActiveCurrency = styled.button`
  display: flex;
  align-items: center;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
`

export const ActiveSymbol = styled.span`
  color: ${({ theme }) => theme.text1};
  font-size: 0.85rem;
  margin-right: 5px;
  font-weight: 500;
`

export const ActiveIcon = styled.div`
  background-color: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1};
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const RateLoader = styled(Loader)`
  margin: 5px;
`
