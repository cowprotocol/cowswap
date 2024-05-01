import { HelpTooltip, UI } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import styled from 'styled-components/macro'


import { RateWrapper } from 'common/pure/RateInfo'

export const WarningIndicator = styled.button<{ hasBackground?: boolean }>`
  --height: 28px;
  margin: 0;
  background: ${({ hasBackground = true }) => (hasBackground ? `var(${UI.COLOR_ALERT_BG})` : 'transparent')};
  color: var(${UI.COLOR_ALERT_TEXT});
  line-height: 0;
  border: 0;
  padding: 0 5px;
  width: auto;
  height: var(--height);
  border-radius: 0 9px 9px 0;

  svg {
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
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }
`

export const CellElement = styled.div<{
  clickable?: boolean
  doubleRow?: boolean
  hasBackground?: boolean
}>`
  padding: 0 ${({ hasBackground }) => (hasBackground ? '10px' : '0')};
  font-size: 12px;
  font-weight: 500;
  gap: 5px;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: ${({ doubleRow }) => (doubleRow ? 'flex-start' : 'center')};
  text-align: left;
  background: ${({ hasBackground }) =>
    hasBackground ? `linear-gradient(90deg, var(${UI.COLOR_TEXT_OPACITY_10}) 0%, transparent 100%)` : 'transparent'};
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
      opacity: 0.7;
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
  flex-flow: row wrap;
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
  width: 100%;
  max-width: 50%;
  align-items: center;
  flex-flow: row nowrap;
  gap: 8px;
  flex-direction: row-reverse;
  padding: 0;
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

export const ToggleExpandButton = styled.div<{ isCollapsed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 9px;
  width: 100%;
  height: 28px;

  background: linear-gradient(90deg, transparent 0%, ${({ theme }) => transparentize(theme.bg1, 0.7)} 100%);
  background-size: 200% 100%;
  background-position: 100% 0;

  border: 1px solid ${({ theme }) => transparentize(theme.text, 0.8)};
  padding: 0 6px 0 10px;
  cursor: pointer;
  transition: background 0.5s ease-in-out;

  &:hover {
    animation: gradientMove 3s linear infinite;
  }

  @keyframes gradientMove {
    0% {
      background-position: 100% 0;
    }
    50% {
      background-position: 0 0;
    }
    100% {
      background-position: 100% 0;
    }
  }

  @keyframes changeOpacity {
    0% {
      background: linear-gradient(90deg, transparent 0%, ${({ theme }) => theme.bg1} 100%);
    }
    50% {
      background: linear-gradient(90deg, transparent 0%, ${({ theme }) => transparentize(theme.bg1, 0.1)} 100%);
    }
    100% {
      background: linear-gradient(90deg, transparent 0%, ${({ theme }) => transparentize(theme.bg1, 0.5)} 100%);
    }
  }

  > i {
    font-style: normal;
    font-size: 12px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > button {
    --size: 17px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 0;
    padding: 0;
    margin: 0 0 0 6px;
    cursor: pointer;
    outline: none;
    color: inherit;
    transition: color 0.2s ease-out;
    position: relative;
    height: var(--height);
    transition: all 0.3s;
    width: var(--size);
    height: var(--size);
    min-width: var(--size);
    min-height: var(--size);
    line-height: 1;
    background: transparent;
    border: 1px solid ${({ theme }) => transparentize(theme.text, 0.8)};
    border-radius: 6px;
    user-select: none;
  }

  > button::before,
  > button::after {
    content: '';
    transform: rotate(0);
    top: 7px;
    inset-inline-end: 3px;
    inset-inline-start: 3px;
    height: 1px;
    position: absolute;
    background: currentcolor;
    transition: transform 0.5s ease-in-out;
  }

  > button::after {
    transform: ${({ isCollapsed }) => (isCollapsed ? 'rotate(90deg)' : 'rotate(0deg)')};
  }
`
