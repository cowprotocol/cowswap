import { buildEoaTwapSigningStepPlan } from './buildEoaTwapSigningStepPlan'

import { EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

describe('buildEoaTwapSigningStepPlan()', () => {
  it('always includes setup, funding, and creating steps', () => {
    expect(buildEoaTwapSigningStepPlan({ needsApproval: false, needsZeroApproval: false })).toEqual([
      EoaTwapSigningSteps.TwapSetup,
      EoaTwapSigningSteps.FundingOrder,
      EoaTwapSigningSteps.CreatingOrder,
    ])
  })

  it('prepends approve when needed', () => {
    expect(buildEoaTwapSigningStepPlan({ needsApproval: true, needsZeroApproval: false })).toEqual([
      EoaTwapSigningSteps.ApproveOrPermit,
      EoaTwapSigningSteps.TwapSetup,
      EoaTwapSigningSteps.FundingOrder,
      EoaTwapSigningSteps.CreatingOrder,
    ])
  })

  it('prepends zero-approve then approve when both needed', () => {
    expect(buildEoaTwapSigningStepPlan({ needsApproval: true, needsZeroApproval: true })).toEqual([
      EoaTwapSigningSteps.ZeroApprove,
      EoaTwapSigningSteps.ApproveOrPermit,
      EoaTwapSigningSteps.TwapSetup,
      EoaTwapSigningSteps.FundingOrder,
      EoaTwapSigningSteps.CreatingOrder,
    ])
  })
})
