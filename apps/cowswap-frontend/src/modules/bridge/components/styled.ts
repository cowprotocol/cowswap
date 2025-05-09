import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled, { css, keyframes } from 'styled-components/macro'

import { StopStatusEnum } from './SwapStopDetails'

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

export const StyledSpinnerIcon = styled(SVG)`
  transform-origin: center;
  animation: ${spin} 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
`

export const Wrapper = styled.div<{ hasBackground?: boolean }>`
  display: flex;
  flex-flow: column wrap;
  gap: 7px;
  padding: ${({ hasBackground }) => (hasBackground ? '12px' : '0')};
  font-size: 13px;
  width: 100%;
  border-radius: ${({ hasBackground }) => (hasBackground ? '16px' : '0')};
  background-color: ${({ hasBackground }) => (hasBackground ? `var(${UI.COLOR_PAPER_DARKER})` : 'transparent')};
`

const stopCircleBase = css`
  --size: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  font-weight: var(${UI.FONT_WEIGHT_BOLD});
  font-size: 13px;
  flex-shrink: 0;
  position: relative;

  > svg {
    width: calc(var(--size) - 5px);
    height: calc(var(--size) - 5px);
    display: block;

    path {
      fill: currentColor;
    }
  }
`

export const StopNumberCircle = styled.div<{
  status?: StopStatusEnum
  stopNumber?: number
}>`
  ${stopCircleBase}

  ${({ status, stopNumber }) => {
    switch (status) {
      case StopStatusEnum.DONE:
        return css`
          background-color: var(${UI.COLOR_SUCCESS_BG});
          color: var(${UI.COLOR_SUCCESS_TEXT});
          padding: 6px;
          &::before {
            content: none;
          }
        `
      case StopStatusEnum.PENDING:
        return css`
          background-color: ${`var(${UI.COLOR_INFO_BG})`};
          color: ${`var(${UI.COLOR_INFO_TEXT})`};
          &::before {
            content: none;
          }
        `
      case StopStatusEnum.FAILED:
        return css`
          background-color: var(${UI.COLOR_ALERT_BG});
          color: var(${UI.COLOR_ALERT_TEXT});
          padding: 6.5px;
          &::before {
            content: none;
          }
        `
      case StopStatusEnum.REFUND_COMPLETE:
        return css`
          background-color: var(${UI.COLOR_ALERT_BG});
          color: var(${UI.COLOR_ALERT_TEXT});
          padding: 6.5px;
          &::before {
            content: none;
          }
        `
      case StopStatusEnum.DEFAULT:
      default:
        return css`
          background-color: var(${UI.COLOR_TEXT_OPACITY_15});
          color: var(${UI.COLOR_TEXT});
          &::before {
            content: '${stopNumber}';
          }
        `
    }
  }}
`

export const StopTitle = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 6px;
  margin: 0 0 0 -4px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
  font-size: 14px;
  position: relative;

  > b {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
  }
`

export const RouteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`

export const RouteTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
`

export const StopsInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
`

export const Link = styled.a`
  text-decoration: none;
  color: inherit;

  &:hover {
    text-decoration: underline;
  }
`

export const RecipientWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`

export const NetworkLogoWrapper = styled.div<{ size?: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: ${({ size = 16 }) => size}px;
  height: ${({ size = 16 }) => size}px;
  overflow: hidden;

  > img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: contain;
  }
`

export const AmountWithTokenIcon = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: flex-end;
  text-align: right;
  gap: 4px;
  word-break: break-word;
  line-height: 1;

  > i {
    font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
    letter-spacing: -0.2px;
  }
`

export const TokenFlowContainer = styled.div`
  display: flex;
  align-items: center;
  flex-flow: row wrap;
  gap: 4px;
  margin: 0 auto 0 0;
  width: 100%;
`

export const ArrowIcon = styled.span`
  font-size: 13px;
  line-height: 1;
