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

const COLLATERAL_SWAP_ABI = parseAbiParameters([
  '(address owner, address account, uint256 deadline, address fromVault, address toVault, uint256 fromAmount, bool disableSourceCollateral) params',
  'bytes signature',
])

type CollateralSwapParams = {
  owner: string
  account: string
  deadline: bigint
  fromVault: string
  toVault: string
  fromAmount: bigint
  disableSourceCollateral: boolean
}

interface CollateralSwapViewProps {
  params: CollateralSwapParams
  chainId: SupportedChainId | null
  fromAsset: VaultAsset | undefined
  toAsset: VaultAsset | undefined
  fromAssets: bigint | undefined
  toAssets: bigint | undefined
}

function CollateralSwapView({
  params,
  chainId,
  fromAsset,
  toAsset,
  fromAssets,
  toAssets,
}: CollateralSwapViewProps): React.ReactElement {
  const fromSymbol = fromAsset?.symbol ?? '…'
  const toSymbol = toAsset?.symbol ?? '…'
  const sub = subaccountNumber(params.owner, params.account)

  return (
    <div>
      <TradeCard>
        <TokenBlock>
          <DirectionLabel $green>SWAP OUT</DirectionLabel>
          <TokenSymbol title={`Vault: ${params.fromVault}`}>
            <TokenLink symbol={fromSymbol} tokenAddress={fromAsset?.address} chainId={chainId} />
          </TokenSymbol>
          <TokenAmount>{formatAmount(fromAssets, fromAsset?.decimals)}</TokenAmount>
        </TokenBlock>
        <ArrowSep>→</ArrowSep>
        <TokenBlock>
          <DirectionLabel $green>SWAP IN</DirectionLabel>
          <TokenSymbol title={`Vault: ${params.toVault}`}>
            <TokenLink symbol={toSymbol} tokenAddress={toAsset?.address} chainId={chainId} />
          </TokenSymbol>
          <TokenAmount>≥ {formatAmount(toAssets, toAsset?.decimals)}</TokenAmount>
        </TokenBlock>
      </TradeCard>
      <SubInfo>
        Subaccount #{sub} · Owner <OwnerLink address={params.owner} />
        {params.disableSourceCollateral && <> · {fromSymbol} disabled as collateral after swap</>}
      </SubInfo>
    </div>
  )
}

export function CollateralSwapComponent({ data }: { data: string }): React.ReactElement | null {
  let params: CollateralSwapParams | null = null

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
    <CollateralSwapView
      params={params}
      chainId={chainId}
      fromAsset={fromAsset}
      toAsset={toAsset}
      fromAssets={fromAssets}
      toAssets={toAssets}
    />
  )
}
