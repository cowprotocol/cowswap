import { i18n } from '@lingui/core'

import {
  buildEoaTwapConfirmationPendingSteps,
  getEoaTwapStepDescription,
  getEoaTwapStepLabel,
} from './buildEoaTwapConfirmationPendingSteps'

import { EoaTwapSigningPhase, EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

const DEFAULT_PLAN = [EoaTwapSigningSteps.ApprovePoller, EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.TwapSign]

function getPendingSteps(steps: ReturnType<typeof buildEoaTwapConfirmationPendingSteps>): NonNullable<typeof steps> {
  expect(steps).not.toBeNull()

  if (!steps) {
    throw new Error('expected pending steps')
  }

  return steps
}

describe('buildEoaTwapConfirmationPendingSteps()', () => {
  beforeAll(async () => {
    await i18n.activate('en-US')
  })

  it('keeps stable labels and uses loading description for poller approve', () => {
    const steps = getPendingSteps(
      buildEoaTwapConfirmationPendingSteps({
        signingStep: {
          step: EoaTwapSigningSteps.ApprovePoller,
          plan: DEFAULT_PLAN,
          phase: EoaTwapSigningPhase.WaitingForTx,
          lockDismiss: false,
        },
        symbol: 'USDC',
      }),
    )

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
        id: EoaTwapSigningSteps.TwapSign,
        label: 'Sign TWAP',
        status: 'upcoming',
      },
    ])
    expect(steps[0]?.description).toBeTruthy()
    expect(steps[1]?.description).toBeTruthy()
  })

  it('marks Sign phase as active with Approve {symbol} for funding', () => {
    const plan = [EoaTwapSigningSteps.ApprovePoller, EoaTwapSigningSteps.TwapSetup]

    const steps = getPendingSteps(
      buildEoaTwapConfirmationPendingSteps({
        signingStep: {
          step: EoaTwapSigningSteps.ApprovePoller,
          plan,
          phase: EoaTwapSigningPhase.Sign,
          lockDismiss: false,
        },
        symbol: 'USDC',
      }),
    )

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
    expect(
      getPendingSteps(
        buildEoaTwapConfirmationPendingSteps({
          signingStep: {
            step: EoaTwapSigningSteps.TwapSetup,
            plan: DEFAULT_PLAN,
            phase: EoaTwapSigningPhase.Sign,
            lockDismiss: false,
          },
          symbol: 'USDC',
        }),
      ).map(({ id, label, status, description }) => ({ id, label, status, description: description ?? null })),
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
        description: 'Sign the setup in your wallet. This registers just-in-time funding and creates the TWAP.',
      },
      {
        id: EoaTwapSigningSteps.TwapSign,
        label: 'Sign TWAP',
        status: 'upcoming',
        description: 'Confirm the TWAP transaction in your connected wallet.',
      },
    ])
  })

  it('marks Sign phase as active for TwapSign after setup is confirmed', () => {
    const plan = [EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.TwapSign]

    expect(
      getPendingSteps(
        buildEoaTwapConfirmationPendingSteps({
          signingStep: {
            step: EoaTwapSigningSteps.TwapSign,
            plan,
            phase: EoaTwapSigningPhase.Sign,
            lockDismiss: false,
          },
        }),
      ).map(({ id, label, status }) => ({ id, label, status })),
    ).toEqual([
      {
        id: EoaTwapSigningSteps.TwapSetup,
        label: 'Set up TWAP',
        status: 'success',
      },
      {
        id: EoaTwapSigningSteps.TwapSign,
        label: 'Sign TWAP',
        status: 'active',
      },
    ])
  })

  it('marks WaitingForTx phase as loading for TwapSign', () => {
    const plan = [EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.TwapSign]

    const steps = getPendingSteps(
      buildEoaTwapConfirmationPendingSteps({
        signingStep: {
          step: EoaTwapSigningSteps.TwapSign,
          plan,
          phase: EoaTwapSigningPhase.WaitingForTx,
          lockDismiss: true,
        },
      }),
    )

    expect(steps.map(({ id, label, status }) => ({ id, label, status }))).toEqual([
      {
        id: EoaTwapSigningSteps.TwapSetup,
        label: 'Set up TWAP',
        status: 'success',
      },
      {
        id: EoaTwapSigningSteps.TwapSign,
        label: 'Sign TWAP',
        status: 'loading',
      },
    ])
    expect(steps[1]?.description).toBeTruthy()
  })

  it('returns null when the current step is missing from the plan', () => {
    expect(
      buildEoaTwapConfirmationPendingSteps({
        signingStep: {
          step: EoaTwapSigningSteps.ApprovePoller,
          plan: [EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.TwapSign],
          phase: EoaTwapSigningPhase.Sign,
          lockDismiss: false,
        },
      }),
    ).toBeNull()
  })

  it('returns null for Success, which is not part of the plan', () => {
    expect(
      buildEoaTwapConfirmationPendingSteps({
        signingStep: {
          step: EoaTwapSigningSteps.Success,
          plan: DEFAULT_PLAN,
          phase: EoaTwapSigningPhase.Confirmed,
          lockDismiss: true,
        },
      }),
    ).toBeNull()
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
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.TwapSign)).toBe('Sign TWAP')
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
      'Sign the setup in your wallet. This registers just-in-time funding and creates the TWAP.',
    )
  })

  it('returns sign copy for TwapSign', () => {
    expect(getEoaTwapStepDescription(EoaTwapSigningSteps.TwapSign, 'active')).toBe(
      'Confirm the TWAP transaction in your connected wallet.',
    )
  })

  it('returns poller permit copy when active', () => {
    expect(getEoaTwapStepDescription(EoaTwapSigningSteps.PermitPoller, 'active')).toBe(
      'Sign the permit in your wallet. Each part is pulled right before it trades.',
    )
  })
})