`

// Toggle arrow component for the collapsible header
export const ToggleArrow = styled.div<{ isOpen: boolean }>`
  --size: var(${UI.ICON_SIZE_SMALL});
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform var(${UI.ANIMATION_DURATION}) ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);

  > svg {
    --size: var(${UI.ICON_SIZE_TINY});
    width: var(--size);
    height: var(--size);
    object-fit: contain;
    transition: fill var(${UI.ANIMATION_DURATION}) ease-in-out;

    path {
      fill: var(${UI.COLOR_TEXT_OPACITY_70});
    }
  }
`

// Modified StopsInfo to include toggle arrow when collapsible
export const CollapsibleStopsInfo = styled(StopsInfo)`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  transition: all var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    color: var(${UI.COLOR_TEXT});

    ${ToggleArrow} {
      > svg {
        path {
          fill: var(${UI.COLOR_TEXT});
        }
      }
    }
  }
`

// Add a styled version of RouteHeader with clickable behavior
export const ClickableRouteHeader = styled(RouteHeader)`
  cursor: pointer;

  &:hover {
    ${RouteTitle} {
      color: var(${UI.COLOR_TEXT});
    }
    ${CollapsibleStopsInfo} {
      color: var(${UI.COLOR_TEXT});
      ${ToggleArrow} > svg > path {
        fill: var(${UI.COLOR_TEXT});
      }
    }
  }
`

// Clickable version of StopTitle (for sections)
export const ClickableStopTitle = styled(StopTitle)<{ isCollapsible?: boolean }>`
  cursor: ${({ isCollapsible }) => (isCollapsible ? 'pointer' : 'default')};

  &:hover {
    opacity: ${({ isCollapsible }) => (isCollapsible ? 0.8 : 1)};

    ${({ isCollapsible }) =>
      isCollapsible &&
      `
      ${ToggleArrow} > svg > path {
         fill: var(${UI.COLOR_TEXT});
      }
    `}
  }
`

// Absolutely positioned toggle icon container (for sections)
export const ToggleIconContainer = styled.div`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
`

// Section content that can be collapsed
export const SectionContent = styled.div<{ isExpanded: boolean }>`
  display: ${({ isExpanded }) => (isExpanded ? 'flex' : 'none')};
  flex-flow: column wrap;
  gap: 4px;
  padding: 0;
  font-size: 13px;
  width: 100%;
  overflow: hidden;
  transition:
    max-height var(${UI.ANIMATION_DURATION}) ease-in-out,
    opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  max-height: ${({ isExpanded }) => (isExpanded ? '1000px' : '0')};
  opacity: ${({ isExpanded }) => (isExpanded ? 1 : 0)};
`

// Basic definition for ConfirmDetailsItem - adjust as needed
export const ConfirmDetailsItem = styled.div<{
  withTimelineDot?: boolean
  isLast?: boolean
  contentTextColor?: string
}>`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  padding-left: ${({ withTimelineDot }) => (withTimelineDot ? '20px' : '0')};
  position: relative;
  min-height: 18px;

  ${({ withTimelineDot }) =>
    withTimelineDot &&
    `
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(${UI.COLOR_TEXT_OPACITY_15});
    }

    &:not(:last-child)::after {
       content: '';
       position: absolute;
       left: 3px;
       top: 14px;
       bottom: -5px;
       width: 2px;
       background-color: var(${UI.COLOR_TEXT_OPACITY_15});
     }
  `}

  > :last-child {
    color: ${({ contentTextColor }) => contentTextColor || 'inherit'};
  }
`

// Basic definition for DividerHorizontal - adjust as needed
export const DividerHorizontal = styled.hr<{ margin?: string; overrideColor?: string }>`
  border: none;
  border-top: 1px solid ${({ overrideColor }) => overrideColor || `var(${UI.COLOR_BORDER})`};
  margin: ${({ margin = '8px 0' }) => margin};
  width: 100%;
`

// Definition for ReceiveAmountTitle - adjust as needed
export const ReceiveAmountTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
`
