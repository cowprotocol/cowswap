import { transparentize } from 'polished'
import styled from 'styled-components/macro'

export const FeeTooltipWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.text1};
`

export const Content = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 5px 10px;

  > p {
    font-size: 13px;
    font-weight: 400;
    line-height: 1.5;
    padding: 0;
    margin: 0;
    color: ${({ theme }) => theme.text1};
  }

  > h3 {
    font-size: 14px;
    font-weight: 600;
    margin: 21px 0 0;
    padding: 0;
    text-align: left;
    width: 100%;
  }
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

export const StatusList = styled.ol`
  display: flex;
  flex-flow: row wrap;
  list-style: none;
  font-size: 12px;
  font-weight: 400;
  gap: 5px;
  padding: 0;

  > li {
    display: flex;
    gap: 5px;
    align-items: center;
    width: 100%;
  }
`
