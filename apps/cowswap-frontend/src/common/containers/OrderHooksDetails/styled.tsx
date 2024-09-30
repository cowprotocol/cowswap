import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  position: relative;
  padding-right: 30px;
`

export const HooksList = styled.ul`
  margin: 0;
  padding: 0;
  padding-left: 10px;
`

export const ToggleButton = styled.button`
  cursor: pointer;
  background: none;
  border: 0;
  outline: 0;
  padding: 0;
  margin: 0;
  position: absolute;
  right: 0;
  top: -4px;

  &:hover {
    opacity: 0.7;
  }
`
export const InfoWrapper = styled.div`
  h3 {
    margin: 0;
  }
`
