import React, { useContext } from 'react'
import styled from 'styled-components'
import { AutoColumn } from 'components/Column'
import { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'

const Wrapper = styled(AutoColumn)`
  margin-right: 8px;
  height: 100%;
`

const Grouping = styled(AutoColumn)`
  width: fit-content;
  padding: 4px;
  /* background-color: ${({ theme }) => theme.bg2}; */
  border-radius: 16px;
`

export const Circle = styled.div<{ confirmed?: boolean; disabled?: boolean }>`
  width: 48px;
  height: 48px;
  background-color: ${({ theme, confirmed, disabled }) =>
    disabled ? theme.bg4 : confirmed ? theme.green1 : theme.primary1};
  border-radius: 50%;
  color: ${({ theme }) => theme.white};
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 8px;
  font-size: 16px;
  padding: 1rem;
`

const CircleRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

export interface ProgressCirclesProps {
  steps: boolean[]
  disabled?: boolean
  CircleComponent: typeof Circle
}

/**
 * Based on array of steps, create a step counter of circles.
 * A circle can be enabled, disabled, or confirmed. States are derived
 * from previous step.
 *
 * An extra circle is added to represent the ability to swap, add, or remove.
 * This step will never be marked as complete (because no 'txn done' state in body ui).
 *
 * @param steps  array of booleans where true means step is complete
 */
export default function ProgressCircles({ steps, disabled = false, CircleComponent, ...rest }: ProgressCirclesProps) {
  const theme = useContext(ThemeContext)

  return (
    <Wrapper justify={'center'} {...rest}>
      <Grouping>
        {steps.map((step, i) => {
          return (
            <CircleRow key={i}>
              <CircleComponent confirmed={step} disabled={disabled || (!steps[i - 1] && i !== 0)}>
                {step ? '✓' : i + 1 + '.'}
              </CircleComponent>
              <TYPE.main color={theme.text4}>|</TYPE.main>
            </CircleRow>
          )
        })}
        <CircleComponent disabled={disabled || !steps[steps.length - 1]}>{steps.length + 1 + '.'}</CircleComponent>
      </Grouping>
    </Wrapper>
  )
}
