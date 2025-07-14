import styled from 'styled-components/macro'

export const Wrapper = styled.span`
  display: flex;
  align-items: center;
  flex-flow: row nowrap;
  gap: 0.5rem;

  & > :first-child {
    word-break: break-all;
  }
`

export const Content = styled.div`
  display: inline-block;
  position: relative;
`
