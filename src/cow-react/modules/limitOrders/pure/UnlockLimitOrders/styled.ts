import styled from 'styled-components/macro'
import { transparentize, darken } from 'polished'

export const Container = styled.div`
  padding: 16px;
  border-radius: 16px;
  background: ${({ theme }) => (theme.darkMode ? darken(0.03, theme.bg1) : theme.grey1)};
`

export const TitleSection = styled.div`
  text-align: center;
  font-size: 24px;
  color: ${({ theme }) => theme.text1};
  margin: 24px auto 42px;

  > h3 {
    font-weight: 700;
    font-size: inherit;
    margin: 0 0 4px;
  }

  > span {
    font-weight: 500;
    font-size: inherit;
    color: ${({ theme }) => transparentize(0.3, theme.text1)};
    margin: 0;
  }
`

export const List = styled.ul`
  display: grid;
  grid-template-columns: 1fr 1fr;
  list-style: none;
  margin: 0 0 28px;
  padding: 0;
  font-size: 14px;
  gap: 10px 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr;
  `}

  > li {
    background: transparent;
    display: grid;
    grid-template-columns: 20px auto;
    align-items: flex-start;
    gap: 6px;
    margin: 0;
    padding: 10px;
    border-radius: 10px;
    position: relative;

    &[data-is-new='true'] {
      background: ${({ theme }) => transparentize(0.87, theme.success)};

      &::after {
        content: 'NEW!';
        position: absolute;
        right: -2px;
        top: -7px;
        display: block;
        padding: 3px 5px;
        background: ${({ theme }) => theme.success};
        color: ${({ theme }) => (theme.darkMode ? darken(0.5, theme.success) : theme.white)};
        border-radius: 10px;
        font-size: 9px;
        font-weight: bold;
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
    fill: ${({ theme }) => theme.success};
  }
`

export const ControlSection = styled.div`
  text-align: center;

  & a {
    margin-bottom: 1.2rem;
    display: block;
  }
`
