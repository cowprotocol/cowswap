import { HelpTooltip, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { RateWrapper } from 'common/pure/RateInfo'

export const WarningIndicator = styled.button<{ hasBackground?: boolean }>`
  --height: 28px;
  margin: 0;
  background: ${({ hasBackground = true }) => (hasBackground ? `var(${UI.COLOR_DANGER_BG})` : 'transparent')};
  color: var(${UI.COLOR_DANGER});
  line-height: 0;
  border: 0;
  padding: 0;
  width: auto;
  height: var(--height);
  border-radius: 0 9px 9px 0;

  svg {
    cursor: help;
    color: inherit;
  }

  svg > path {
    fill: currentColor;
    stroke: none;
  }
`

export const WarningContent = styled.div`
  max-width: 270px;
  padding: 10px;

  h3,
  p {
    margin: 0;
    line-height: 1.2;
  }

  h3 {
    margin-bottom: 8px;
  }
`

export const StyledQuestionHelper = styled(HelpTooltip)`
  margin: 0;
`

export const WarningParagraph = styled.div`
  margin-bottom: 20px;

  :last-child {
    margin-bottom: 0;
  }
`

export const WarningActionBox = styled.div`
  margin-top: 15px;
`

export const StatusBox = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`

export const CellElement = styled.div<{
  clickable?: boolean
  doubleRow?: boolean
}>`
  padding: 0;
  font-size: 12px;
  font-weight: 500;
  gap: 5px;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: ${({ doubleRow }) => (doubleRow ? 'flex-start' : 'center')};
  text-align: left;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : '')};

  > b {
    font-weight: 500;
    width: 100%;
    text-align: left;

    &[title] {
      cursor: help;
    }
  }

  > span[title] {
    cursor: help;
  }

  ${({ doubleRow }) =>
    doubleRow &&
    `
    flex-flow: column wrap;
    justify-content: center;
    gap: 2px;

    > i {
      opacity: 0.7;

      &[title] {
        cursor: help;
      }
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

export const CurrencyLogoPair = styled.div<{ clickable?: boolean }>`
  display: flex;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'initial')};

  > div,
  > svg {
    border: 2px solid var(${UI.COLOR_PAPER});
  }

  > div:last-child,
  > svg:last-child {
    margin: 0 0 0 -14px;
  }
`

export const CurrencyCell = styled.div<{ clickable?: boolean }>`
  display: flex;
  flex-flow: row;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : '')};

  &:hover {
    span {
      text-decoration: ${({ clickable }) => (clickable ? 'underline' : '')};
    }
  }
`

export const CurrencyAmountWrapper = styled.div<{ clickable?: boolean }>`
  display: flex;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'initial')};
  flex-flow: column wrap;
  gap: 2px;
`

export const ProgressBarWrapper = styled.div`
  flex: 1;
  align-items: center;
  flex-flow: row nowrap;
  gap: 8px;
  padding: 0;
  font-size: 12px;
  font-weight: 500;
  height: 100%;
  width: 100%;
  max-width: 190px;
  display: flex;
  text-align: left;
  background: transparent;
  justify-content: flex-start;
`

export const ProgressBar = styled.div<{ value: string }>`
  position: relative;
  margin: 0;
  height: 5px;
  width: 100%;
  background: var(${UI.COLOR_TEXT_OPACITY_10});
  border-radius: 6px;

  &::before {
    content: '';
    position: absolute;
    height: 100%;
    width: ${({ value }) => value}%;
    background: var(${UI.COLOR_SUCCESS});
    border-radius: 5px;
  }
`

export const FilledPercentageContainer = styled.div`
  display: grid;
  grid-template-columns: 50px 36px;
  gap: 4px;
  align-items: center;
  width: 100%;
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

export const ExecuteInformationTooltipWarning = styled.div`
  font-weight: 500;
  margin-top: 12px;
`

export const CancelledDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(${UI.COLOR_DANGER});
  font-weight: 500;
  font-size: 12px;
`

export const ExpiredDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(${UI.COLOR_ALERT_TEXT});
`

export const FilledDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(${UI.COLOR_SUCCESS});
`

export const PendingExecutionDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(${UI.COLOR_TEXT});
  font-weight: 500;
  font-size: 12px;
`

export const SigningDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: help;
  color: var(${UI.COLOR_ALERT_TEXT});

  > svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }

  svg > path {
    fill: currentColor;
  }
`
