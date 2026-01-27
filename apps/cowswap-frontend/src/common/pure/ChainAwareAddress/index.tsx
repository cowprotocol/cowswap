import { ReactNode, useMemo } from 'react'

import { isAddress, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { NetworkLogo, UI } from '@cowprotocol/ui'

import { useBridgeSupportedNetwork } from 'entities/bridgeProvider'
import styled from 'styled-components/macro'

import { getChainType } from 'common/chains/nonEvm'

import { AddressLink } from '../AddressLink'

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`

const LogoImg = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 50%;
`

const AddressText = styled.span`
  font-size: 13px;
  color: var(${UI.COLOR_TEXT});
`

const AddressLinkText = styled.a`
  font-size: 13px;
  color: var(${UI.COLOR_TEXT});
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

function shortenNonEvmAddress(address: string): string {
  if (address.length <= 18) return address

  return `${address.slice(0, 8)}…${address.slice(-6)}`
}

export interface ChainAwareAddressProps {
  address: string
  chainId: number
  className?: string
}

export function ChainAwareAddress({ address, chainId, className }: ChainAwareAddressProps): ReactNode {
  const chainType = getChainType(chainId)
  const isSupportedChainId = chainId in SupportedChainId
  const bridgeNetwork = useBridgeSupportedNetwork(chainId)

  const logoUrl = bridgeNetwork ? bridgeNetwork.logo.light : undefined
  const nonEvmExplorerUrl =
    chainType === 'solana'
      ? `https://explorer.solana.com/address/${address}`
      : chainType === 'bitcoin'
        ? `https://www.blockchain.com/btc/address/${address}`
        : undefined

  const nonEvmContent = useMemo(() => {
    const nonEvmLabel = shortenNonEvmAddress(address)

    return (
      <Wrapper className={className}>
        {logoUrl && <LogoImg src={logoUrl} alt={bridgeNetwork?.label || 'Network logo'} />}
        {nonEvmExplorerUrl ? (
          <AddressLinkText href={nonEvmExplorerUrl} target="_blank" rel="noreferrer">
            {nonEvmLabel} ↗
          </AddressLinkText>
        ) : (
          <AddressText>{nonEvmLabel}</AddressText>
        )}
      </Wrapper>
    )
  }, [address, bridgeNetwork?.label, className, logoUrl, nonEvmExplorerUrl])

  if (chainType !== 'evm') {
    return nonEvmContent
  }

  if (!isAddress(address)) {
    return <AddressText className={className}>{address}</AddressText>
  }

  return (
    <Wrapper className={className}>
      {isSupportedChainId && <NetworkLogo chainId={chainId as SupportedChainId} size={16} />}
      <AddressLink address={address} chainId={chainId} content={shortenAddress(address)} />
    </Wrapper>
  )
}
