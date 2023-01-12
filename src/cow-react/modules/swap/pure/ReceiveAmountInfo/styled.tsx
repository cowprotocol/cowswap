import styled from 'styled-components/macro'
import { transparentize } from 'polished'

export const Box = styled.div`
  --gap: 4px;
  display: flex;
  flex-flow: column wrap;
  gap: var(--gap);
`

export const TextAmount = styled.span`
  display: grid;
  grid-template-columns: 1fr 5px max-content max-content;
  align-items: center;

  > span {
    text-align: left;
  }

  > span:nth-child(1) {
    text-align: right;
  }

  > span:nth-child(2) {
    text-align: center;
  }

  > span:nth-child(4) {
    padding: 0 0 0 4px;
  }
`

export const GreenText = styled.span`
  color: ${({ theme }) => theme.green1};
  text-align: right;
`

export const Column = styled.div<{ isTotal?: boolean }>`
  display: grid;
  grid-template-columns: auto max-content;
  gap: 24px;
  border-top: ${({ theme, isTotal }) => (isTotal ? `1px solid ${transparentize(0.7, theme.text1)}` : 'none')};
  font-weight: ${({ theme, isTotal }) => (isTotal ? `bold` : 'normal')};
  padding: ${({ theme, isTotal }) => (isTotal ? `calc(var(--gap) * 2) 0 0` : '0')};
  margin: ${({ theme, isTotal }) => (isTotal ? `calc(var(--gap) * 2) 0 0` : '0')};
`
