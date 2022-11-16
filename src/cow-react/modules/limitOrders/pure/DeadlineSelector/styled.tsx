import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  background: ${({ theme }) => theme.input.bg1};
  border-radius: 12px;
  padding: 10px 16px;
  flex: 1 1 30%;
  min-height: 80px;
`

export const Title = styled.p`
  display: block;
  margin: 0 0 1rem;
  font-size: 0.75rem;
`

export const Current = styled.button<{ isCustom: boolean }>`
  color: ${({ theme }) => theme.text1};
  font-size: ${({ isCustom }) => (isCustom ? '16px' : '24px')};
  font-weight: 500;
  display: block;
  background: none;
  border: 0;
  outline: none;
  margin: 0;
  padding: 0;
  white-space: nowrap;
  cursor: pointer;

  :hover {
    text-decoration: underline;
  }

  span {
    margin-right: 5px;
  }
`

export const ListWrapper = styled.ul`
  display: block;
  background: ${({ theme }) => theme.cardBackground};
  box-shadow: 0 0 10px 2px ${({ theme }) => theme.bg1};
  margin: 15px 0 0 0;
  padding: 10px 15px;
  border-radius: 20px;
  list-style: none;
`

export const ListItem = styled.button`
  color: ${({ theme }) => theme.text1};
  background: none;
  border: 0;
  outline: none;
  margin: 0 0 10px 0;
  padding: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 400;
  position: relative;

  :hover {
    text-decoration: underline;
  }
`

export const CustomInput = styled.input`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;

  ::-webkit-calendar-picker-indicator {
    position: absolute;
    width: 100%;
    height: 100%;
  }
`
