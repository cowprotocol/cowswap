import styled from 'styled-components/macro'

export const MenuFlyout = styled.ol`
  display: flex;
  padding: 0;
  margin: 0;
  position: relative;
`
export const Content = styled.div`
  display: flex;
  position: absolute;
  top: 100%;
  left: 0;
  background: red;
  border-radius: 16px;
  background: #091e32;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.25);
  padding: 16px;
  gap: 16px;

  > div {
    display: flex;
    flex-flow: column wrap;
  }
`
