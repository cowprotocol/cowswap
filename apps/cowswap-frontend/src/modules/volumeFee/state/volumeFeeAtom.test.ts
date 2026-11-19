import { createStore } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { injectedWidgetPartnerFeeAtom } from 'entities/injectedWidget'

import { tradeTypeAtom } from 'modules/trade'

import { TradeType } from 'common/modules/tradeNavigation'

import { volumeFeeAtom } from './volumeFeeAtom'

import { VolumeFee } from '../types'

jest.mock('@cowprotocol/wallet', () => {
  const { atom } = jest.requireActual<typeof import('jotai')>('jotai')

  return { walletInfoAtom: atom({ chainId: 1 }), walletDetailsAtom: atom({ isSafeApp: false }) }
})

jest.mock('common/state/featureFlagsState', () => {
  const { atom } = jest.requireActual<typeof import('jotai')>('jotai')

  return { featureFlagsAtom: atom({ isSafeAppFeeEnabled: false }) }
})

jest.mock('entities/injectedWidget', () => {
  const { atom } = jest.requireActual<typeof import('jotai')>('jotai')

  return { injectedWidgetPartnerFeeAtom: atom(undefined) }
})

jest.mock('entities/correlatedTokens', () => {
  const { atom } = jest.requireActual<typeof import('jotai')>('jotai')

  return { correlatedTokensAtom: atom({}) }
})

jest.mock('modules/trade', () => {
  const { atom } = jest.requireActual<typeof import('jotai')>('jotai')

  return { derivedTradeStateAtom: atom(undefined), tradeTypeAtom: atom(undefined) }
})

jest.mock('modules/tradeQuote', () => {
  const { atom } = jest.requireActual<typeof import('jotai')>('jotai')

  return { tradeQuotesAtom: atom({}) }
})

const PARTNER_FEE = { bps: 50, recipient: '0x22af3D38E50ddedeb7C47f36faB321eC3Bb72A76' }

function readVolumeFee(chainId: SupportedChainId): VolumeFee | undefined {
  const store = createStore()

  store.set(walletInfoAtom, { chainId })
  store.set(injectedWidgetPartnerFeeAtom, PARTNER_FEE)
  store.set(tradeTypeAtom, { tradeType: TradeType.SWAP })

  return store.get(volumeFeeAtom)
}

describe('volumeFeeAtom', () => {
  it('resolves the widget partner fee on an EVM chain', () => {
    expect(readVolumeFee(SupportedChainId.MAINNET)).toEqual({ volumeBps: 50, recipient: PARTNER_FEE.recipient })
  })

  it('charges no partner fee on Solana, where no order collects one', () => {
    expect(readVolumeFee(SupportedChainId.SOLANA)).toBeUndefined()
  })
})
