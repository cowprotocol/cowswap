import { Media, UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled, { css, keyframes } from 'styled-components/macro'

import { StopStatusEnum } from '../../utils/status'

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

export const TokenFlowContainer = styled.div`
  display: flex;
  align-items: center;
  flex-flow: row wrap;
  gap: 0 4px;
  margin: 0 auto 0 0;
  width: 100%;
`

export const ArrowIcon = styled.span`
  font-size: 13px;
  line-height: 1;
`

export const ToggleArrow = styled.div<{ isOpen: boolean }>`
  --size: 12px;
  width: var(--size);
  height: var(--size);
  object-fit: contain;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform var(${UI.ANIMATION_DURATION}) ease-in-out;
  margin-left: 6px;

  > svg {
    width: 100%;
    height: 100%;
    object-fit: contain;

    > path {
      fill: currentColor;
    }
  }
`

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

export const ToggleIconContainer = styled.div`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
`

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

export const ReceiveAmountTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
`

export const Link = styled.a<{ underline?: boolean }>`
  text-decoration: ${({ underline }) => (underline ? 'underline' : 'none')};
  color: inherit;

  &:hover {
    text-decoration: underline;
  }
`

export const Wrapper = styled.div<{ hasBackground?: boolean }>`
  width: 100%;
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  background: ${({ hasBackground }) => (hasBackground ? `var(${UI.COLOR_PAPER_DARKER})` : 'transparent')};
  display: flex;
  flex-flow: column wrap;
  gap: 4px;
  padding: ${({ hasBackground }) => (hasBackground ? '16px' : '0')};
  box-sizing: border-box;

  ${Media.upToSmall()} {
    padding: ${({ hasBackground }) => (hasBackground ? '10px' : '0')};
  }
`

export const RouteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 3px 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  margin-bottom: 4px;
`

export const ClickableRouteHeader = styled(RouteHeader)`
  cursor: pointer;
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    color: var(${UI.COLOR_TEXT});
  }
`

export const RouteTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
`

export const StopsInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
`

export const CollapsibleStopsInfo = styled(StopsInfo)`
  display: flex;
  align-items: center;
`

export const DividerHorizontal = styled.div<{ margin?: string; overrideColor?: string }>`
  width: 100%;
  height: 1px;
  margin: ${({ margin }) => margin || '0'};
  background-color: ${({ overrideColor }) => overrideColor || `var(${UI.COLOR_PAPER_DARKER})`};
`
