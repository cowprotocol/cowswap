import { i18n } from '@lingui/core'

import { buildEoaTwapConfirmationPendingSteps, getEoaTwapStepLabel } from './buildEoaTwapConfirmationPendingSteps'

import { EoaTwapSigningPhase, EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

describe('buildEoaTwapConfirmationPendingSteps()', () => {
  beforeAll(async () => {
    await i18n.activate('en-US')
  })

  it('marks finished / active / upcoming and uses phase labels', () => {
    const plan = [
      EoaTwapSigningSteps.ApproveOrPermit,
      EoaTwapSigningSteps.TwapSetup,
      EoaTwapSigningSteps.FundingOrder,
      EoaTwapSigningSteps.CreatingOrder,
    ]

    expect(
      buildEoaTwapConfirmationPendingSteps({
        step: EoaTwapSigningSteps.ApproveOrPermit,
        plan,
        phase: EoaTwapSigningPhase.WaitingForTx,
      }),
    ).toEqual([
      {
        id: EoaTwapSigningSteps.ApproveOrPermit,
        label: getEoaTwapStepLabel(EoaTwapSigningSteps.ApproveOrPermit, EoaTwapSigningPhase.WaitingForTx),
        status: 'active',
        loading: true,
      },
      {
        id: EoaTwapSigningSteps.TwapSetup,
        label: getEoaTwapStepLabel(EoaTwapSigningSteps.TwapSetup, EoaTwapSigningPhase.Sign),
        status: 'upcoming',
      },
      {
        id: EoaTwapSigningSteps.FundingOrder,
        label: getEoaTwapStepLabel(EoaTwapSigningSteps.FundingOrder, EoaTwapSigningPhase.Sign),
        status: 'upcoming',
      },
      {
        id: EoaTwapSigningSteps.CreatingOrder,
        label: getEoaTwapStepLabel(EoaTwapSigningSteps.CreatingOrder, EoaTwapSigningPhase.Sign),
        status: 'upcoming',
      },
    ])
  })

  it('does not mark Sign phase as loading', () => {
    const plan = [EoaTwapSigningSteps.ApproveOrPermit, EoaTwapSigningSteps.TwapSetup]

    expect(
      buildEoaTwapConfirmationPendingSteps({
        step: EoaTwapSigningSteps.ApproveOrPermit,
        plan,
        phase: EoaTwapSigningPhase.Sign,
      }),
    ).toEqual([
      {
        id: EoaTwapSigningSteps.ApproveOrPermit,
        label: getEoaTwapStepLabel(EoaTwapSigningSteps.ApproveOrPermit, EoaTwapSigningPhase.Sign),
        status: 'active',
        loading: false,
      },
      {
        id: EoaTwapSigningSteps.TwapSetup,
        label: getEoaTwapStepLabel(EoaTwapSigningSteps.TwapSetup, EoaTwapSigningPhase.Sign),
        status: 'upcoming',
      },
    ])
  })

  it('shows confirmed labels on finished steps', () => {
    const plan = [EoaTwapSigningSteps.ApproveOrPermit, EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.FundingOrder]

    expect(
      buildEoaTwapConfirmationPendingSteps({
        step: EoaTwapSigningSteps.TwapSetup,
        plan,
        phase: EoaTwapSigningPhase.Sign,
      }),
    ).toEqual([
      {
        id: EoaTwapSigningSteps.ApproveOrPermit,
        label: getEoaTwapStepLabel(EoaTwapSigningSteps.ApproveOrPermit, EoaTwapSigningPhase.Confirmed),
        status: 'finished',
      },
      {
        id: EoaTwapSigningSteps.TwapSetup,
        label: getEoaTwapStepLabel(EoaTwapSigningSteps.TwapSetup, EoaTwapSigningPhase.Sign),
        status: 'active',
        loading: false,
      },
      {
        id: EoaTwapSigningSteps.FundingOrder,
        label: getEoaTwapStepLabel(EoaTwapSigningSteps.FundingOrder, EoaTwapSigningPhase.Sign),
        status: 'upcoming',
      },
    ])
  })

  it('marks Verifying phase as loading with verifying copy', () => {
    const plan = [EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.FundingOrder]

    expect(
      buildEoaTwapConfirmationPendingSteps({
        step: EoaTwapSigningSteps.FundingOrder,
        plan,
        phase: EoaTwapSigningPhase.Verifying,
      }),
    ).toEqual([
      {
        id: EoaTwapSigningSteps.TwapSetup,
        label: getEoaTwapStepLabel(EoaTwapSigningSteps.TwapSetup, EoaTwapSigningPhase.Confirmed),
        status: 'finished',
      },
      {
        id: EoaTwapSigningSteps.FundingOrder,
        label: getEoaTwapStepLabel(EoaTwapSigningSteps.FundingOrder, EoaTwapSigningPhase.Verifying),
        status: 'active',
        loading: true,
      },
    ])
  })
})
