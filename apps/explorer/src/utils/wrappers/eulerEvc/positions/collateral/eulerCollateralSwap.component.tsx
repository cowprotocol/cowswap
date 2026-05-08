import React, { ReactElement } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { decodeAbiParameters, parseAbiParameters } from 'viem'

import { EulerCollateralSwapParams, EulerCollateralSwapView } from './eulerCollateralSwap.pure'

import { useOrderContext } from '../../../../../components/orders/OrderWrapperDetails/OrderWrapperDetails.provider'
import { useConvertToAssets, useVaultAsset } from '../../../../../hooks/euler'
import { useNetworkId } from '../../../../../state/network/hooks'

const COLLATERAL_SWAP_ABI = parseAbiParameters([
  '(address owner, address account, uint256 deadline, address fromVault, address toVault, uint256 fromAmount, bool disableSourceCollateral) params',
  'bytes signature',
])

export function EulerCollateralSwapItem({ data }: { data: string }): ReactElement | null {
  let params: EulerCollateralSwapParams | null = null

  try {
    const [decoded] = decodeAbiParameters(COLLATERAL_SWAP_ABI, data as `0x${string}`)
    params = decoded
  } catch {
    // handled below
  }

  const chainId = useNetworkId() as SupportedChainId | null
  const fromAsset = useVaultAsset(params?.fromVault ?? '')
  const toAsset = useVaultAsset(params?.toVault ?? '')
  const fromAssets = useConvertToAssets(params?.fromVault, params?.fromAmount)
  const order = useOrderContext()
  const buyShares = order?.buyAmount ? BigInt(order.buyAmount.toFixed(0)) : undefined
  const toAssets = useConvertToAssets(params?.toVault, buyShares)

  if (!params) return null

  return (
    <EulerCollateralSwapView
      params={params}
      chainId={chainId}
      fromAsset={fromAsset}
      toAsset={toAsset}
      fromAssets={fromAssets}
      toAssets={toAssets}
    />
  )
}
