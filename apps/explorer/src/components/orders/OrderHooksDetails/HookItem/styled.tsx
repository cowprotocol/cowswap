import styled from 'styled-components/macro'

export const Item = styled.li`
  list-style: none;
  margin: 0;
  padding: 0;
`

export const Wrapper = styled.a`
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;

  > img {
    width: 30px;
    height: 30px;
  }
`
