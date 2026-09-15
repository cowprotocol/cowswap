import { buildEoaTwapSigningStepPlan } from './buildEoaTwapSigningStepPlan'

import { EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

const NO_APPROVAL_NEEDS = { needsApproval: false, needsZeroApproval: false }

describe('buildEoaTwapSigningStepPlan()', () => {
  it('always includes setup and creating steps', () => {
    expect(buildEoaTwapSigningStepPlan({ poller: NO_APPROVAL_NEEDS })).toEqual([
      EoaTwapSigningSteps.TwapSetup,
      EoaTwapSigningSteps.CreatingOrder,
    ])
  })

  it('prepends poller approve when needed', () => {
    expect(
      buildEoaTwapSigningStepPlan({
        poller: { needsApproval: true, needsZeroApproval: false },
      }),
    ).toEqual([EoaTwapSigningSteps.ApprovePoller, EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.CreatingOrder])
  })

  it('prepends zero-approve then approve when both needed', () => {
    expect(
      buildEoaTwapSigningStepPlan({
        poller: { needsApproval: true, needsZeroApproval: true },
      }),
    ).toEqual([
      EoaTwapSigningSteps.ZeroApprovePoller,
      EoaTwapSigningSteps.ApprovePoller,
      EoaTwapSigningSteps.TwapSetup,
      EoaTwapSigningSteps.CreatingOrder,
    ])
  })

  it('uses PermitPoller and skips zero-approve when poller can use permit', () => {
    expect(
      buildEoaTwapSigningStepPlan({
        poller: { needsApproval: true, needsZeroApproval: true, canUsePermit: true },
      }),
    ).toEqual([EoaTwapSigningSteps.PermitPoller, EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.CreatingOrder])
  })

  it('omits poller steps when allowance already covers', () => {
    expect(
      buildEoaTwapSigningStepPlan({
        poller: { needsApproval: false, needsZeroApproval: true, canUsePermit: true },
      }),
    ).toEqual([EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.CreatingOrder])
  })
})
