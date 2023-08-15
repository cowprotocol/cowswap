import styled from 'styled-components/macro'

export const ButtonSecondary = styled.button`
  background: var(--cow-color-lightBlue-opacity-90);
  color: var(--cow-color-lightBlue);
  font-size: 12px;
  font-weight: 600;
  border: 0;
  box-shadow: none;
  border-radius: 12px;
  position: relative;
  transition: background 0.2s ease-in-out;
  min-height: 35px;
  padding: 0 12px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: var(--cow-color-lightBlue-opacity-80);
  }
`
