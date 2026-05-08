import React, { ReactElement } from 'react'

import { getBlockExplorerUrl, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Color, Media } from '@cowprotocol/ui'

import { Link } from 'react-router'
import styled from 'styled-components/macro'

import { TokenImg } from '../../../components/common/TokenImg'

export const TradeCard = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;

  ${Media.upToExtraSmall()} {
    grid-template-columns: 1fr;
  }
`

export const TokenBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 12px;

  &:first-child {
    padding-right: 32px;
    align-items: flex-start;
  }

  &:last-child {
    padding-left: 32px;
    align-items: flex-end;
  }

  ${Media.upToExtraSmall()} {
    &:first-child {
      padding-right: 12px;
      padding-bottom: 20px;
    }

    &:last-child {
      padding-left: 12px;
      padding-top: 20px;
      align-items: flex-start;
    }
  }
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
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid ${Color.explorer_tableRowBorder};
  border-radius: 16px;
  background: ${Color.explorer_tableRowBorder};
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: ${Color.explorer_grey};

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-right: 1px solid ${Color.explorer_tableRowBorder};
    left: 50%;
    height: 512px;
  }

  &::before {
    bottom: 100%;
  }

  &::after {
    top: 100%;
  }

  ${Media.upToExtraSmall()} {
    transform: translate(-50%, -50%) rotate(90deg);
  }
`

export const SubInfo = styled.p`
  padding: 8px 12px;
  margin: 0;
  font-size: 1.2rem;
  color: ${Color.explorer_grey};
  word-break: normal;
  border-top: 1px solid ${Color.explorer_tableRowBorder};

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
