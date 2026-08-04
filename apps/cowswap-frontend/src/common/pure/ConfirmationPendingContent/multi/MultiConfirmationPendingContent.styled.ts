import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const StepsList = styled.ol`
  --circle-size: 24px;
  --inner-circle-size: 12px;
  --icon-size: 14px;
  --status-bg: var(${UI.COLOR_TEXT_OPACITY_10});
  --status-color: var(${UI.COLOR_TEXT_OPACITY_70});

  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-flow: column nowrap;
  gap: 0;
  width: 100%;
  margin-inline: auto;
`

export const StepItem = styled.li`
  position: relative;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 12px calc(var(--circle-size) + 12px) 12px calc(var(--circle-size) + 12px);

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    top: calc(12px + var(--circle-size) + 6px);
    bottom: calc(-12px + 6px);
    left: calc(var(--circle-size) / 2);
    transform: translateX(-50%);
    border-left: 2px solid var(${UI.COLOR_TEXT_OPACITY_10});
  }
`

export const StepsIconWrapper = styled.div`
  position: absolute;
  top: 12px;
  left: 0;
  border-radius: var(--circle-size);
  height: var(--circle-size);
  width: var(--circle-size);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--status-bg);
  color: var(--status-color);
  font-size: var(--icon-size);

  &[data-status='active'],
  &[data-status='loading'] {
    --status-bg: var(${UI.COLOR_INFO_BG});
    --status-color: var(${UI.COLOR_INFO_TEXT});
  }

  &[data-status='loading'] {
    animation: statusBgPulse 1.4s ease-in-out infinite;
  }

  &[data-status='loading']::before {
    animation: statusDotPulse 1.4s ease-in-out infinite;
  }

  @keyframes statusBgPulse {
    0%,
    100% {
      background: var(${UI.COLOR_INFO_BG});
    }
    50% {
      background: var(${UI.COLOR_PRIMARY_OPACITY_25});
    }
  }

  @keyframes statusDotPulse {
    0%,
    100% {
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      transform: translate(-50%, -50%) scale(1.25);
    }
  }

  &[data-status='warning'] {
    --status-bg: var(${UI.COLOR_ALERT_BG});
    --status-color: var(${UI.COLOR_ALERT_TEXT});
  }

  &[data-status='success'] {
    --status-bg: var(${UI.COLOR_SUCCESS_BG});
    --status-color: var(${UI.COLOR_SUCCESS_TEXT});
  }

  &[data-status='error'] {
    --status-bg: var(${UI.COLOR_DANGER_BG});
    --status-color: var(${UI.COLOR_DANGER_TEXT});
  }

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: var(--inner-circle-size);
    height: var(--inner-circle-size);
    border-radius: 100%;
    border: 2px solid currentColor;
    transition: border-width 0.2s ease-in-out;
  }

  &[data-status='active']::before,
  &[data-status='loading']::before {
    border-width: calc(var(--inner-circle-size) / 2);
  }

  &[data-status='success'],
  &[data-status='error'],
  &[data-status='warning'] {
    &::before {
      display: none;
    }
  }

  > svg {
    width: 1em;
    height: 1em;
    stroke: currentColor;
  }
`

export const StepLabel = styled.strong`
  display: block;
  flex: 1;
  font-size: 15px;
  line-height: 1.4;
  text-align: left;
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-weight: var(${UI.FONT_WEIGHT_BOLD});

  [data-status='active'] &,
  [data-status='loading'] & {
    color: var(${UI.COLOR_TEXT});
  }

  [data-status='upcoming'] & {
    font-weight: var(${UI.FONT_WEIGHT_NORMAL});
  }
`

export const StepExpandButton = styled.button`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(${UI.COLOR_TEXT});

  & > svg {
    width: 1em;
    height: 1em;
    transition: transform 0.2s ease-in-out;
  }

  &[aria-expanded='true'] > svg {
    transform: rotate(180deg);
  }
`

export const StepDetailsInner = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 4px;
  padding-top: 16px;

  & p {
    margin: 0;
  }
`
