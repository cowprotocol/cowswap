import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  padding: 16px;
  border-radius: 16px;
  background: ${({ theme }) => theme.bg1};
  width: 100%;
`

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

export const Title = styled.h3`
  font-size: 1rem;
  margin: 0;
`

export const Body = styled.div``

export const Field = styled.div<{ border: 'rounded-full' | 'rounded-top' | 'rounded-bottom' }>`
  display: flex;
  flex-flow: row wrap;
  align-content: space-between;
  padding: 1rem;
  background: ${({ theme }) => theme.input.bg1};
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
`

export const FieldTitle = styled.span`
  font-size: 0.8rem;
`
