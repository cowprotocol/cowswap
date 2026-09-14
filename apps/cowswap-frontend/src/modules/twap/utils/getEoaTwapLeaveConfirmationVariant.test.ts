import { getEoaTwapLeaveConfirmationVariant } from './getEoaTwapLeaveConfirmationVariant'

import { EoaTwapSigningPhase, EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

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

  it('returns null when lockDismiss is true', () => {
    expect(
      getEoaTwapLeaveConfirmationVariant({
        step: EoaTwapSigningSteps.SubmitTwap,
        plan: DEFAULT_PLAN,
        phase: EoaTwapSigningPhase.WaitingForTx,
        lockDismiss: true,
      }),
    ).toBeNull()
  })

  it('returns null when signing step is null', () => {
    expect(getEoaTwapLeaveConfirmationVariant(null)).toBeNull()
  })

  it.each([
    EoaTwapSigningSteps.ZeroApprovePoller,
    EoaTwapSigningSteps.ApprovePoller,
    EoaTwapSigningSteps.PermitPoller,
  ] as const)('returns walletRequest during approval step %s', (step) => {
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
    'returns walletRequest during %s',
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

  it('returns walletRequest on TwapSetup when plan has no approval steps', () => {
    expect(
      getEoaTwapLeaveConfirmationVariant({
        step: EoaTwapSigningSteps.TwapSetup,
        plan: NO_APPROVAL_PLAN,
        phase: EoaTwapSigningPhase.Sign,
        lockDismiss: false,
      }),
    ).toBe('walletRequest')
  })

  it('returns afterApproval when approval is confirmed and there is no active wallet interaction', () => {
    expect(
      getEoaTwapLeaveConfirmationVariant({
        step: EoaTwapSigningSteps.TwapSetup,
        plan: DEFAULT_PLAN,
        phase: EoaTwapSigningPhase.Confirmed,
        lockDismiss: false,
      }),
    ).toBe('afterApproval')
  })

  it('returns walletRequest when approval is confirmed but setup still needs a wallet signature', () => {
    expect(
      getEoaTwapLeaveConfirmationVariant({
        step: EoaTwapSigningSteps.TwapSetup,
        plan: DEFAULT_PLAN,
        phase: EoaTwapSigningPhase.Sign,
        lockDismiss: false,
      }),
    ).toBe('walletRequest')
  })
})
