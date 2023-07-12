import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import { RateWrapper } from 'common/pure/RateInfo'

export const WarningIndicator = styled.button<{ hasBackground?: boolean }>`
  --height: 28px;
  margin: 0;
  background: ${({ theme, hasBackground = true }) =>
    hasBackground
      ? theme.darkMode
        ? transparentize(0.9, theme.alert)
        : transparentize(0.85, theme.alert)
      : 'transparent'};
  color: ${({ theme }) => theme.alert};
  line-height: 0;
  border: 0;
  padding: 0 5px;
  width: auto;
  height: var(--height);
  border-radius: 0 9px 9px 0;

  svg > path {
    fill: ${({ theme }) => theme.alert};
  }
`

export const WarningContent = styled.div`
  max-width: 270px;
  padding: 10px;
  color: ${({ theme }) => theme.black};

  h3,
  p {
    margin: 0;
    line-height: 1.2;
  }

  h3 {
    margin-bottom: 8px;
  }
`

export const WarningParagraph = styled.div`
  margin-bottom: 20px;

  :last-child {
    margin-bottom: 0;
  }
`

export const RateValue = styled.span``

export const StatusBox = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`

export const AmountItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    white-space: normal;
  `};

  > div {
    display: flex;
    align-items: center;
  }

  > span {
    white-space: normal;
    word-break: break-all;
    max-width: 150px;
    display: inline;
  }

  > span > span {
    color: ${({ theme }) => transparentize(0.3, theme.text1)};
  }
`

export const CellElement = styled.div<{ clickable?: boolean; doubleRow?: boolean; hasBackground?: boolean }>`
  padding: 0 ${({ hasBackground }) => (hasBackground ? '10px' : '0')};
  font-size: 12px;
  font-weight: 500;
  gap: 5px;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: ${({ doubleRow }) => (doubleRow ? 'flex-start' : 'center')};
  text-align: left;
  background: ${({ theme, hasBackground }) => (hasBackground ? transparentize(0.92, theme.text3) : 'transparent')};
  cursor: ${({ clickable }) => (clickable ? 'pointer' : '')};

  > b {
    font-weight: 500;
  }

  ${({ doubleRow }) =>
    doubleRow &&
    `
    flex-flow: column wrap;
    justify-content: center;
    gap: 2px;

    > i {
      opacity: 0.6;
    }
  `}

  ${RateWrapper} {
    font-weight: 500;
    font-size: 12px;
    white-space: normal;
    word-break: break-all;
  }
`

export const PriceElement = styled(CellElement)`
  cursor: pointer;
`

export const CurrencyLogoPair = styled.div`
  display: flex;

  > img,
  > svg {
    border: 2px solid ${({ theme }) => theme.grey1};
  }

  > img:last-child,
  > svg:last-child {
    margin: 0 0 0 -14px;
  }
`

export const CurrencyCell = styled.div<{ clickable?: boolean }>`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : '')};

  :hover {
    text-decoration: ${({ clickable }) => (clickable ? 'underline' : '')};
  }
`

export const CurrencyAmountWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 2px;
`

export const ProgressBarWrapper = styled.div`
  width: 100%;
  max-width: 50%;
  align-items: center;
  flex-flow: row nowrap;
  gap: 8px;
  flex-direction: row-reverse;
  padding: 0 0;
  font-size: 12px;
  font-weight: 500;
  height: 100%;
  display: flex;
  text-align: left;
  background: transparent;
  justify-content: center;

  > b {
    line-height: 1;
  }
`

export const ProgressBar = styled.div<{ value: number }>`
  position: relative;
  margin: 0;
  height: 5px;
  width: 100%;
  background: ${({ theme }) => (theme.darkMode ? theme.bg1 : transparentize(0.92, theme.text1))};
  border-radius: 6px;

  &::before {
    content: '';
    position: absolute;
    height: 100%;
    width: ${({ value }) => value}%;
    background: ${({ theme }) => theme.text3};
    border-radius: 5px;
  }
`

export const ExecuteCellWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 4px;
`

export const ExecuteInformationTooltip = styled.div`
  display: flex;
  flex-flow: row wrap;
  padding: 0;
  margin: 0;
`
