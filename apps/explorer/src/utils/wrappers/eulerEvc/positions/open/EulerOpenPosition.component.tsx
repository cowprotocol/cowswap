import React, { ReactElement } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { decodeAbiParameters, parseAbiParameters } from 'viem'

import { EulerOpenPositionParams, EulerOpenPositionView } from './EulerOpenPosition.pure'

import { useConvertToAssets, useVaultAsset } from '../../../../../hooks/euler'
import { useNetworkId } from '../../../../../state/network/hooks'

const OPEN_POSITION_ABI = parseAbiParameters([
  '(address owner, address account, uint256 deadline, address collateralVault, address borrowVault, uint256 collateralAmount, uint256 borrowAmount) params',
  'bytes signature',
])

export function EulerOpenPositionItem({ data }: { data: string }): ReactElement | null {
  let params: EulerOpenPositionParams | null = null

  try {
    const [decoded] = decodeAbiParameters(OPEN_POSITION_ABI, data as `0x${string}`)
    params = decoded
  } catch {
    // handled below
  }

  const chainId = useNetworkId() as SupportedChainId | null
  const collateralAsset = useVaultAsset(params?.collateralVault ?? '')
  const borrowAsset = useVaultAsset(params?.borrowVault ?? '')
  const collateralAssets = useConvertToAssets(params?.collateralVault, params?.collateralAmount)
  const borrowAssets = useConvertToAssets(params?.borrowVault, params?.borrowAmount)

  if (!params) return null

  return (
    <EulerOpenPositionView
      params={params}
      chainId={chainId}
      collateralAsset={collateralAsset}
      borrowAsset={borrowAsset}
      collateralAssets={collateralAssets}
      borrowAssets={borrowAssets}
    />
  )
}
