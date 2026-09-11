import { i18n } from '@lingui/core'

import { USDC_MAINNET } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderToStaticMarkup } from 'react-dom/server'

import {
  buildEoaTwapConfirmationPendingSteps,
  EOA_TWAP_WALLET_ACTIONS_COMPLETE_STEP_ID,
  getEoaTwapCurrentStepBadge,
  getEoaTwapStepDescription,
  getEoaTwapStepLabel,
  getEoaTwapWalletActionSummaryLabel,
} from './buildEoaTwapConfirmationPendingSteps'

import { EoaTwapSigningPhase, EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

const DEFAULT_PLAN = [
  EoaTwapSigningSteps.ApprovePoller,
  EoaTwapSigningSteps.TwapSetup,
  EoaTwapSigningSteps.TwapSign,
  EoaTwapSigningSteps.SubmitTwap,
]

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
        token: USDC_MAINNET,
      }),
    )

    expect(steps.map(({ id, label, status }) => ({ id, label, status }))).toEqual([
      {
        id: EoaTwapSigningSteps.ApprovePoller,
        label: 'Approve USDC',
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
      {
        id: EoaTwapSigningSteps.SubmitTwap,
        label: 'Activating TWAP',
        status: 'upcoming',
      },
    ])
    expect(steps[0]?.description).toBeTruthy()
    expect(steps[1]?.description).toBeTruthy()
  })

  it('marks Sign phase as active with Approve {symbol}', () => {
    const plan = [EoaTwapSigningSteps.ApprovePoller, EoaTwapSigningSteps.TwapSetup]

    const steps = getPendingSteps(
      buildEoaTwapConfirmationPendingSteps({
        signingStep: {
          step: EoaTwapSigningSteps.ApprovePoller,
          plan,
          phase: EoaTwapSigningPhase.Sign,
          lockDismiss: false,
        },
        token: USDC_MAINNET,
      }),
    )

    expect(steps.map(({ id, label, status }) => ({ id, label, status }))).toEqual([
      {
        id: EoaTwapSigningSteps.ApprovePoller,
        label: 'Approve USDC',
        status: 'active',
      },
      {
        id: EoaTwapSigningSteps.TwapSetup,
        label: 'Set up TWAP',
        status: 'upcoming',
      },
    ])
    expect(steps[0]?.description).toBeTruthy()
    expect(renderToStaticMarkup(getEoaTwapStepDescription(EoaTwapSigningSteps.ApprovePoller, 'active'))).toContain(
      'Review and confirm in your wallet to continue.',
    )
  })

  it('keeps past-step labels stable on success', () => {
    const steps = getPendingSteps(
      buildEoaTwapConfirmationPendingSteps({
        signingStep: {
          step: EoaTwapSigningSteps.TwapSetup,
          plan: DEFAULT_PLAN,
          phase: EoaTwapSigningPhase.Sign,
          lockDismiss: false,
        },
        token: USDC_MAINNET,
      }),
    )

    expect(steps.map(({ id, label, status }) => ({ id, label, status }))).toEqual([
      {
        id: EoaTwapSigningSteps.ApprovePoller,
        label: 'Approve USDC',
        status: 'success',
      },
      {
        id: EoaTwapSigningSteps.TwapSetup,
        label: 'Set up TWAP',
        status: 'active',
      },
      {
        id: EoaTwapSigningSteps.TwapSign,
        label: 'Sign TWAP',
        status: 'upcoming',
      },
      {
        id: EoaTwapSigningSteps.SubmitTwap,
        label: 'Activating TWAP',
        status: 'upcoming',
      },
    ])
    expect(steps[0]?.description).toBeTruthy()
    const approveSuccessDescription = renderToStaticMarkup(
      getEoaTwapStepDescription(EoaTwapSigningSteps.ApprovePoller, 'success', undefined, {
        chainId: SupportedChainId.MAINNET,
        completedStepTxHashes: { [EoaTwapSigningSteps.ApprovePoller]: '0xapprove' },
      }),
    )

    expect(approveSuccessDescription).toContain('Approve token ·')
    expect(approveSuccessDescription).toContain('Confirmed')
    expect(approveSuccessDescription).toContain('https://etherscan.io/tx/0xapprove')
  })

  it('renders expandable success descriptions for completed permit steps', () => {
    const plan = [
      EoaTwapSigningSteps.PermitPoller,
      EoaTwapSigningSteps.TwapSetup,
      EoaTwapSigningSteps.TwapSign,
      EoaTwapSigningSteps.SubmitTwap,
    ]

    const steps = getPendingSteps(
      buildEoaTwapConfirmationPendingSteps({
        signingStep: {
          step: EoaTwapSigningSteps.TwapSetup,
          plan,
          phase: EoaTwapSigningPhase.Sign,
          lockDismiss: false,
        },
        token: USDC_MAINNET,
      }),
    )

    expect(steps[0]?.status).toBe('success')
    expect(steps[0]?.description).toBeTruthy()
    const permitSuccessDescription = renderToStaticMarkup(
      getEoaTwapStepDescription(EoaTwapSigningSteps.PermitPoller, 'success'),
    )

    expect(permitSuccessDescription).toContain('Permit token · Signed')
  })

  it('renders wallet-action summary layout for completed setup and sign steps', () => {
    expect(renderToStaticMarkup(getEoaTwapStepDescription(EoaTwapSigningSteps.TwapSetup, 'success'))).toContain(
      'Set up TWAP · Signed',
    )
    expect(renderToStaticMarkup(getEoaTwapStepDescription(EoaTwapSigningSteps.TwapSign, 'success'))).toContain(
      'Sign TWAP · Signed',
    )
  })

  it('marks Sign phase as active for TwapSign after setup is confirmed', () => {
    const plan = [EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.TwapSign, EoaTwapSigningSteps.SubmitTwap]

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
      {
        id: EoaTwapSigningSteps.SubmitTwap,
        label: 'Activating TWAP',
        status: 'upcoming',
      },
    ])
  })

  it('collapses wallet actions while SubmitTwap is loading', () => {
    const plan = [EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.TwapSign, EoaTwapSigningSteps.SubmitTwap]

    const steps = getPendingSteps(
      buildEoaTwapConfirmationPendingSteps({
        signingStep: {
          step: EoaTwapSigningSteps.SubmitTwap,
          plan,
          phase: EoaTwapSigningPhase.WaitingForTx,
          lockDismiss: true,
        },
      }),
    )

    expect(steps.map(({ id, label, status }) => ({ id, label, status }))).toEqual([
      {
        id: EOA_TWAP_WALLET_ACTIONS_COMPLETE_STEP_ID,
        label: 'Wallet actions complete',
        status: 'success',
      },
      {
        id: EoaTwapSigningSteps.SubmitTwap,
        label: 'Activating TWAP',
        status: 'loading',
      },
    ])
    expect(steps[0]?.description).toBeTruthy()
    expect(steps[1]?.description).toBeTruthy()
  })

  it('collapses wallet actions while SubmitTwapSlow is loading', () => {
    const plan = [EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.TwapSign, EoaTwapSigningSteps.SubmitTwapSlow]

    const steps = getPendingSteps(
      buildEoaTwapConfirmationPendingSteps({
        signingStep: {
          step: EoaTwapSigningSteps.SubmitTwapSlow,
          plan,
          phase: EoaTwapSigningPhase.WaitingForTx,
          lockDismiss: true,
        },
      }),
    )

    expect(steps.map(({ id, label, status }) => ({ id, label, status }))).toEqual([
      {
        id: EOA_TWAP_WALLET_ACTIONS_COMPLETE_STEP_ID,
        label: 'Wallet actions complete',
        status: 'success',
      },
      {
        id: EoaTwapSigningSteps.SubmitTwapSlow,
        label: 'Still activating TWAP',
        status: 'loading',
      },
    ])
    expect(steps[1]?.description).toBe("This is taking longer than usual. We're still getting your order ready.")
  })

  it('renders wallet-action summaries with tx links when expanded', () => {
    const plan = [
      EoaTwapSigningSteps.ZeroApprovePoller,
      EoaTwapSigningSteps.ApprovePoller,
      EoaTwapSigningSteps.TwapSetup,
      EoaTwapSigningSteps.TwapSign,
      EoaTwapSigningSteps.SubmitTwap,
    ]

    const steps = getPendingSteps(
      buildEoaTwapConfirmationPendingSteps({
        signingStep: {
          step: EoaTwapSigningSteps.SubmitTwap,
          plan,
          phase: EoaTwapSigningPhase.WaitingForTx,
          lockDismiss: true,
          completedStepTxHashes: {
            [EoaTwapSigningSteps.ZeroApprovePoller]: '0xzero',
            [EoaTwapSigningSteps.ApprovePoller]: '0xapprove',
          },
        },
        token: USDC_MAINNET,
        chainId: SupportedChainId.MAINNET,
      }),
    )

    const descriptionMarkup = renderToStaticMarkup(steps[0]?.description)

    expect(descriptionMarkup).toContain('Reset approval')
    expect(descriptionMarkup).toContain('Approve USDC')
    expect(descriptionMarkup).toContain('Set up TWAP')
    expect(descriptionMarkup).toContain('Sign TWAP')
    expect(descriptionMarkup).toContain('Confirmed')
    expect(descriptionMarkup).toContain('Signed')
    expect(descriptionMarkup).toContain('https://etherscan.io/tx/0xzero')
    expect(descriptionMarkup).toContain('https://etherscan.io/tx/0xapprove')
  })

  it('returns null when the current step is missing from the plan', () => {
    expect(
      buildEoaTwapConfirmationPendingSteps({
        signingStep: {
          step: EoaTwapSigningSteps.ApprovePoller,
          plan: [EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.TwapSign, EoaTwapSigningSteps.SubmitTwap],
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

describe('getEoaTwapWalletActionSummaryLabel()', () => {
  beforeAll(async () => {
    await i18n.activate('en-US')
  })

  it('returns summary labels for wallet-action steps', () => {
    expect(getEoaTwapWalletActionSummaryLabel(EoaTwapSigningSteps.ZeroApprovePoller, 'USDC')).toBe('Reset approval')
    expect(getEoaTwapWalletActionSummaryLabel(EoaTwapSigningSteps.ApprovePoller, 'USDC')).toBe('Approve USDC')
    expect(getEoaTwapWalletActionSummaryLabel(EoaTwapSigningSteps.ApprovePoller, undefined)).toBe('Approve token')
    expect(getEoaTwapWalletActionSummaryLabel(EoaTwapSigningSteps.TwapSetup, 'USDC')).toBe('Set up TWAP')
    expect(getEoaTwapWalletActionSummaryLabel(EoaTwapSigningSteps.SubmitTwap, 'USDC')).toBeNull()
  })
})

describe('getEoaTwapStepLabel()', () => {
  beforeAll(async () => {
    await i18n.activate('en-US')
  })

  it('returns stable labels per step', () => {
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.ApprovePoller, 'COW')).toBe('Approve COW')
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.ApprovePoller)).toBe('Approve token')
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.PermitPoller, 'COW')).toBe('Permit COW')
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.PermitPoller)).toBe('Permit token')
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.TwapSetup)).toBe('Set up TWAP')
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.TwapSign)).toBe('Sign TWAP')
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.SubmitTwap)).toBe('Activating TWAP')
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.SubmitTwapSlow)).toBe('Still activating TWAP')
  })
})

