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

  it('keeps stable labels and uses loading description for poller approve', () => {
    const plan = [EoaTwapSigningSteps.ApprovePoller, EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.CreatingOrder]

    const steps = buildEoaTwapConfirmationPendingSteps({
      signingStep: {
        step: EoaTwapSigningSteps.ApprovePoller,
        plan,
        phase: EoaTwapSigningPhase.WaitingForTx,
        lockDismiss: false,
      },
      symbol: 'USDC',
    })

    expect(steps.map(({ id, label, status }) => ({ id, label, status }))).toEqual([
      {
        id: EoaTwapSigningSteps.ApprovePoller,
        label: 'Approve USDC for funding',
        status: 'loading',
      },
      {
        id: EoaTwapSigningSteps.TwapSetup,
        label: 'Set up TWAP',
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

  it('marks Sign phase as active with Approve {symbol} for funding', () => {
    const plan = [EoaTwapSigningSteps.ApprovePoller, EoaTwapSigningSteps.TwapSetup]

    const steps = buildEoaTwapConfirmationPendingSteps({
      signingStep: {
        step: EoaTwapSigningSteps.ApprovePoller,
        plan,
        phase: EoaTwapSigningPhase.Sign,
        lockDismiss: false,
      },
      symbol: 'USDC',
    })

    expect(steps.map(({ id, label, status }) => ({ id, label, status }))).toEqual([
      {
        id: EoaTwapSigningSteps.ApprovePoller,
        label: 'Approve USDC for funding',
        status: 'active',
      },
      {
        id: EoaTwapSigningSteps.TwapSetup,
        label: 'Set up TWAP',
        status: 'upcoming',
      },
    ])
    expect(steps[0]?.description).toBe(
      'Confirm the approval transaction in your connected wallet. Each part is pulled right before it trades.',
    )
  })

  it('keeps past-step labels stable on success', () => {
    const plan = [EoaTwapSigningSteps.ApprovePoller, EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.CreatingOrder]

    expect(
      buildEoaTwapConfirmationPendingSteps({
        signingStep: {
          step: EoaTwapSigningSteps.TwapSetup,
          plan,
          phase: EoaTwapSigningPhase.Sign,
          lockDismiss: false,
        },
        symbol: 'USDC',
      }).map(({ id, label, status, description }) => ({ id, label, status, description: description ?? null })),
    ).toEqual([
      {
        id: EoaTwapSigningSteps.ApprovePoller,
        label: 'Approve USDC for funding',
        status: 'success',
        description: null,
      },
      {
        id: EoaTwapSigningSteps.TwapSetup,
        label: 'Set up TWAP',
        status: 'active',
        description:
          'Confirm setup in your connected wallet. This registers just-in-time funding and creates the TWAP.',
      },
      {
        id: EoaTwapSigningSteps.CreatingOrder,
        label: 'Activating TWAP',
        status: 'upcoming',
        description: expect.anything(),
      },
    ])
  })

  it('marks WaitingForTx phase as loading for TwapSetup', () => {
    const plan = [EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.CreatingOrder]

    const steps = buildEoaTwapConfirmationPendingSteps({
      signingStep: {
        step: EoaTwapSigningSteps.TwapSetup,
        plan,
        phase: EoaTwapSigningPhase.WaitingForTx,
        lockDismiss: true,
      },
    })

    expect(steps.map(({ id, label, status }) => ({ id, label, status }))).toEqual([
      {
        id: EoaTwapSigningSteps.TwapSetup,
        label: 'Set up TWAP',
        status: 'loading',
      },
      {
        id: EoaTwapSigningSteps.CreatingOrder,
        label: 'Activating TWAP',
        status: 'upcoming',
      },
    ])
    expect(steps[0]?.description).toBeTruthy()
  })

  it('throws when the current step is missing from the plan', () => {
    expect(() =>
      buildEoaTwapConfirmationPendingSteps({
        signingStep: {
          step: EoaTwapSigningSteps.ApprovePoller,
          plan: [EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.CreatingOrder],
          phase: EoaTwapSigningPhase.Sign,
          lockDismiss: false,
        },
      }),
    ).toThrow('EOA TWAP signing step "ApprovePoller" is not present in plan [TwapSetup, CreatingOrder]')
  })
})

describe('getEoaTwapStepLabel()', () => {
  beforeAll(async () => {
    await i18n.activate('en-US')
  })

  it('returns stable labels per step', () => {
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.ApprovePoller, 'COW')).toBe('Approve COW for funding')
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.ApprovePoller)).toBe('Approve funding')
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.PermitPoller, 'COW')).toBe('Permit COW for funding')
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.PermitPoller)).toBe('Permit funding')
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.TwapSetup)).toBe('Set up TWAP')
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.CreatingOrder)).toBe('Activating TWAP')
  })
})

describe('getEoaTwapStepDescription()', () => {
  beforeAll(async () => {
    await i18n.activate('en-US')
  })

  it('returns poller approve copy when active', () => {
    expect(getEoaTwapStepDescription(EoaTwapSigningSteps.ApprovePoller, 'active')).toBe(
      'Confirm the approval transaction in your connected wallet. Each part is pulled right before it trades.',
    )
  })

  it('returns setup copy for TwapSetup', () => {
    expect(getEoaTwapStepDescription(EoaTwapSigningSteps.TwapSetup, 'active')).toBe(
      'Confirm setup in your connected wallet. This registers just-in-time funding and creates the TWAP.',
    )
  })

  it('returns poller permit copy when active', () => {
    expect(getEoaTwapStepDescription(EoaTwapSigningSteps.PermitPoller, 'active')).toBe(
      'Sign the permit in your wallet. Each part is pulled right before it trades.',
    )
  })

  it('returns no description for CreatingOrder success status', () => {
    expect(getEoaTwapStepDescription(EoaTwapSigningSteps.CreatingOrder, 'success')).toBeUndefined()
  })
})
