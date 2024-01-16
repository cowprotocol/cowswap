import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { Stepper } from './index'

const Wrapper = styled.div`
  width: 90%;
  height: 120px;
  background: var(${UI.COLOR_PAPER});
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  display: flex;
  align-items: center;
  justify-content: center;
`

const StepperFixtures = {
  'Stepper start': (
    <Wrapper>
      <Stepper
        steps={[
          { stepState: 'active', stepNumber: 1, label: 'Approve' },
          { stepState: 'open', stepNumber: 2, label: 'Submit' },
        ]}
      />
    </Wrapper>
  ),
  '2 Stepper with active step': (
    <Wrapper>
      <Stepper
        steps={[
          { stepState: 'finished', stepNumber: 1, label: 'Approve' },
          { stepState: 'active', stepNumber: 2, label: 'Submit' },
        ]}
      />
    </Wrapper>
  ),
  'Stepper with error state': (
    <Wrapper>
      <Stepper
        steps={[
          { stepState: 'finished', stepNumber: 1, label: 'Step 1' },
          { stepState: 'error', stepNumber: 2, label: 'Step 2' },
          { stepState: 'open', stepNumber: 3, label: 'Step 3' },
        ]}
      />
    </Wrapper>
  ),
  'Stepper with loading state': (
    <Wrapper>
      <Stepper
        steps={[
          { stepState: 'finished', stepNumber: 1, label: 'Step 1' },
          { stepState: 'loading', stepNumber: 2, label: 'Step 2' },
          { stepState: 'open', stepNumber: 3, label: 'Step 3' },
        ]}
      />
    </Wrapper>
  ),
}

export default StepperFixtures
