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
  padding: 32px;
  gap: 62px;

  > div {
    display: flex;
    flex-flow: column wrap;
  }
`

export const MenuTitle = styled.b`
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 2px;
  display: flex;
  margin: 0 0 6px;
`

export const MenuSection = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: flex-start;
  align-content: flex-start;
  justify-content: flex-start;
  justify-items: flex-start;
  margin: 0;
  gap: 16px;

  a,
  button {
    display: flex;
    background: none;
    appearance: none;
    outline: 0;
    border: 0;
    cursor: pointer;
    font-size: 15px;
    white-space: nowrap;
    font-weight: 500;
    opacity: 0.6;
    transition: opacity 0.2s ease-in-out;
    margin: 0;
    color: ${({ theme }) => theme.text1};
    gap: 12px;

    &:hover {
      opacity: 1;
    }

    &.ACTIVE {
      opacity: 1;
      font-weight: inherit;
    }
  }

  a > svg,
  a > img {
    width: 18px;
    height: auto;
    max-height: 21px;
    object-fit: contain;
    color: ${({ theme }) => theme.text1};
  }
`
