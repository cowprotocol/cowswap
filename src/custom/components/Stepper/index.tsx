import styled from 'styled-components/macro'
import CheckCircle from 'assets/cow-swap/check.svg'
import { transparentize } from 'polished'

export const Wrapper = styled.div<{ totalSteps: number }>`
  width: 100%;
  display: grid;
  grid-template-columns: ${({ totalSteps }) => `repeat(${totalSteps}, 1fr)`};
  margin: 12px 0 24px;
`

export const Step = styled.div<{
  totalSteps: number
  isActiveStep: boolean
  completedStep: boolean
  circleSize?: number
}>`
  --circleSize: 42px;
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  position: relative;
  flex: 1 1 ${({ totalSteps }) => `calc(100% / ${totalSteps})`};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    --circleSize: 26px;
  `}
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: ${({ circleSize }) => (circleSize ? `calc(${circleSize / 2})px` : 'calc(var(--circleSize) / 2)')};
    height: 1px;
    border-top: 1px solid ${({ theme }) => theme.border2};
  }

  &::before {
    left: 0;
    right: 50%;
    margin-right: ${({ circleSize }) => (circleSize ? `${circleSize}px` : 'var(--circleSize)')};
  }

  &::after {
    right: 0;
    left: 50%;
    margin-left: ${({ circleSize }) => (circleSize ? `${circleSize}px` : 'var(--circleSize)')};
  }

  &:first-child::before,
  &:last-child::after {
    content: none;
    display: none;
  }

  > span {
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    justify-content: center;
    width: ${({ circleSize }) => (circleSize ? `${circleSize}px` : 'var(--circleSize)')};
    height: ${({ circleSize }) => (circleSize ? `${circleSize}px` : 'var(--circleSize)')};
    margin: 0 auto 12px;
    border-radius: ${({ circleSize }) => (circleSize ? `${circleSize}px` : 'var(--circleSize)')};
    text-align: center;
    line-height: 1;
    font-size: 100%;
    position: relative;
    color: ${({ isActiveStep, completedStep, theme }) =>
      completedStep ? theme.black : isActiveStep ? theme.black : transparentize(0.4, theme.text1)};
    background: ${({ isActiveStep, completedStep, theme, circleSize }) =>
      completedStep
        ? `url(${CheckCircle}) no-repeat center/${circleSize ? `${circleSize}px` : 'var(--circleSize)'}`
        : isActiveStep
        ? theme.primary1
        : theme.blueShade3};

    > small {
      font-size: inherit;
      color: inherit;
      display: ${({ completedStep }) => (completedStep ? 'none' : 'block')};
    }
  }

  > b {
    color: ${({ isActiveStep, completedStep, theme }) =>
      completedStep ? theme.text1 : isActiveStep ? theme.text1 : transparentize(0.4, theme.text1)};
    font-weight: ${({ isActiveStep, completedStep }) => (completedStep ? '300' : isActiveStep ? 'bold' : '300')};
    text-align: center;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      font-size: 14px;
    `}
  }

  > i {
    font-style: normal;
    color: ${({ isActiveStep, completedStep, theme }) =>
      completedStep
        ? transparentize(0.2, theme.text1)
        : isActiveStep
        ? transparentize(0.2, theme.text1)
        : transparentize(0.4, theme.text1)};
    font-size: 12px;
    margin: 6px 0 0;
    padding: 0 24px;
    text-align: center;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      display: none;
    `}
  }
`

interface StepperProps {
  steps: {
    title: string
    subtitle?: string
  }[]
  activeStep: number
}

export function Stepper({ steps, activeStep }: StepperProps) {
  return (
    <Wrapper totalSteps={steps.length}>
      {steps.map(({ title, subtitle }, index) => {
        const completedStep = activeStep > index
        const isActiveStep = activeStep === index
        return (
          <Step key={index} totalSteps={steps.length} isActiveStep={isActiveStep} completedStep={completedStep}>
            <span>
              <small>{index + 1}</small>
            </span>
            <b>{title}</b>
            <i>{subtitle}</i>
          </Step>
        )
      })}
    </Wrapper>
  )
}
