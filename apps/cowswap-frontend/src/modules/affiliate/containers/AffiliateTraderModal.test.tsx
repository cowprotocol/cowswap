import { useAtomValue, useSetAtom } from 'jotai'
import { type ReactNode } from 'react'

import { type CowAnalytics, useCowAnalytics } from '@cowprotocol/analytics'

import { render } from '@testing-library/react'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { AffiliateTraderModal } from './AffiliateTraderModal'

import { useAffiliateStateViewAnalytics } from '../hooks/useAffiliateStateViewAnalytics'
import { useAffiliateTraderRecoverySideEffect } from '../hooks/useAffiliateTraderRecoverySideEffect'
import { TraderWalletStatus, useAffiliateTraderWallet } from '../hooks/useAffiliateTraderWallet'
import { affiliateTraderModalAtom } from '../state/affiliateTraderModalAtom'
import { affiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'

jest.mock('@cowprotocol/analytics', () => {
  const actualModule = jest.requireActual('@cowprotocol/analytics')

  return {
    ...actualModule,
    __resetGtmInstance: jest.fn(),
    useCowAnalytics: jest.fn(),
  }
})

jest.mock('jotai', () => {
  const actualModule = jest.requireActual('jotai')

  return {
    ...actualModule,
    useAtomValue: jest.fn(),
    useSetAtom: jest.fn(),
  }
})

jest.mock('@cowprotocol/ui', () => ({
  ModalHeader: () => <div>ModalHeader</div>,
}))

jest.mock('common/pure/Modal', () => ({
  CowModal: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

jest.mock('common/hooks/useIsProviderNetworkUnsupported', () => ({
  useIsProviderNetworkUnsupported: jest.fn(),
}))

jest.mock('./AffiliateTraderModalCodeInfo', () => ({
  AffiliateTraderModalCodeInfo: () => <div>CodeInfo</div>,
}))

jest.mock('./AffiliateTraderModalCodeLinking', () => ({
  AffiliateTraderModalCodeLinking: () => <div>CodeLinking</div>,
}))

jest.mock('./AffiliateTraderModalIneligible', () => ({
  AffiliateTraderModalIneligible: () => <div>Ineligible</div>,
}))

jest.mock('./AffiliateTraderModalUnsupported', () => ({
  AffiliateTraderModalUnsupported: () => <div>Unsupported</div>,
}))

jest.mock('../hooks/useAffiliateStateViewAnalytics', () => ({
  useAffiliateStateViewAnalytics: jest.fn(),
}))

jest.mock('../hooks/useAffiliateTraderRecoverySideEffect', () => ({
  useAffiliateTraderRecoverySideEffect: jest.fn(),
}))

jest.mock('../hooks/useAffiliateTraderRefUrlSideEffect', () => ({
  useAffiliateTraderRefUrlSideEffect: jest.fn(),
}))

jest.mock('../hooks/useAffiliateTraderWallet', () => {
  return {
    TraderWalletStatus: {
      PENDING: 'pending',
      DISCONNECTED: 'disconnected',
      UNSUPPORTED: 'unsupported',
      ELIGIBLE: 'eligible',
      LINKED: 'linked',
      INELIGIBLE: 'ineligible',
      ELIGIBILITY_UNKNOWN: 'eligibility-unknown',
    },
    useAffiliateTraderWallet: jest.fn(),
  }
})

jest.mock('../pure/AffiliateTraderModal/styles', () => ({
  ModalContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

jest.mock('../pure/UnsupportedNetwork', () => ({
  UnsupportedNetwork: () => <div>UnsupportedNetwork</div>,
}))

jest.mock('../state/affiliateTraderModalAtom', () => ({
  affiliateTraderModalAtom: Symbol.for('affiliateTraderModalAtom'),
  toggleTraderModalAtom: Symbol.for('toggleTraderModalAtom'),
}))

jest.mock('../state/affiliateTraderSavedCodeAtom', () => ({
  affiliateTraderSavedCodeAtom: Symbol.for('affiliateTraderSavedCodeAtom'),
}))

const useCowAnalyticsMock = useCowAnalytics as jest.MockedFunction<typeof useCowAnalytics>
const useAtomValueMock = useAtomValue as jest.MockedFunction<typeof useAtomValue>
const useSetAtomMock = useSetAtom as jest.MockedFunction<typeof useSetAtom>
const useIsProviderNetworkUnsupportedMock = useIsProviderNetworkUnsupported as jest.MockedFunction<
  typeof useIsProviderNetworkUnsupported
>
const useAffiliateTraderWalletMock = useAffiliateTraderWallet as jest.MockedFunction<typeof useAffiliateTraderWallet>
const useAffiliateTraderRecoverySideEffectMock = useAffiliateTraderRecoverySideEffect as jest.MockedFunction<
  typeof useAffiliateTraderRecoverySideEffect
>
const useAffiliateStateViewAnalyticsMock = useAffiliateStateViewAnalytics as jest.MockedFunction<
  typeof useAffiliateStateViewAnalytics
>

describe('AffiliateTraderModal', () => {
  const sendEvent = jest.fn()
  const toggleAffiliateModal = jest.fn()
  let isModalOpen: boolean
  let savedCodeState: { savedCode?: string; isLinked?: boolean }
  let isRecoverySettling: boolean
  let walletStatus: TraderWalletStatus

  beforeEach(() => {
    jest.clearAllMocks()

    isModalOpen = false
    savedCodeState = {}
    isRecoverySettling = false
    walletStatus = TraderWalletStatus.ELIGIBLE

    useCowAnalyticsMock.mockReturnValue({ sendEvent } as unknown as CowAnalytics)
    useIsProviderNetworkUnsupportedMock.mockReturnValue(false)
    useSetAtomMock.mockReturnValue(toggleAffiliateModal)
    useAffiliateTraderRecoverySideEffectMock.mockImplementation(() => isRecoverySettling)
    useAffiliateTraderWalletMock.mockImplementation(() => walletStatus)
    useAffiliateStateViewAnalyticsMock.mockImplementation(() => undefined)
    useAtomValueMock.mockImplementation((atom) => {
      if (atom === affiliateTraderModalAtom) {
        return isModalOpen
      }

      if (atom === affiliateTraderSavedCodeAtom) {
        return savedCodeState
      }

      throw new Error('Unexpected atom read in test')
    })
  })

  it('tracks modal opened only on false-to-true transitions', () => {
    const { rerender } = render(<AffiliateTraderModal />)

    expect(sendEvent).not.toHaveBeenCalled()

    isModalOpen = true
    rerender(<AffiliateTraderModal />)

    expect(sendEvent).toHaveBeenCalledTimes(1)
    expect(sendEvent).toHaveBeenCalledWith({
      category: 'affiliate',
      action: 'affiliate_trader_modal_opened',
      walletStatus: TraderWalletStatus.ELIGIBLE,
      hasSavedCode: false,
      isLinked: false,
    })

    walletStatus = TraderWalletStatus.LINKED
    savedCodeState = { savedCode: 'COW-123', isLinked: true }
    rerender(<AffiliateTraderModal />)

    expect(sendEvent).toHaveBeenCalledTimes(1)

    isModalOpen = false
    rerender(<AffiliateTraderModal />)

    expect(sendEvent).toHaveBeenCalledTimes(1)

    isModalOpen = true
    rerender(<AffiliateTraderModal />)

    expect(sendEvent).toHaveBeenCalledTimes(2)
  })

  it('waits for pending wallet state to settle before tracking the open event', () => {
    isModalOpen = true
    walletStatus = TraderWalletStatus.PENDING

    const { rerender } = render(<AffiliateTraderModal />)

    expect(sendEvent).not.toHaveBeenCalled()

    walletStatus = TraderWalletStatus.LINKED
    savedCodeState = { savedCode: 'COW-123', isLinked: true }
    rerender(<AffiliateTraderModal />)

    expect(sendEvent).toHaveBeenCalledTimes(1)
    expect(sendEvent).toHaveBeenCalledWith({
      category: 'affiliate',
      action: 'affiliate_trader_modal_opened',
      walletStatus: TraderWalletStatus.LINKED,
      hasSavedCode: true,
      isLinked: true,
    })
  })

  it('waits for recovered code to settle before tracking the open event', () => {
    isModalOpen = true
    isRecoverySettling = true

    const { rerender } = render(<AffiliateTraderModal />)

    expect(sendEvent).not.toHaveBeenCalled()

    isRecoverySettling = false
    walletStatus = TraderWalletStatus.LINKED
    savedCodeState = { savedCode: 'COW-123', isLinked: true }
    rerender(<AffiliateTraderModal />)

    expect(sendEvent).toHaveBeenCalledTimes(1)
    expect(sendEvent).toHaveBeenCalledWith({
      category: 'affiliate',
      action: 'affiliate_trader_modal_opened',
      walletStatus: TraderWalletStatus.LINKED,
      hasSavedCode: true,
      isLinked: true,
    })
  })
})
