import { buildEoaTwapSigningStepPlan, replaceSubmitTwapWithSlowInPlan } from './buildEoaTwapSigningStepPlan'

import { EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

const NO_APPROVAL_NEEDS = { needsApproval: false, needsZeroApproval: false }

const REQUIRED_STEPS = [EoaTwapSigningSteps.TwapSign, EoaTwapSigningSteps.SubmitTwap]

describe('buildEoaTwapSigningStepPlan()', () => {
  it('includes setup upfront for an undeployed proxy', () => {
    expect(
      buildEoaTwapSigningStepPlan({
        isProxyDeployed: false,
        poller: NO_APPROVAL_NEEDS,
      }),
    ).toEqual([EoaTwapSigningSteps.TwapSetup, ...REQUIRED_STEPS])
  })

  it('places setup after permit for an undeployed proxy', () => {
    expect(
      buildEoaTwapSigningStepPlan({
        isProxyDeployed: false,
        poller: { needsApproval: true, needsZeroApproval: false, canUsePermit: true },
      }),
    ).toEqual([EoaTwapSigningSteps.PermitPoller, EoaTwapSigningSteps.TwapSetup, ...REQUIRED_STEPS])
  })

  it('always includes signature and submit steps', () => {
    expect(buildEoaTwapSigningStepPlan({ isProxyDeployed: true, poller: NO_APPROVAL_NEEDS })).toEqual(REQUIRED_STEPS)
  })

  it('prepends poller approve when needed', () => {
    expect(
      buildEoaTwapSigningStepPlan({ isProxyDeployed: true, poller: { needsApproval: true, needsZeroApproval: false } }),
    ).toEqual([EoaTwapSigningSteps.ApprovePoller, ...REQUIRED_STEPS])
  })

  it('prepends zero-approve then approve when both needed', () => {
    expect(
      buildEoaTwapSigningStepPlan({ isProxyDeployed: true, poller: { needsApproval: true, needsZeroApproval: true } }),
    ).toEqual([EoaTwapSigningSteps.ZeroApprovePoller, EoaTwapSigningSteps.ApprovePoller, ...REQUIRED_STEPS])
  })

  it('uses PermitPoller and skips zero-approve when poller can use permit', () => {
    expect(
      buildEoaTwapSigningStepPlan({
        isProxyDeployed: true,
        poller: { needsApproval: true, needsZeroApproval: true, canUsePermit: true },
      }),
    ).toEqual([EoaTwapSigningSteps.PermitPoller, ...REQUIRED_STEPS])
  })

  it('omits poller steps when allowance already covers', () => {
    expect(
      buildEoaTwapSigningStepPlan({
        isProxyDeployed: true,
        poller: { needsApproval: false, needsZeroApproval: true, canUsePermit: true },
      }),
    ).toEqual(REQUIRED_STEPS)
  })
})

describe('replaceSubmitTwapWithSlowInPlan()', () => {
  it('replaces SubmitTwap with SubmitTwapSlow', () => {
    expect(replaceSubmitTwapWithSlowInPlan([EoaTwapSigningSteps.TwapSign, EoaTwapSigningSteps.SubmitTwap])).toEqual([
      EoaTwapSigningSteps.TwapSign,
      EoaTwapSigningSteps.SubmitTwapSlow,
    ])
  })
})
