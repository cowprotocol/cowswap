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
    color: inherit;
    font-size: inherit;
    font-weight: 400;
    hyphens: auto;
    margin: 0 0 4px;
    opacity: 0.7;
    overflow-wrap: normal;
    word-break: normal;
  }

  > strong {
    font-size: 22px;
    font-weight: 800;
    hyphens: auto;
    margin: 0;
    overflow-wrap: normal;
    word-break: normal;
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
    align-items: flex-start;
    background: transparent;
    border-radius: 10px;
    display: grid;
    gap: 6px;
    grid-template-columns: 20px auto;
    grid-template-rows: max-content;
    hyphens: auto;
    margin: 0;
    overflow-wrap: normal;
    padding: 10px;
    position: relative;
    word-break: normal;

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
    color: inherit;
    display: block;
    hyphens: auto;
    margin: 0 0 1.2rem;
    overflow-wrap: normal;
    word-break: normal;
  }
`
