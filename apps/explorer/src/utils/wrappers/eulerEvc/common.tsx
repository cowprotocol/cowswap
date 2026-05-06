import React, { ReactElement } from 'react'

import { getBlockExplorerUrl, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Color } from '@cowprotocol/ui'

import { Link } from 'react-router'
import styled from 'styled-components/macro'

import { TokenImg } from '../../../components/common/TokenImg'

export const TradeCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 2rem;
`

export const TokenBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`

export const DirectionLabel = styled.span<{ $green?: boolean }>`
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: ${({ $green }) => ($green ? Color.explorer_green1 : Color.explorer_red1)};
`

export const TokenSymbol = styled.span`
  font-size: 2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  a {
    color: ${Color.explorer_textActive};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`

export const TokenAmount = styled.span`
  font-size: 1.3rem;
`

export const ArrowSep = styled.span`
  font-size: 2rem;
  color: ${Color.explorer_grey};
  /* offset past the direction label row so the arrow sits beside the token symbols */
  margin-top: 1.5rem;
`

export const SubInfo = styled.p`
  margin: 0.8rem 0 0;
  font-size: 1.2rem;
  color: ${Color.explorer_grey};
  word-break: normal;

  a {
    color: ${Color.explorer_textActive};
    &:hover {
      opacity: 0.8;
    }
  }
`

const TokenIcon = styled(TokenImg)`
  width: 2rem;
  height: 2rem;
`

export function TokenLink({
  symbol,
  tokenAddress,
  chainId,
}: {
  symbol: string
  tokenAddress: string | undefined
  chainId: SupportedChainId | null
}): ReactElement {
  if (!tokenAddress || !chainId) return <>{symbol}</>
  const url = getBlockExplorerUrl(chainId, 'token', tokenAddress)
  return (
    <>
      <TokenIcon address={tokenAddress} network={chainId} symbol={symbol} />
      <a href={url} target="_blank" rel="noopener noreferrer" title={tokenAddress}>
        {symbol}
      </a>
    </>
  )
}

export function OwnerLink({ address }: { address: string }): ReactElement {
  return (
    <Link to={`/address/${address}`} title={address}>
      {shortenAddress(address)}↗
    </Link>
  )
}

export function formatAmount(raw: bigint | undefined, decimals: number | undefined): string {
  if (raw === undefined) return '…'
  if (decimals === undefined) return raw.toString()
  return (Number(raw) / 10 ** decimals).toLocaleString(undefined, { maximumFractionDigits: 6 })
}

export function subaccountNumber(owner: string, account: string): number {
  return parseInt(owner.slice(-2), 16) ^ parseInt(account.slice(-2), 16)
}
