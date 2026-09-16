import { buildEoaTwapSigningStepPlan, replaceSubmitTwapWithSlowInPlan } from './buildEoaTwapSigningStepPlan'

import { EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

const NO_APPROVAL_NEEDS = { needsApproval: false, needsZeroApproval: false }

const REQUIRED_STEPS = [EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.TwapSign, EoaTwapSigningSteps.SubmitTwap]

describe('buildEoaTwapSigningStepPlan()', () => {
  it('always includes setup and sign steps', () => {
    expect(buildEoaTwapSigningStepPlan({ poller: NO_APPROVAL_NEEDS })).toEqual(REQUIRED_STEPS)
  })

  it('prepends poller approve when needed', () => {
    expect(
      buildEoaTwapSigningStepPlan({
        poller: { needsApproval: true, needsZeroApproval: false },
      }),
    ).toEqual([EoaTwapSigningSteps.ApprovePoller, ...REQUIRED_STEPS])
  })

  it('prepends zero-approve then approve when both needed', () => {
    expect(
      buildEoaTwapSigningStepPlan({
        poller: { needsApproval: true, needsZeroApproval: true },
      }),
    ).toEqual([EoaTwapSigningSteps.ZeroApprovePoller, EoaTwapSigningSteps.ApprovePoller, ...REQUIRED_STEPS])
  })

  it('uses PermitPoller and skips zero-approve when poller can use permit', () => {
    expect(
      buildEoaTwapSigningStepPlan({
        poller: { needsApproval: true, needsZeroApproval: true, canUsePermit: true },
      }),
    ).toEqual([EoaTwapSigningSteps.PermitPoller, ...REQUIRED_STEPS])
  })

  it('omits poller steps when allowance already covers', () => {
    expect(
      buildEoaTwapSigningStepPlan({
        poller: { needsApproval: false, needsZeroApproval: true, canUsePermit: true },
      }),
    ).toEqual(REQUIRED_STEPS)
  })
})

describe('replaceSubmitTwapWithSlowInPlan()', () => {
  it('replaces SubmitTwap with SubmitTwapSlow', () => {
    expect(
      replaceSubmitTwapWithSlowInPlan([
        EoaTwapSigningSteps.TwapSetup,
        EoaTwapSigningSteps.TwapSign,
        EoaTwapSigningSteps.SubmitTwap,
      ]),
    ).toEqual([EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.TwapSign, EoaTwapSigningSteps.SubmitTwapSlow])
  })
})
