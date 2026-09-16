import { i18n } from '@lingui/core'

import { USDC_MAINNET } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderToStaticMarkup } from 'react-dom/server'

import {
  buildEoaTwapConfirmationPendingSteps,
  EOA_TWAP_WALLET_ACTIONS_COMPLETE_STEP_ID,
  getEoaTwapCurrentStepBadge,
  getEoaTwapCurrentStepButton,
  getEoaTwapStepDescription,
  getEoaTwapStepLabel,
  getEoaTwapWalletActionSummaryLabel,
} from './buildEoaTwapConfirmationPendingSteps'

import { EoaTwapSigningPhase, EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

const DEFAULT_PLAN = [EoaTwapSigningSteps.ApprovePoller, EoaTwapSigningSteps.TwapSign, EoaTwapSigningSteps.SubmitTwap]

function getPendingSteps(steps: ReturnType<typeof buildEoaTwapConfirmationPendingSteps>): NonNullable<typeof steps> {
  expect(steps).not.toBeNull()

  if (!steps) {
    throw new Error('expected pending steps')
  }

  return steps
}

// eslint-disable-next-line max-lines-per-function
describe('buildEoaTwapConfirmationPendingSteps()', () => {
  beforeAll(async () => {
    await i18n.activate('en-US')
  })

  it('shows authorization as signed before the setup transaction', () => {
    const steps = getPendingSteps(
      buildEoaTwapConfirmationPendingSteps({
        signingStep: {
          step: EoaTwapSigningSteps.TwapSign,
          plan: [EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.TwapSign, EoaTwapSigningSteps.SubmitTwap],
          phase: EoaTwapSigningPhase.Sign,
          lockDismiss: false,
        },
        token: USDC_MAINNET,
      }),
    )

    expect(steps[0]).toMatchObject({ label: 'Set up TWAP', status: 'success' })
    const description = renderToStaticMarkup(steps[0]?.description)
    expect(description).toContain('Signed')
    expect(description).not.toContain('href=')
    expect(steps[1]).toMatchObject({ label: 'Sign TWAP', status: 'active' })
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
    const plan = [EoaTwapSigningSteps.ApprovePoller, EoaTwapSigningSteps.TwapSign]

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
        id: EoaTwapSigningSteps.TwapSign,
        label: 'Sign TWAP',
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
          step: EoaTwapSigningSteps.TwapSign,
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
    const plan = [EoaTwapSigningSteps.PermitPoller, EoaTwapSigningSteps.TwapSign, EoaTwapSigningSteps.SubmitTwap]

    const steps = getPendingSteps(
      buildEoaTwapConfirmationPendingSteps({
        signingStep: {
          step: EoaTwapSigningSteps.TwapSign,
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

  it('renders wallet-action summary layout for completed signature step', () => {
    expect(
      renderToStaticMarkup(
        getEoaTwapStepDescription(EoaTwapSigningSteps.TwapSign, 'success', undefined, {
          chainId: SupportedChainId.MAINNET,
          completedStepTxHashes: { [EoaTwapSigningSteps.TwapSign]: '0xsign' },
        }),
      ),
    ).toContain('Sign TWAP ·')
    expect(
      renderToStaticMarkup(
        getEoaTwapStepDescription(EoaTwapSigningSteps.TwapSign, 'success', undefined, {
          chainId: SupportedChainId.MAINNET,
          completedStepTxHashes: { [EoaTwapSigningSteps.TwapSign]: '0xsign' },
        }),
      ),
    ).toContain('Confirmed')
    expect(
      renderToStaticMarkup(
        getEoaTwapStepDescription(EoaTwapSigningSteps.TwapSign, 'success', undefined, {
          chainId: SupportedChainId.MAINNET,
          completedStepTxHashes: { [EoaTwapSigningSteps.TwapSign]: '0xsign' },
        }),
      ),
    ).toContain('https://etherscan.io/tx/0xsign')
  })

  it('collapses wallet actions while SubmitTwap is loading', () => {
    const plan = [EoaTwapSigningSteps.TwapSign, EoaTwapSigningSteps.SubmitTwap]

    const steps = getPendingSteps(
      buildEoaTwapConfirmationPendingSteps({
        signingStep: {
          step: EoaTwapSigningSteps.SubmitTwap,
          plan,
          phase: EoaTwapSigningPhase.WaitingForTx,
          lockDismiss: true,
          completedStepTxHashes: { [EoaTwapSigningSteps.TwapSign]: '0xsign' },
        },
        token: USDC_MAINNET,
        chainId: SupportedChainId.MAINNET,
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

  it('marks activation as success after setup tx confirms while waiting for Success', () => {
    const plan = [EoaTwapSigningSteps.TwapSign, EoaTwapSigningSteps.SubmitTwap]

    const steps = getPendingSteps(
      buildEoaTwapConfirmationPendingSteps({
        signingStep: {
          step: EoaTwapSigningSteps.SubmitTwap,
          plan,
          phase: EoaTwapSigningPhase.Confirmed,
          lockDismiss: true,
          completedStepTxHashes: { [EoaTwapSigningSteps.TwapSign]: '0xsign' },
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
        status: 'success',
      },
    ])
  })

  it('collapses wallet actions while SubmitTwapSlow is loading', () => {
    const plan = [EoaTwapSigningSteps.TwapSign, EoaTwapSigningSteps.SubmitTwapSlow]

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
            [EoaTwapSigningSteps.TwapSign]: '0xsign',
          },
        },
        token: USDC_MAINNET,
        chainId: SupportedChainId.MAINNET,
      }),
    )

    const descriptionMarkup = renderToStaticMarkup(steps[0]?.description)

    expect(descriptionMarkup).toContain('Reset approval')
    expect(descriptionMarkup).toContain('Approve USDC')
    expect(descriptionMarkup).toContain('Sign TWAP')
    expect(descriptionMarkup).toContain('Confirmed')
    expect(descriptionMarkup).toContain('https://etherscan.io/tx/0xzero')
    expect(descriptionMarkup).toContain('https://etherscan.io/tx/0xapprove')
  })

  it('returns null when the current step is missing from the plan', () => {
    expect(
      buildEoaTwapConfirmationPendingSteps({
        signingStep: {
          step: EoaTwapSigningSteps.ApprovePoller,
          plan: [EoaTwapSigningSteps.TwapSign, EoaTwapSigningSteps.SubmitTwap],
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
    expect(getEoaTwapWalletActionSummaryLabel(EoaTwapSigningSteps.TwapSign, 'USDC')).toBe('Sign TWAP')
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
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.TwapSign)).toBe('Sign TWAP')
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.SubmitTwap)).toBe('Activating TWAP')
    expect(getEoaTwapStepLabel(EoaTwapSigningSteps.SubmitTwapSlow)).toBe('Still activating TWAP')
  })
})

describe('getEoaTwapCurrentStepBadge()', () => {
  beforeAll(async () => {
    await i18n.activate('en-US')
  })

  it('returns Signature pending for TwapSign while loading', () => {
    expect(getEoaTwapCurrentStepBadge(EoaTwapSigningSteps.TwapSign, 'loading')).toEqual({
      children: 'Signature pending',
      type: 'information',
    })
  })

  it('returns Still activating for SubmitTwapSlow', () => {
    expect(getEoaTwapCurrentStepBadge(EoaTwapSigningSteps.SubmitTwapSlow, 'loading')).toEqual({
      children: 'Still activating',
      type: 'information',
    })
  })
})

describe('getEoaTwapCurrentStepButton()', () => {
  beforeAll(async () => {
    await i18n.activate('en-US')
  })

  it('returns Try again for TwapSign on error', () => {
    expect(getEoaTwapCurrentStepButton(EoaTwapSigningSteps.TwapSign, 'error', 'USDC')).toEqual({
      children: 'Try again',
      disabled: false,
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

  it('returns sign copy for TwapSign', () => {
    expect(getEoaTwapStepDescription(EoaTwapSigningSteps.TwapSign, 'active')).toBe(
      'Review and confirm in your wallet to continue.',
    )
    expect(renderToStaticMarkup(getEoaTwapStepDescription(EoaTwapSigningSteps.TwapSign, 'loading'))).toContain(
      'Transaction submitted. Waiting for network confirmation',
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
