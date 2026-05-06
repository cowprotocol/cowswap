import React, { ReactElement } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { decodeAbiParameters, parseAbiParameters } from 'viem'

import {
  ArrowSep,
  DirectionLabel,
  OwnerLink,
  SubInfo,
  TokenAmount,
  TokenBlock,
  TokenLink,
  TokenSymbol,
  TradeCard,
  formatAmount,
  subaccountNumber,
} from './common'

import { VaultAsset, useConvertToAssets, useVaultAsset } from '../../../hooks/euler'
import { useNetworkId } from '../../../state/network/hooks'

const OPEN_POSITION_ABI = parseAbiParameters([
  '(address owner, address account, uint256 deadline, address collateralVault, address borrowVault, uint256 collateralAmount, uint256 borrowAmount) params',
  'bytes signature',
])

type OpenPositionParams = {
  owner: string
  account: string
  deadline: bigint
  collateralVault: string
  borrowVault: string
  collateralAmount: bigint
  borrowAmount: bigint
}

interface OpenPositionViewProps {
  params: OpenPositionParams
  chainId: SupportedChainId | null
  collateralAsset: VaultAsset | undefined
  borrowAsset: VaultAsset | undefined
  collateralAssets: bigint | undefined
  borrowAssets: bigint | undefined
}

function OpenPositionView({
  params,
  chainId,
  collateralAsset,
  borrowAsset,
  collateralAssets,
  borrowAssets,
}: OpenPositionViewProps): ReactElement {
  const collateralSymbol = collateralAsset?.symbol ?? '…'
  const borrowSymbol = borrowAsset?.symbol ?? '…'
  const sub = subaccountNumber(params.owner, params.account)

  return (
    <div>
      <TradeCard>
        <TokenBlock>
          <DirectionLabel $green>LONG</DirectionLabel>
          <TokenSymbol title={`Vault: ${params.collateralVault}`}>
            <TokenLink symbol={collateralSymbol} tokenAddress={collateralAsset?.address} chainId={chainId} />
          </TokenSymbol>
          <TokenAmount>≥ {formatAmount(collateralAssets, collateralAsset?.decimals)}</TokenAmount>
        </TokenBlock>
        <ArrowSep>→</ArrowSep>
        <TokenBlock>
          <DirectionLabel $green={false}>SHORT</DirectionLabel>
          <TokenSymbol title={`Vault: ${params.borrowVault}`}>
            <TokenLink symbol={borrowSymbol} tokenAddress={borrowAsset?.address} chainId={chainId} />
          </TokenSymbol>
          <TokenAmount>{formatAmount(borrowAssets, borrowAsset?.decimals)}</TokenAmount>
        </TokenBlock>
      </TradeCard>
      <SubInfo>
        Subaccount #{sub} · Owner <OwnerLink address={params.owner} />
      </SubInfo>
    </div>
  )
}

export function OpenPositionComponent({ data }: { data: string }): ReactElement | null {
  let params: OpenPositionParams | null = null

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
    <OpenPositionView
      params={params}
      chainId={chainId}
      collateralAsset={collateralAsset}
      borrowAsset={borrowAsset}
      collateralAssets={collateralAssets}
      borrowAssets={borrowAssets}
    />
  )
}
