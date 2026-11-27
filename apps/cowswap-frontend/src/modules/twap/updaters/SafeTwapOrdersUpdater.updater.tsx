import { useAtomValue } from 'jotai'
import { ReactNode, Suspense } from 'react'

import { getAddressKey } from '@cowprotocol/cow-sdk'
import { isSafeViaWcAtom, isSafeWalletAtom, useWalletInfo } from '@cowprotocol/wallet'

import { useComposableCowContractData } from 'modules/advancedOrders'

import { CreatedInOrderBookOrdersUpdater } from './CreatedInOrderBookOrdersUpdater'
import { PartOrdersUpdater } from './PartOrdersUpdater'
import { TwapOrdersUpdater } from './TwapOrdersUpdater'

export function SafeTwapOrdersUpdater(): ReactNode {
  const { account } = useWalletInfo()
  const isSafeWallet = useAtomValue(isSafeWalletAtom)
  const isSafeViaWc = useAtomValue(isSafeViaWcAtom) === true
  const composableCowContract = useComposableCowContractData()

  if (!account || !composableCowContract.address || (!isSafeWallet && !isSafeViaWc)) return null

  const { chainId } = composableCowContract

  return (
    <Suspense key={`${chainId}:${getAddressKey(account)}`} fallback={null}>
      <CreatedInOrderBookOrdersUpdater />
      <PartOrdersUpdater />
      <TwapOrdersUpdater composableCowContract={composableCowContract} safeAddress={account} chainId={chainId} />
    </Suspense>
  )
}
