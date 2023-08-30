import ICON_CHECK from 'assets/icon/check.svg'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { IconSpinner } from 'common/pure/IconSpinner'

type StepState = 'active' | 'finished' | 'disabled' | 'error' | 'loading' | 'open'

interface StepProps {
  stepState: StepState
  stepNumber: number
  label: string
  dotSize?: number
}

const stateStyles = {
  active: { dotBackground: '--cow-color-link', dotColor: '--cow-container-bg-01', labelColor: '--cow-color-text1' },
  finished: { dotBackground: '--cow-color-link-opacity-10', dotColor: '--cow-color-link', labelColor: '--cow-color-text1' },
  disabled: { dotBackground: '--cow-color-text1-opacity-25', dotColor: '--cow-color-text1-opacity-25', labelColor: '--cow-color-text1-opacity-25' },
  error: { dotBackground: '--cow-color-danger-bg', dotColor: '--cow-color-danger', labelColor: '--cow-color-danger' },
  loading: { dotBackground: '--cow-color-link', dotColor: '--cow-container-bg-01', labelColor: '--cow-color-link' },
  open: { dotBackground: '--cow-color-text1-opacity-10', dotColor: '--cow-container-text2', labelColor: '--cow-color-text2' },
}

const Step = styled.div<StepProps>`
  display: flex;
  position: relative;
  align-items: center;
  margin: 0;
  padding: 0;
  font-size: var(--cow-font-size-small);
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
      fill: var(--cow-color-link);
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
    background: ${({ stepState }) => stepState === 'error' ? 'var(--cow-color-danger)' : stepState === 'finished' ? 'var(--cow-color-link)' : 'var(--cow-color-text1-opacity-25)' };
    border-radius: var(--cow-border-radius-normal);
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
  width: ${({ maxWidth }) => maxWidth ? maxWidth : '100%'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  gap: 10px;
  padding: 24px;
  margin: 0 auto;
`

interface StepperProps {
  steps: StepProps[]
  maxWidth?: string
  dotSize?: number
}

export function Stepper({ steps, maxWidth, dotSize = 21 }: StepperProps) {
  return (
    <Wrapper maxWidth={maxWidth} dotSize={dotSize}>
      {steps.map((step, index) => (
        <Step key={index} {...step}>
          {step.stepState === 'loading' ? (
            <IconSpinner size={dotSize} bgColor={stateStyles['loading'].dotBackground}>
              <i>{step.stepNumber}</i>
            </IconSpinner>
          ) : <i>
            {step.stepState === 'finished' ? (
              <SVG src={ICON_CHECK} title='checkmark' />
            ) : (
              step.stepNumber
            )}
          </i>
          }
          <small>{step.label}</small>
          <hr />
        </Step>
      ))}
    </Wrapper>
  );
}
