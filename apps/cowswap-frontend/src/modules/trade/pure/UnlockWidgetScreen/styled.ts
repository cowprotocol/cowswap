import { Media, UI } from '@cowprotocol/ui'

import { transparentize, darken } from 'color2k'
import styled from 'styled-components/macro'

export const Container = styled.div`
  padding: 16px;
  border-radius: 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
`

export const TitleSection = styled.div`
  text-align: center;
  font-size: 20px;
  color: inherit;
  margin: 24px auto 42px;

  > h3 {
    font-weight: 400;
    font-size: inherit;
    margin: 0 0 4px;
    color: inherit;
    opacity: 0.7;
  }

  > strong {
    font-weight: 800;
    font-size: 22px;
    margin: 0;
  }
`

export const List = styled.ul`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: max-content;
  list-style: none;
  margin: 0 0 28px;
  padding: 0;
  font-size: 14px;
  gap: 10px 12px;

  ${Media.upToSmall()} {
    grid-template-columns: 1fr;
  }

  > li {
    background: transparent;
    display: grid;
    grid-template-columns: 20px auto;
    grid-template-rows: max-content;
    align-items: flex-start;
    gap: 6px;
    margin: 0;
    padding: 10px;
    border-radius: 10px;
    position: relative;

    &[data-is-new='true'] {
      background: ${({ theme }) => transparentize(theme.success, 0.87)};

      &::after {
        content: 'NEW!';
        position: absolute;
        right: -2px;
        top: -7px;
        display: block;
        padding: 3px 5px;
        background: ${({ theme }) => theme.success};
        color: ${({ theme }) => (theme.darkMode ? darken(theme.success, 0.5) : theme.white)};
        border-radius: 10px;
        font-size: 9px;
        font-weight: bold;
        text-decoration: none;
      }
    }
  }

  > li > span {
    --size: 18px;
    width: var(--size);
    height: var(--size);
    display: inline-block;
    width: auto;
  }

  > li > span > svg {
    width: var(--size);
    height: var(--size);
    display: block;
  }

  > li > span > svg > path {
    fill: var(${UI.COLOR_SUCCESS});
  }
`

export const ControlSection = styled.div`
  text-align: center;
  color: inherit;

  & span {
    margin: 0 0 1.2rem;
    display: block;
    color: inherit;
  }
`
