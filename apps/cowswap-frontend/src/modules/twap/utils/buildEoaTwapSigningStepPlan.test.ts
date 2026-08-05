import { buildEoaTwapSigningStepPlan } from './buildEoaTwapSigningStepPlan'

import { EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

const NO_APPROVAL_NEEDS = { needsApproval: false, needsZeroApproval: false }

describe('buildEoaTwapSigningStepPlan()', () => {
  it('always includes register, setup, funding, and creating steps', () => {
    expect(buildEoaTwapSigningStepPlan({ vaultRelayer: NO_APPROVAL_NEEDS, poller: NO_APPROVAL_NEEDS })).toEqual([
      EoaTwapSigningSteps.RegisterPoller,
      EoaTwapSigningSteps.TwapSetup,
      EoaTwapSigningSteps.FundingOrder,
      EoaTwapSigningSteps.CreatingOrder,
    ])
  })

  it('prepends vault relayer approve when needed', () => {
    expect(
      buildEoaTwapSigningStepPlan({
        vaultRelayer: { needsApproval: true, needsZeroApproval: false },
        poller: NO_APPROVAL_NEEDS,
      }),
    ).toEqual([
      EoaTwapSigningSteps.ApproveOrPermit,
      EoaTwapSigningSteps.RegisterPoller,
      EoaTwapSigningSteps.TwapSetup,
      EoaTwapSigningSteps.FundingOrder,
      EoaTwapSigningSteps.CreatingOrder,
    ])
  })

  it('prepends zero-approve then approve when both needed', () => {
    expect(
      buildEoaTwapSigningStepPlan({
        vaultRelayer: { needsApproval: true, needsZeroApproval: true },
        poller: NO_APPROVAL_NEEDS,
      }),
    ).toEqual([
      EoaTwapSigningSteps.ZeroApprove,
      EoaTwapSigningSteps.ApproveOrPermit,
      EoaTwapSigningSteps.RegisterPoller,
      EoaTwapSigningSteps.TwapSetup,
      EoaTwapSigningSteps.FundingOrder,
      EoaTwapSigningSteps.CreatingOrder,
    ])
  })

  it('adds poller approvals after the vault relayer ones', () => {
    expect(
      buildEoaTwapSigningStepPlan({
        vaultRelayer: { needsApproval: true, needsZeroApproval: false },
        poller: { needsApproval: true, needsZeroApproval: true },
      }),
    ).toEqual([
      EoaTwapSigningSteps.ApproveOrPermit,
      EoaTwapSigningSteps.ZeroApprovePoller,
      EoaTwapSigningSteps.ApprovePoller,
      EoaTwapSigningSteps.RegisterPoller,
      EoaTwapSigningSteps.TwapSetup,
      EoaTwapSigningSteps.FundingOrder,
      EoaTwapSigningSteps.CreatingOrder,
    ])
  })
})
