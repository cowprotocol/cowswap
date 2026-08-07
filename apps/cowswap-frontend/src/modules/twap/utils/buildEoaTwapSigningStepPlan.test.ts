import { buildEoaTwapSigningStepPlan } from './buildEoaTwapSigningStepPlan'

import { EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

const NO_APPROVAL_NEEDS = { needsApproval: false, needsZeroApproval: false }

describe('buildEoaTwapSigningStepPlan()', () => {
  it('always includes setup, funding, and creating steps', () => {
    expect(buildEoaTwapSigningStepPlan({ vaultRelayer: NO_APPROVAL_NEEDS, poller: NO_APPROVAL_NEEDS })).toEqual([
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
      EoaTwapSigningSteps.ApproveVaultRelayer,
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
      EoaTwapSigningSteps.ZeroApproveVaultRelayer,
      EoaTwapSigningSteps.ApproveVaultRelayer,
      EoaTwapSigningSteps.TwapSetup,
      EoaTwapSigningSteps.FundingOrder,
      EoaTwapSigningSteps.CreatingOrder,
    ])
  })

  it('adds poller on-chain approvals after the vault relayer ones', () => {
    expect(
      buildEoaTwapSigningStepPlan({
        vaultRelayer: { needsApproval: true, needsZeroApproval: false },
        poller: { needsApproval: true, needsZeroApproval: true },
      }),
    ).toEqual([
      EoaTwapSigningSteps.ApproveVaultRelayer,
      EoaTwapSigningSteps.ZeroApprovePoller,
      EoaTwapSigningSteps.ApprovePoller,
      EoaTwapSigningSteps.TwapSetup,
      EoaTwapSigningSteps.FundingOrder,
      EoaTwapSigningSteps.CreatingOrder,
    ])
  })

  it('uses PermitPoller and skips zero-approve when poller can use permit', () => {
    expect(
      buildEoaTwapSigningStepPlan({
        vaultRelayer: NO_APPROVAL_NEEDS,
        poller: { needsApproval: true, needsZeroApproval: true, canUsePermit: true },
      }),
    ).toEqual([
      EoaTwapSigningSteps.PermitPoller,
      EoaTwapSigningSteps.TwapSetup,
      EoaTwapSigningSteps.FundingOrder,
      EoaTwapSigningSteps.CreatingOrder,
    ])
  })

  it('omits poller steps when allowance already covers', () => {
    expect(
      buildEoaTwapSigningStepPlan({
        vaultRelayer: NO_APPROVAL_NEEDS,
        poller: { needsApproval: false, needsZeroApproval: true, canUsePermit: true },
      }),
    ).toEqual([EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.FundingOrder, EoaTwapSigningSteps.CreatingOrder])
  })
})
