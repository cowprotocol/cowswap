import React, { ReactElement } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useOrderContext } from '../../../../../components/orders/OrderWrapperDetails/OrderWrapperDetails.provider'
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
} from '../../EulerWrappers.styles'

export interface EulerClosePositionParams {
  owner: string
  account: string
  deadline: bigint
  borrowVault: string
  collateralVault: string
  collateralAmount: bigint
}

export interface EulerClosePositionViewProps {
  params: EulerClosePositionParams
  chainId: SupportedChainId | null
  collateralAsset: VaultAsset | undefined
  borrowAsset: VaultAsset | undefined
  collateralAssets: bigint | undefined
  order: ReturnType<typeof useOrderContext>
}

export function EulerClosePositionView({
  params,
  chainId,
  collateralAsset,
  borrowAsset,
  collateralAssets,
  order,
}: EulerClosePositionViewProps): ReactElement {
  const collateralSymbol = collateralAsset?.symbol ?? '…'
  const borrowSymbol = order?.buyToken?.symbol ?? borrowAsset?.symbol ?? '…'
  const borrowTokenAddress = order?.buyToken?.address ?? borrowAsset?.address
  const sub = subaccountNumber(params.owner, params.account)
  const repayAmount =
    order?.buyAmount && order.buyToken
      ? formatAmount(BigInt(order.buyAmount.toFixed(0)), order.buyToken.decimals)
      : undefined

  return (
    <div>
      <TradeCard>
        <TokenBlock>
          <DirectionLabel $green>COLLATERAL</DirectionLabel>
          <TokenSymbol title={`Vault: ${params.collateralVault}`}>
            <TokenLink symbol={collateralSymbol} tokenAddress={collateralAsset?.address} chainId={chainId} />
          </TokenSymbol>
          <TokenAmount>≤ {formatAmount(collateralAssets, collateralAsset?.decimals)}</TokenAmount>
        </TokenBlock>
        <ArrowSep>→</ArrowSep>
        <TokenBlock>
          <DirectionLabel $green={false}>REPAY DEBT</DirectionLabel>
          <TokenSymbol title={`Vault: ${params.borrowVault}`}>
            <TokenLink symbol={borrowSymbol} tokenAddress={borrowTokenAddress} chainId={chainId} />
          </TokenSymbol>
          {repayAmount && <TokenAmount>{repayAmount}</TokenAmount>}
        </TokenBlock>
      </TradeCard>
      <SubInfo>
        Subaccount #{sub} · Owner <OwnerLink address={params.owner} />
      </SubInfo>
    </div>
  )
}
