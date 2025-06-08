import { UI } from '@cowprotocol/ui'

import ICON_CHECK from 'assets/icon/check.svg'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { IconSpinner } from 'common/pure/IconSpinner'

type StepState = 'active' | 'finished' | 'disabled' | 'error' | 'loading' | 'open'

export interface StepProps {
  stepState: StepState
  stepNumber: number
  label: string
  dotSize?: number
  dotBorderColor?: UI
}

interface StepStyles {
  dotBackground: UI
  dotColor: UI
  labelColor: UI
}

const stateStyles: Record<StepState, StepStyles> = {
  active: { dotBackground: UI.COLOR_LINK, dotColor: UI.COLOR_PAPER, labelColor: UI.COLOR_TEXT },
  finished: { dotBackground: UI.COLOR_LINK_OPACITY_10, dotColor: UI.COLOR_LINK, labelColor: UI.COLOR_TEXT },
  disabled: {
    dotBackground: UI.COLOR_TEXT_OPACITY_25,
    dotColor: UI.COLOR_TEXT_OPACITY_25,
    labelColor: UI.COLOR_TEXT_OPACITY_25,
  },
  error: { dotBackground: UI.COLOR_DANGER_BG, dotColor: UI.COLOR_DANGER, labelColor: UI.COLOR_DANGER },
  loading: { dotBackground: UI.COLOR_LINK, dotColor: UI.COLOR_PAPER, labelColor: UI.COLOR_LINK },
  open: { dotBackground: UI.COLOR_TEXT_OPACITY_10, dotColor: UI.COLOR_TEXT2, labelColor: UI.COLOR_TEXT2 },
}

const Step = styled.div<StepProps>`
  display: flex;
  position: relative;
  align-items: center;
  margin: 0;
  padding: 0;
  font-size: var(${UI.FONT_SIZE_SMALL});
  background: transparent;
  color: ${({ stepState }) => `var(${stateStyles[stepState].labelColor})`};
  gap: 8px;
  flex: 1 0 auto;

  i {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--dotSize);
    height: var(--dotSize);
    max-width: var(--dotSize);
    max-height: var(--dotSize);
    border-radius: var(--dotSize);
    border: 1px solid ${({ dotBorderColor = UI.COLOR_PAPER }) => `var(${dotBorderColor})`};
    background: ${({ stepState }) => `var(${stateStyles[stepState].dotBackground})`};
    color: ${({ stepState }) => `var(${stateStyles[stepState].dotColor})`};
    flex: 0 0 auto;
    z-index: 1;
    position: relative;
    font-style: normal;
    font-size: inherit;
    line-height: 1;

    > svg {
      width: 50%;
      height: 50%;
      margin: auto;
    }

    > svg > path {
      fill: var(${UI.COLOR_LINK});
    }
  }

  > small {
    flex: 0 0 auto;
    font-size: inherit;
  }

  > hr {
    width: 100%;
    height: 1px;
    border: 0;
    background: ${({ stepState }) =>
      stepState === 'error'
        ? `var(${stateStyles['error'].dotBackground})`
        : stepState === 'finished'
        ? `var(${stateStyles['finished'].dotBackground})`
        : `var(${UI.COLOR_TEXT_OPACITY_25})`};
    border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  }

  &&:last-child {
    flex: 0;
  }

  &:last-child > hr {
    display: none;
  }
`

const Wrapper = styled.div<{ maxWidth?: string; dotSize?: number }>`
  --dotSize: ${({ dotSize }) => `${dotSize}px`};
  width: ${({ maxWidth }) => (maxWidth ? maxWidth : '100%')};
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  gap: 10px;
  padding: 24px;
  margin: 0 auto;
`

export interface StepperProps {
  steps: StepProps[]
  maxWidth?: string
  dotSize?: number
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Stepper({ steps, maxWidth, dotSize = 21 }: StepperProps) {
  return (
    <Wrapper maxWidth={maxWidth} dotSize={dotSize}>
      {steps.map((step, index) => (
        <Step key={index} {...step}>
          {step.stepState === 'loading' ? (
            <IconSpinner spinnerWidth={1} size={dotSize} bgColor={stateStyles['loading'].dotBackground}>
              <i>{step.stepNumber}</i>
            </IconSpinner>
          ) : (
            <i>{step.stepState === 'finished' ? <SVG src={ICON_CHECK} title="checkmark" /> : step.stepNumber}</i>
          )}
          <small>{step.label}</small>
          <hr />
        </Step>
      ))}
    </Wrapper>
  )
}
