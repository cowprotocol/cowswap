import { createStore } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import type { TwapOrderItem } from 'modules/twap'

import { eoaTwapOrdersAtom } from './eoaTwapOrdersAtom'
import { twapOrdersAtom } from './twapOrdersAtom'
import { twapOrdersListAtom } from './twapOrdersListAtom'

const EOA = '0x016f34d4f2578c3e9dffc3f2b811ba30c0c9e7f3'
const PROXY = '0x62587918b2f00176646679509217a5a4d1ebbfd5'

function makeOrder(
  id: string,
  safeAddress: string,
  chainId: SupportedChainId = SupportedChainId.GNOSIS_CHAIN,
  resolvedOwner: string = safeAddress,
  hash?: string,
): TwapOrderItem {
  return {
    id,
    hash,
    chainId,
    safeAddress,
    resolvedOwner,
    status: 'Pending' as TwapOrderItem['status'],
    submissionDate: new Date(0).toISOString(),
    order: {
      sellToken: '0x2222222222222222222222222222222222222222',
      buyToken: '0x3333333333333333333333333333333333333333',
      receiver: EOA,
      partSellAmount: '1',
      minPartLimit: '1',
      t0: 0,
      n: 1,
      t: 60,
      span: 0,
      appData: `0x${'45'.repeat(32)}`,
    },
    executionInfo: {
      confirmedPartsCount: 0,
      info: { executedSellAmount: '0', executedBuyAmount: '0', executedFeeAmount: '0' },
    },
    partOrdersCount: hash ? 0 : undefined,
  }
}

describe('twapOrdersListAtom', () => {
  it('selects Safe and EOA orders by resolved owner and chain', () => {
    const store = createStore()
    const safe = makeOrder('safe', EOA)
    const legacySafe = makeOrder('legacy-safe', EOA)
    const optimisticEoa = makeOrder('optimistic-eoa', PROXY, SupportedChainId.GNOSIS_CHAIN, EOA)
    const indexedEoa = makeOrder('indexed-eoa-event', PROXY, SupportedChainId.GNOSIS_CHAIN, EOA, optimisticEoa.id)
    const recreatedEoa = makeOrder('recreated-eoa-event', PROXY, SupportedChainId.GNOSIS_CHAIN, EOA, optimisticEoa.id)

    Reflect.deleteProperty(legacySafe, 'resolvedOwner')

    store.set(walletInfoAtom, { account: EOA, chainId: SupportedChainId.GNOSIS_CHAIN })
    store.set(twapOrdersAtom, { [safe.id]: safe, [legacySafe.id]: legacySafe, [optimisticEoa.id]: optimisticEoa })
    store.set(eoaTwapOrdersAtom, {
      [indexedEoa.id]: indexedEoa,
      [recreatedEoa.id]: recreatedEoa,
      proxy: makeOrder('proxy', PROXY, SupportedChainId.GNOSIS_CHAIN, PROXY, 'proxy-hash'),
      mainnet: makeOrder('mainnet', PROXY, SupportedChainId.MAINNET, EOA, 'mainnet-hash'),
    })

    expect(store.get(twapOrdersListAtom).map(({ id }) => id)).toEqual([
      'safe',
      'legacy-safe',
      'indexed-eoa-event',
      'recreated-eoa-event',
    ])
  })
})
