import React, { ReactElement } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { decodeAbiParameters, parseAbiParameters } from 'viem'

import { EulerClosePositionParams, EulerClosePositionView } from './eulerClosePosition.pure'

import { useOrderContext } from '../../../../../components/orders/OrderWrapperDetails/OrderWrapperDetails.provider'
import { useConvertToAssets, useVaultAsset } from '../../../../../hooks/euler'
import { useNetworkId } from '../../../../../state/network/hooks'

const CLOSE_POSITION_ABI = parseAbiParameters([
  '(address owner, address account, uint256 deadline, address borrowVault, address collateralVault, uint256 collateralAmount) params',
  'bytes signature',
])

export function EulerClosePositionItem({ data }: { data: string }): ReactElement | null {
  let params: EulerClosePositionParams | null = null

  try {
    const [decoded] = decodeAbiParameters(CLOSE_POSITION_ABI, data as `0x${string}`)
    params = decoded
  } catch {
    // handled below
  }

  const chainId = useNetworkId() as SupportedChainId | null
  const collateralAsset = useVaultAsset(params?.collateralVault ?? '')
  const borrowAsset = useVaultAsset(params?.borrowVault ?? '')
  const collateralAssets = useConvertToAssets(params?.collateralVault, params?.collateralAmount)
  const order = useOrderContext()

  if (!params) return null

  return (
    <EulerClosePositionView
      params={params}
      chainId={chainId}
      collateralAsset={collateralAsset}
      borrowAsset={borrowAsset}
      collateralAssets={collateralAssets}
      order={order}
    />
  )
}