describe('getEoaTwapCurrentStepBadge()', () => {
  beforeAll(async () => {
    await i18n.activate('en-US')
  })

  it('returns Still activating for SubmitTwapSlow', () => {
    expect(getEoaTwapCurrentStepBadge(EoaTwapSigningSteps.SubmitTwapSlow, 'loading')).toEqual({
      children: 'Still activating',
      type: 'information',
    })
  })
})

describe('getEoaTwapStepDescription()', () => {
  beforeAll(async () => {
    await i18n.activate('en-US')
  })

  it('returns poller approve copy when active', () => {
    expect(renderToStaticMarkup(getEoaTwapStepDescription(EoaTwapSigningSteps.ApprovePoller, 'active'))).toContain(
      'Review and confirm in your wallet to continue.',
    )
  })

  it('returns setup copy for TwapSetup', () => {
    expect(getEoaTwapStepDescription(EoaTwapSigningSteps.TwapSetup, 'active')).toBe(
      'Review and confirm in your wallet to continue.',
    )
  })

  it('returns sign copy for TwapSign', () => {
    expect(getEoaTwapStepDescription(EoaTwapSigningSteps.TwapSign, 'active')).toBe(
      'Review and confirm in your wallet to continue.',
    )
  })

  it('returns submitting copy for SubmitTwap when loading', () => {
    expect(getEoaTwapStepDescription(EoaTwapSigningSteps.SubmitTwap, 'loading')).toBe(
      "Sit tight! We're getting your order ready",
    )
  })

  it('returns slow copy for SubmitTwapSlow when loading', () => {
    expect(getEoaTwapStepDescription(EoaTwapSigningSteps.SubmitTwapSlow, 'loading')).toBe(
      "This is taking longer than usual. We're still getting your order ready.",
    )
  })

  it('returns poller permit copy when active', () => {
    expect(renderToStaticMarkup(getEoaTwapStepDescription(EoaTwapSigningSteps.PermitPoller, 'active'))).toContain(
      'Review and confirm in your wallet to continue.',
    )
  })
})
