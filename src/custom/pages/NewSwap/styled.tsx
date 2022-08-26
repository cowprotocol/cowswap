import styled from 'styled-components/macro'
import { CurrencyInputPanel } from 'pages/LimitOrder/pureComponents/CurrencyInputPanel'

export const Container = styled.div`
  max-width: 460px;
  width: 100%;
  padding: 12px 10px;

  border: 3px solid ${({ theme }) => theme.black};
  border-radius: 16px;
  box-shadow: 4px 4px 0 ${({ theme }) => theme.black};
  background: ${({ theme }) => theme.bg1};
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 12px 4px;
  margin: 5px 0 15px 0;

  font-weight: 500;
  font-size: 16px;
`

export const DestCurrencyInputPanel = styled(CurrencyInputPanel)`
  border-radius: 20px 20px 0 0;
  border-bottom: 0;
`
