import { transparentize } from 'polished'
import styled from 'styled-components/macro'

export const FeeTooltipWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.text1};
`

export const FeeItem = styled.div<{ highlighted?: boolean; borderTop?: boolean }>`
  display: flex;
  flex-flow: ${({ highlighted }) => (highlighted ? 'row' : 'column wrap')};
  align-items: flex-start;
  width: 100%;
  margin: ${({ highlighted }) => (highlighted ? '10px 0 0' : '0')};
  padding: ${({ borderTop }) => (borderTop ? '16px 10px 10px' : '10px')};
  border-radius: ${({ highlighted }) => (highlighted ? '10px' : '0')};
  background: ${({ theme, highlighted }) => (highlighted ? theme.bg1 : 'transparent')};
  border-top: ${({ theme, borderTop }) => (borderTop ? `1px solid ${transparentize(0.9, theme.text1)}` : 'none')};
  gap: 4px;

  > i {
    font-size: 12px;
    font-style: normal;
    color: ${({ theme }) => transparentize(0.3, theme.text1)};
    max-width: 60%;
    min-width: 50%;
    font-weight: 300;
  }

  > span {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;
    text-align: right;
    width: 100%;
  }

  > span > p {
    margin: 0;
  }
`
