import {
  buildPrototypeScenarioOrderParams,
  DEFAULT_TWAP_PROTOTYPE_SEED_SCENARIOS,
  MANUAL_TWAP_PROTOTYPE_SCENARIOS,
} from './prototypeScenarios'

import { DEFAULT_PROTOTYPE_TWAP_PART_PROGRESS_MS } from '../const'
import { TwapPrototypeScenario } from '../types'

describe('prototypeScenarios', () => {
  const baseNow = new Date('2026-03-10T12:00:00.000Z').getTime()
  const numOfParts = 6
  const timeInterval = 300

  it('keeps static open scenarios out of auto-simulation', () => {
    const scenario = buildPrototypeScenarioOrderParams(TwapPrototypeScenario.StaticOpen, {
      baseNow,
      numOfParts,
      timeInterval,
    })

    expect(scenario.prototypeSimulation?.partProgressMs).toBe(0)
    expect(scenario.confirmedPartsCount).toBeUndefined()
  })

  it('caps auto-progress scenarios below full completion', () => {
    const scenario = buildPrototypeScenarioOrderParams(TwapPrototypeScenario.AutoProgressOpen, {
      baseNow,
      numOfParts,
      timeInterval,
    })

    expect(scenario.prototypeSimulation?.partProgressMs).toBe(DEFAULT_PROTOTYPE_TWAP_PART_PROGRESS_MS)
    expect(scenario.prototypeSimulation?.maxConfirmedParts).toBe(2)
  })

  it('creates partial final-state presets with confirmed parts', () => {
    const partiallyExpired = buildPrototypeScenarioOrderParams(TwapPrototypeScenario.PartiallyExpired, {
      baseNow,
      numOfParts,
      timeInterval,
    })
    const partiallyCancelled = buildPrototypeScenarioOrderParams(TwapPrototypeScenario.PartiallyCancelled, {
      baseNow,
      numOfParts,
      timeInterval,
    })

    expect(partiallyExpired.confirmedPartsCount).toBe(1)
    expect(partiallyCancelled.confirmedPartsCount).toBe(3)
  })

  it('keeps signing out of the seed and manual scenario sets', () => {
    expect(DEFAULT_TWAP_PROTOTYPE_SEED_SCENARIOS).not.toContain('WaitSigning')
    expect(MANUAL_TWAP_PROTOTYPE_SCENARIOS).not.toContain('WaitSigning')
  })
})
