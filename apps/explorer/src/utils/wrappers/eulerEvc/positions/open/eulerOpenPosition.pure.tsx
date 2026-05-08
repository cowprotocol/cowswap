import React, { ReactElement } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { VaultAsset } from '../../../../../hooks/euler'
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
} from '../../eulerWrappers.styles'

export interface EulerOpenPositionParams {
  owner: string
  account: string
  deadline: bigint
  collateralVault: string
  borrowVault: string
  collateralAmount: bigint
  borrowAmount: bigint
}

export interface EulerOpenPositionViewProps {
  params: EulerOpenPositionParams
  chainId: SupportedChainId | null
  collateralAsset: VaultAsset | undefined
  borrowAsset: VaultAsset | undefined
  collateralAssets: bigint | undefined
  borrowAssets: bigint | undefined
}

export function EulerOpenPositionView({
  params,
  chainId,
  collateralAsset,
  borrowAsset,
  collateralAssets,
  borrowAssets,
}: EulerOpenPositionViewProps): ReactElement {
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
