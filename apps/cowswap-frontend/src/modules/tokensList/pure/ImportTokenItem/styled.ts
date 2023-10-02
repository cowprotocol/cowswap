import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 20px;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`
