import styled, { css } from 'styled-components/macro'

export const Root = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  padding: 12px 16px;
  overflow: hidden;
`

export const Row = styled.div<{ $stacked?: boolean }>`
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  align-items: center;
  align-content: center;
  justify-content: center;
  gap: 32px;
  flex: 1;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  max-height: 100%;

  ${({ $stacked }) =>
    $stacked &&
    css`
      flex-direction: column;
      gap: 8px;
    `}
`

export const TimerColumn = styled.div<{ $stacked?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: start;
  gap: 4px;
  width: 204px;
  flex: 0 1 204px;
  min-width: 0;

  ${({ $stacked }) =>
    $stacked &&
    css`
      width: auto;
      flex: 0 0 auto;
      align-items: center;
      text-align: center;
    `}
`

export const TimerLabel = styled.span`
  font-size: 13px;
  line-height: 18px;
  width: 100%;
`

export const GlassBox = styled.div<{ $stacked?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 0 1 150px;
  min-width: 0;
  min-height: 0;
  height: 100%;
  max-height: 100%;
  width: auto;
  max-width: 150px;

  > svg {
    width: auto;
    height: 100%;
    max-width: 150px;
    max-height: 100%;
  }

  ${({ $stacked }) =>
    $stacked &&
    css`
      flex: 1 1 auto;
      width: auto;
      height: auto;
      max-width: 100px;

      > svg {
        width: auto;
        height: 100%;
        max-width: 100px;
        max-height: 100%;
      }
    `}
`
