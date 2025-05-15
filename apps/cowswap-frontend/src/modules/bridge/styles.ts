import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import { FlattenSimpleInterpolation } from 'styled-components'
import styled, { css, keyframes } from 'styled-components/macro'

import { StopStatusEnum } from './utils/status'

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

const StopStatusStyles: Record<StopStatusEnum, FlattenSimpleInterpolation> = {
  [StopStatusEnum.DONE]: css`
    background-color: var(${UI.COLOR_SUCCESS_BG});
    color: var(${UI.COLOR_SUCCESS_TEXT});
    padding: 6px;
    &::before {
      content: none;
    }
  `,
  [StopStatusEnum.PENDING]: css`
    background-color: ${`var(${UI.COLOR_INFO_BG})`};
    color: ${`var(${UI.COLOR_INFO_TEXT})`};
    &::before {
      content: none;
    }
  `,
  [StopStatusEnum.FAILED]: css`
    background-color: var(${UI.COLOR_ALERT_BG});
    color: var(${UI.COLOR_ALERT_TEXT});
    padding: 6.5px;
    &::before {
      content: none;
    }
  `,
  [StopStatusEnum.REFUND_COMPLETE]: css`
    background-color: var(${UI.COLOR_ALERT_BG});
    color: var(${UI.COLOR_ALERT_TEXT});
    padding: 6.5px;
    &::before {
      content: none;
    }
  `,
  [StopStatusEnum.DEFAULT]: css`
    background-color: var(${UI.COLOR_TEXT_OPACITY_15});
    color: var(${UI.COLOR_TEXT});
  `,
}

export const StopNumberCircle = styled.div<{
  status?: StopStatusEnum
  stopNumber?: number
}>`
  ${stopCircleBase}

  ${({ status = StopStatusEnum.DEFAULT }) => StopStatusStyles[status]}

  ${({ status = StopStatusEnum.DEFAULT, stopNumber }) =>
    status === StopStatusEnum.DEFAULT &&
    css`
      &::before {
        content: '${stopNumber}';
      }
    `}
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
  gap: 4px;
  margin: 0 auto 0 0;
  width: 100%;
`

export const ArrowIcon = styled.span`
  font-size: 13px;
  line-height: 1;
`

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

export const Link = styled.a<{ underline?: boolean }>`
  text-decoration: ${({ underline }) => (underline ? 'underline' : 'none')};
  color: inherit;

  &:hover {
    text-decoration: underline;
  }
`
