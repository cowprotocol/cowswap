import { OrderProgressBarStepName } from 'modules/orderProgressBar'

import { ScenarioFrame } from './OrderProgressBarPlayground.demo.constants'
import { getScenarioFrameDelayMs } from './OrderProgressBarPlayground.utils'

function createFrame(stepName: OrderProgressBarStepName, backendStatus: string, holdMs: number): ScenarioFrame {
  return { backendStatus, holdMs, stepName }
}

describe('getScenarioFrameDelayMs', () => {
  it('holds non-priority transitions for at least 5 seconds', () => {
    const result = getScenarioFrameDelayMs(
      createFrame(OrderProgressBarStepName.INITIAL, 'scheduled', 1200),
      createFrame(OrderProgressBarStepName.SOLVING, 'active', 1500),
    )

    expect(result).toBe(5000)
  })

  it('lets priority retry screens interrupt immediately', () => {
    const result = getScenarioFrameDelayMs(
      createFrame(OrderProgressBarStepName.EXECUTING, 'executing', 1200),
      createFrame(OrderProgressBarStepName.SUBMISSION_FAILED, 'open', 1800),
    )

    expect(result).toBe(1200)
  })

  it('replays completion-driven executing without adding the 5 second hold', () => {
    const result = getScenarioFrameDelayMs(
      createFrame(OrderProgressBarStepName.DELAYED, 'open', 1500),
      createFrame(OrderProgressBarStepName.EXECUTING, 'traded', 1200),
    )

    expect(result).toBe(1500)
  })
})
