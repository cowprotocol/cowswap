import React from 'react'

import { getBlockExplorerUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Color } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { Link } from 'react-router'
import { decodeAbiParameters, parseAbiParameters } from 'viem'

import { useOrderContext } from '../../components/orders/OrderWrapperDetails'
import { useNetworkId } from '../../state/network/hooks'
import { useConvertToAssets, useVaultAsset } from './_vaultLookup'

// ─── Trade card primitives ───────────────────────────────────────────────────

const TradeCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 2rem;
`

const TokenBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`

const DirectionLabel = styled.span<{ $green?: boolean }>`
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: ${({ $green }) => ($green ? Color.explorer_green1 : Color.explorer_red1)};
`

const TokenSymbol = styled.span`
  font-size: 2rem;
  font-weight: 600;

  a {
    color: inherit;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`

const TokenAmount = styled.span`
  font-size: 1.3rem;
`

const ArrowSep = styled.span`
  font-size: 2rem;
  color: ${Color.explorer_textSecondary};
  /* offset past the direction label row so the arrow sits beside the token symbols */
  margin-top: 1.5rem;
`

const SubInfo = styled.p`
  margin: 0.8rem 0 0;
  font-size: 1.2rem;
  color: ${Color.explorer_textSecondary};

  a {
    color: inherit;
    &:hover { opacity: 0.8; }
  }
`

// ─── Helpers ──────────────────────────────────────────────────────────────────

function TokenLink({
  symbol,
  tokenAddress,
  chainId,
}: {
  symbol: string
  tokenAddress: string | undefined
  chainId: SupportedChainId | null
}): React.ReactElement {
  if (!tokenAddress || !chainId) return <>{symbol}</>
  const url = getBlockExplorerUrl(chainId, 'token', tokenAddress)
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" title={tokenAddress}>
      {symbol}
    </a>
  )
}

function OwnerLink({ address }: { address: string }): React.ReactElement {
  return (
    <Link to={`/address/${address}`} title={address}>
      {address.slice(0, 6)}…{address.slice(-4)}
    </Link>
  )
}

function formatAmount(raw: bigint | undefined, decimals: number | undefined): string {
  if (raw === undefined) return '…'
  if (decimals === undefined) return raw.toString()
  return (Number(raw) / 10 ** decimals).toLocaleString(undefined, { maximumFractionDigits: 6 })
}

function subaccountNumber(owner: string, account: string): number {
  return parseInt(owner.slice(-2), 16) ^ parseInt(account.slice(-2), 16)
}

// ─── Open Position ────────────────────────────────────────────────────────────

const OPEN_POSITION_ABI = parseAbiParameters([
  '(address owner, address account, uint256 deadline, address collateralVault, address borrowVault, uint256 collateralAmount, uint256 borrowAmount) params',
  'bytes signature',
])

export function OpenPositionComponent({ data }: { data: string }): React.ReactElement | null {
  let params: {
    owner: string
    account: string
    deadline: bigint
    collateralVault: string
    borrowVault: string
    collateralAmount: bigint
    borrowAmount: bigint
  } | null = null

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

// ─── Close Position ───────────────────────────────────────────────────────────

const CLOSE_POSITION_ABI = parseAbiParameters([
  '(address owner, address account, uint256 deadline, address borrowVault, address collateralVault, uint256 collateralAmount) params',
  'bytes signature',
])

export function ClosePositionComponent({ data }: { data: string }): React.ReactElement | null {
  let params: {
    owner: string
    account: string
    deadline: bigint
    borrowVault: string
    collateralVault: string
    collateralAmount: bigint
  } | null = null

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

  const collateralSymbol = collateralAsset?.symbol ?? '…'
  const borrowSymbol = order?.buyToken?.symbol ?? (borrowAsset?.symbol ?? '…')
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

// ─── Collateral Swap ──────────────────────────────────────────────────────────

const COLLATERAL_SWAP_ABI = parseAbiParameters([
  '(address owner, address account, uint256 deadline, address fromVault, address toVault, uint256 fromAmount, bool disableSourceCollateral) params',
  'bytes signature',
])

export function CollateralSwapComponent({ data }: { data: string }): React.ReactElement | null {
  let params: {
    owner: string
    account: string
    deadline: bigint
    fromVault: string
    toVault: string
    fromAmount: bigint
    disableSourceCollateral: boolean
  } | null = null

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
