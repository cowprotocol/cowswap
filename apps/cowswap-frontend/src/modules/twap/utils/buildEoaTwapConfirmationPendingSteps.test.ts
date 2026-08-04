import { i18n } from '@lingui/core'

import {
  buildEoaTwapConfirmationPendingSteps,
  getEoaTwapStepDescription,
  getEoaTwapStepLabel,
} from './buildEoaTwapConfirmationPendingSteps'

import { EoaTwapSigningPhase, EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

describe('buildEoaTwapConfirmationPendingSteps()', () => {
  beforeAll(async () => {
    await i18n.activate('en-US')
  })

  it('keeps stable labels and uses loading description for approve', () => {
    const plan = [
      EoaTwapSigningSteps.ApproveOrPermit,
      EoaTwapSigningSteps.TwapSetup,
      EoaTwapSigningSteps.FundingOrder,
      EoaTwapSigningSteps.CreatingOrder,
    ]

    const steps = buildEoaTwapConfirmationPendingSteps(
      {
        step: EoaTwapSigningSteps.ApproveOrPermit,
        plan,
        phase: EoaTwapSigningPhase.WaitingForTx,
        lockDismiss: false,
      },
      { symbol: 'USDC' },
    )

    expect(steps.map(({ id, label, status }) => ({ id, label, status }))).toEqual([
      {
        id: EoaTwapSigningSteps.ApproveOrPermit,
        label: 'Approve USDC',
        status: 'loading',
      },
      {
        id: EoaTwapSigningSteps.TwapSetup,
        label: 'Set up TWAP',
        status: 'upcoming',
      },
      {
        id: EoaTwapSigningSteps.FundingOrder,
        label: 'Sign TWAP',
        status: 'upcoming',
      },
      {
        id: EoaTwapSigningSteps.CreatingOrder,
        label: 'Activating TWAP',
        status: 'upcoming',
      },
    ])
    expect(steps[0]?.description).toBeTruthy()
    expect(steps[1]?.description).toBeTruthy()
  })

  it('marks Sign phase as active with Approve {symbol}', () => {
    const plan = [EoaTwapSigningSteps.ApproveOrPermit, EoaTwapSigningSteps.TwapSetup]

    const steps = buildEoaTwapConfirmationPendingSteps(
      {
        step: EoaTwapSigningSteps.ApproveOrPermit,
        plan,
        phase: EoaTwapSigningPhase.Sign,
        lockDismiss: false,
      },
      { symbol: 'USDC' },
    )

    expect(steps.map(({ id, label, status }) => ({ id, label, status }))).toEqual([
      {
        id: EoaTwapSigningSteps.ApproveOrPermit,
        label: 'Approve USDC',
        status: 'active',
      },
      {
        id: EoaTwapSigningSteps.TwapSetup,
        label: 'Set up TWAP',
        status: 'upcoming',
      },
    ])
    expect(steps[0]?.description).toBe('Confirm the approval transaction in your connected wallet.')
  })

  it('keeps past-step labels stable on success', () => {
    const plan = [EoaTwapSigningSteps.ApproveOrPermit, EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.FundingOrder]

    expect(
      buildEoaTwapConfirmationPendingSteps(
        {
          step: EoaTwapSigningSteps.TwapSetup,
          plan,
          phase: EoaTwapSigningPhase.Sign,
          lockDismiss: false,
        },
        { symbol: 'USDC' },
      ).map(({ id, label, status, description }) => ({ id, label, status, description: description ?? null })),
    ).toEqual([
      {
        id: EoaTwapSigningSteps.ApproveOrPermit,
        label: 'Approve USDC',
        status: 'success',
        description: null,
      },
      {
        id: EoaTwapSigningSteps.TwapSetup,
        label: 'Set up TWAP',
        status: 'active',
        description: 'Confirm this required setup signature in your connected wallet.',
      },
      {
        id: EoaTwapSigningSteps.FundingOrder,
        label: 'Sign TWAP',
        status: 'upcoming',
        description: "Sign in your wallet. We'll submit the funding order automatically.",
      },
    ])
  })

  it('marks Verifying phase as loading for Sign TWAP', () => {
    const plan = [EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.FundingOrder]

    const steps = buildEoaTwapConfirmationPendingSteps({
      step: EoaTwapSigningSteps.FundingOrder,
      plan,
      phase: EoaTwapSigningPhase.Verifying,
      lockDismiss: false,
    })

    expect(steps.map(({ id, label, status }) => ({ id, label, status }))).toEqual([
      {
        id: EoaTwapSigningSteps.TwapSetup,
        label: 'Set up TWAP',
        status: 'success',
      },
      {
        id: EoaTwapSigningSteps.FundingOrder,
        label: 'Sign TWAP',
        status: 'loading',
      },
    ])
    expect(steps[1]?.description).toBeTruthy()
  })

  it('throws when the current step is missing from the plan', () => {
    expect(() =>
      buildEoaTwapConfirmationPendingSteps({
        step: EoaTwapSigningSteps.FundingOrder,
        plan: [EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.CreatingOrder],
        phase: EoaTwapSigningPhase.Sign,
        lockDismiss: false,
      }),
    ).toThrow('EOA TWAP signing step "FundingOrder" is not present in plan [TwapSetup, CreatingOrder]')
  })
})

describe('getEoaTwapStepLabel()', () => {
  beforeAll(async () => {
    await i18n.activate('en-US')
  })

  it('returns stable labels per step', () => {
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.ApproveOrPermit, 'COW')).toBe('Approve COW')
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.ApproveOrPermit)).toBe('Approve')
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.TwapSetup)).toBe('Set up TWAP')
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.FundingOrder)).toBe('Sign TWAP')
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.CreatingOrder)).toBe('Activating TWAP')
  })
})

describe('getEoaTwapStepDescription()', () => {
  beforeAll(async () => {
    await i18n.activate('en-US')
  })

  it('returns approve confirm copy when active', () => {
    expect(getEoaTwapStepDescription(EoaTwapSigningSteps.ApproveOrPermit, 'active')).toBe(
      'Confirm the approval transaction in your connected wallet.',
    )
  })

  it('returns setup copy for TwapSetup', () => {
    expect(getEoaTwapStepDescription(EoaTwapSigningSteps.TwapSetup, 'active')).toBe(
      'Confirm this required setup signature in your connected wallet.',
    )
  })

  it('returns sign copy for FundingOrder when active', () => {
    expect(getEoaTwapStepDescription(EoaTwapSigningSteps.FundingOrder, 'active')).toBe(
      "Sign in your wallet. We'll submit the funding order automatically.",
    )
  })

  it('returns no description for success status', () => {
    expect(getEoaTwapStepDescription(EoaTwapSigningSteps.ApproveOrPermit, 'success')).toBeUndefined()
    expect(getEoaTwapStepDescription(EoaTwapSigningSteps.TwapSetup, 'success')).toBeUndefined()
    expect(getEoaTwapStepDescription(EoaTwapSigningSteps.FundingOrder, 'success')).toBeUndefined()
  })
})
