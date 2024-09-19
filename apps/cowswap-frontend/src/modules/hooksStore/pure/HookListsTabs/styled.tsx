import styled from 'styled-components/macro'

export const TabsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  margin-top: 10px;

  > button {
    width: 50%;
  }
`

export const Tab = styled.button<{ active$: boolean }>`
  background: none;
  margin: 0;
  outline: none;
  border: 0;
  cursor: pointer;
  color: inherit;
  opacity: ${({ active$ }) => (active$ ? 1 : 0.5)};
  padding: 10px;
  font-size: 16px;
  font-weight: 600;

  &:disabled {
    cursor: default;
  }
`
