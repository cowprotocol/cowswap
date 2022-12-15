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
  margin: 0 0 42px;
  padding: 0 16px;
  font-size: 14px;
  gap: 20px 24px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr;
  `}

  > li {
    display: grid;
    grid-template-columns: 20px auto;
    align-items: flex-start;
    gap: 4px;
    margin: 0;
    padding: 0;
  }

  > li > span {
    --size: 18px;
    width: var(--size);
    height: var(--size);
    display: block;
  }

  > li > span > svg {
    width: var(--size);
    height: var(--size);
    display: block;
  }

  > li > span > svg > path {
    fill: ${({ theme }) => theme.success};
  }

  > li[data-icon='progress'] > span > svg > path {
    fill: ${({ theme }) => theme.warning};
  }
`

export const ControlSection = styled.div`
  text-align: center;

  & a {
    margin-bottom: 1.2rem;
    display: block;
  }
`

export const Item = styled.div`
  display: flex;
  padding: 10px 5px;
  font-size: 0.8rem;
`

export const Icon = styled.div<{ type: string }>`
  margin-right: 10px;
  color: ${({ type, theme }) => {
    if (type === 'completed') return theme.green1
    if (type === 'pending') return theme.yellow1
    return theme.primary1
  }};
`
