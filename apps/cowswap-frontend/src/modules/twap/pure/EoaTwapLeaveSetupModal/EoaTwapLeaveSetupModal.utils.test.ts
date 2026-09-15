import { getEoaTwapLeaveConfirmationVariant, getEoaTwapLeaveSetupModalContent } from './EoaTwapLeaveSetupModal.utils'

import { EoaTwapSigningPhase, EoaTwapSigningSteps } from '../../state/eoaTwapSigningStepAtom'

const DEFAULT_PLAN = [
  EoaTwapSigningSteps.ApprovePoller,
  EoaTwapSigningSteps.TwapSetup,
  EoaTwapSigningSteps.TwapSign,
  EoaTwapSigningSteps.SubmitTwap,
]

const NO_APPROVAL_PLAN = [EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.TwapSign, EoaTwapSigningSteps.SubmitTwap]

describe('getEoaTwapLeaveConfirmationVariant()', () => {
  it('returns null for Success step', () => {
    expect(
      getEoaTwapLeaveConfirmationVariant({
        step: EoaTwapSigningSteps.Success,
        plan: DEFAULT_PLAN,
        phase: EoaTwapSigningPhase.Confirmed,
        lockDismiss: false,
      }),
    ).toBeNull()
  })

  it('returns noWayBack when lockDismiss is true', () => {
    expect(
      getEoaTwapLeaveConfirmationVariant({
        step: EoaTwapSigningSteps.SubmitTwap,
        plan: DEFAULT_PLAN,
        phase: EoaTwapSigningPhase.WaitingForTx,
        lockDismiss: true,
      }),
    ).toBe('noWayBack')
  })

  it('returns null when signing step is null', () => {
    expect(getEoaTwapLeaveConfirmationVariant(null)).toBeNull()
  })

  it.each([
    EoaTwapSigningSteps.ZeroApprovePoller,
    EoaTwapSigningSteps.ApprovePoller,
    EoaTwapSigningSteps.PermitPoller,
  ] as const)('returns walletRequest during approval step %s while signing', (step) => {
    expect(
      getEoaTwapLeaveConfirmationVariant({
        step,
        plan: [step, ...NO_APPROVAL_PLAN],
        phase: EoaTwapSigningPhase.Sign,
        lockDismiss: false,
      }),
    ).toBe('walletRequest')
  })

  it.each([EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.TwapSign] as const)(
    'returns walletRequest during %s while signing',
    (step) => {
      expect(
        getEoaTwapLeaveConfirmationVariant({
          step,
          plan: DEFAULT_PLAN,
          phase: EoaTwapSigningPhase.Sign,
          lockDismiss: false,
        }),
      ).toBe('walletRequest')
    },
  )

  it('returns default when approval is confirmed and there is no active wallet signature', () => {
    expect(
      getEoaTwapLeaveConfirmationVariant({
        step: EoaTwapSigningSteps.TwapSetup,
        plan: DEFAULT_PLAN,
        phase: EoaTwapSigningPhase.Confirmed,
        lockDismiss: false,
      }),
    ).toBe('default')
  })

  it('returns default while waiting for an on-chain transaction', () => {
    expect(
      getEoaTwapLeaveConfirmationVariant({
        step: EoaTwapSigningSteps.ApprovePoller,
        plan: DEFAULT_PLAN,
        phase: EoaTwapSigningPhase.WaitingForTx,
        lockDismiss: false,
      }),
    ).toBe('default')
  })
})

describe('getEoaTwapLeaveSetupModalContent()', () => {
  it('returns default copy when the user can leave without an active wallet request', () => {
    const content = getEoaTwapLeaveSetupModalContent('default', 'USDC')

    expect(content).toEqual({
      title: 'Leave TWAP setup?',
      description:
        "You'll return to the TWAP form with your values preserved and a fresh quote. This order won't be submitted.",
      infoBannerTitle: 'Your USDC approval stays valid',
      infoBannerDescription: "You won't need to approve it again unless your allowance changes.",
    })
  })

  it('returns wallet-request copy when a wallet signature is pending', () => {
    const content = getEoaTwapLeaveSetupModalContent('walletRequest', 'USDC')

    expect(content).toEqual({
      title: 'Leave TWAP setup?',
      description:
        "You'll return to the TWAP form with your values preserved and a fresh quote. Closing this tracker won't cancel the wallet request.",
      infoBannerTitle: 'Reject the wallet request to stop',
      infoBannerDescription: 'If you approve it after leaving, the order may still be submitted.',
    })
  })

  it('returns no-way-back copy when the order has already been submitted', () => {
    const content = getEoaTwapLeaveSetupModalContent('noWayBack', 'USDC')

    expect(content).toEqual({
      title: 'Leave TWAP setup?',
      description:
        "You'll return to the TWAP form with your values preserved and a fresh quote, but this order has already been submitted.",
      infoBannerTitle: 'Your order has alraedy been submitted',
      infoBannerDescription: 'If you want to cancel it, you can do it once it appears in the oders table.',
    })
  })
})
