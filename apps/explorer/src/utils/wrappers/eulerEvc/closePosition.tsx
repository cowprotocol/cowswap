import React from 'react'

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

import { useOrderContext } from '../../../components/orders/OrderWrapperDetails'
import { VaultAsset, useConvertToAssets, useVaultAsset } from '../../../hooks/euler'
import { useNetworkId } from '../../../state/network/hooks'

const CLOSE_POSITION_ABI = parseAbiParameters([
  '(address owner, address account, uint256 deadline, address borrowVault, address collateralVault, uint256 collateralAmount) params',
  'bytes signature',
])

type ClosePositionParams = {
  owner: string
  account: string
  deadline: bigint
  borrowVault: string
  collateralVault: string
  collateralAmount: bigint
}

interface ClosePositionViewProps {
  params: ClosePositionParams
  chainId: SupportedChainId | null
  collateralAsset: VaultAsset | undefined
  borrowAsset: VaultAsset | undefined
  collateralAssets: bigint | undefined
  order: ReturnType<typeof useOrderContext>
}

function ClosePositionView({
  params,
  chainId,
  collateralAsset,
  borrowAsset,
  collateralAssets,
  order,
}: ClosePositionViewProps): React.ReactElement {
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

export function ClosePositionComponent({ data }: { data: string }): React.ReactElement | null {
  let params: ClosePositionParams | null = null

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
    <ClosePositionView
      params={params}
      chainId={chainId}
      collateralAsset={collateralAsset}
      borrowAsset={borrowAsset}
      collateralAssets={collateralAssets}
      order={order}
    />
  )
}
