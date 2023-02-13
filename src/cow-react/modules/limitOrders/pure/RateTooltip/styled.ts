import styled from 'styled-components/macro'
import { transparentize } from 'polished'

export const FeeTooltipWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.text1};

  > h3 {
    font-size: 14px;
    font-weight: 500;
    margin: 0 0 12px;
    padding: 0;
  }

  > p {
    font-size: 12px;
    font-weight: 400;
    line-height: 1.2;
    padding: 0;
    margin: 0 0 16px;
    color: ${({ theme }) => transparentize(0.3, theme.text1)};
  }
`

export const FeeItem = styled.div<{ highlighted?: boolean; borderTop?: boolean }>`
  display: flex;
  flex-flow: column wrap;
  align-items: flex-start;
  width: 100%;
  margin: 10px 0 0;
  padding: 10px 0 0;
  background: ${({ theme, highlighted }) => (highlighted ? theme.bg1 : 'transparent')};
  border-top: ${({ theme, borderTop }) => (borderTop ? `1px solid ${transparentize(0.9, theme.text1)}` : 'none')}
  `