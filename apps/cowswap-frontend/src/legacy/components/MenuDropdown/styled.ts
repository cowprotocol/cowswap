import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

export const MenuFlyout = styled.ol`
  display: flex;
  padding: 0;
  margin: 0;
  position: relative;

  > button {
    &.expanded {
      border: none;
    }

    &:hover {
      &::after {
        content: '';
        display: block;
        position: absolute;
        height: 18px;
        width: 100%;
        bottom: -18px;
        left: 0;
        background: transparent;

        ${({ theme }) => theme.mediaWidth.upToLarge`
          content: none;
        `};
      }
    }

    > svg {
      margin: 0 0 0 3px;
      width: 16px;
      height: 6px;
      object-fit: contain;
    }

    > svg.expanded {
      transition: transform 0.3s ease-in-out;
      transform: rotate(180deg);
    }
  }
`

export const Content = styled.div`
  display: flex;
  position: absolute;
  top: 100%;
  left: 0;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => transparentize(0.6, theme.white)};
  background: var(${UI.COLOR_CONTAINER_BG_01});
  box-shadow: ${({ theme }) => theme.boxShadow2};
  padding: 32px;
  gap: 62px;
  margin: 6px 0 0;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    box-shadow: none;
    background: transparent;
    padding: 0;
    position: relative;
    top: initial;
    left: initial;
    border-radius: 0;
    display: flex;
    flex-flow: column wrap;
  `};

  > div {
    display: flex;
    flex-flow: column wrap;
  }
`

export const MenuTitle = styled.b`
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 600;
  opacity: 0.75;
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
    background: transparent;
    appearance: none;
    outline: 0;
    border: 0;
    cursor: pointer;
    font-size: 15px;
    white-space: nowrap;
    font-weight: 500;
    margin: 0;
    padding: 0;
    color: var(${UI.COLOR_TEXT1});
    opacity: 0.8;
    transition: opacity 0.15s ease-in-out;

    > svg,
    > img {
      width: 18px;
      height: auto;
      max-height: 21px;
      margin: 0 7px 0 0;
      object-fit: contain;
      color: var(${UI.COLOR_TEXT1});
    }

    > svg > path {
      fill: var(${UI.COLOR_TEXT1});
    }

    &:hover {
      text-decoration: underline;
      font-weight: 500;
      opacity: 1;
    }

    &.ACTIVE {
      font-weight: bold;
    }
  }
`
