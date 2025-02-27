import { useMemo, MouseEvent } from 'react'

import { shortenAddress } from '@cowprotocol/common-utils'

import * as styledEl from './styled'

import { CopyToClipboard } from '../CopyToClipboard'

export type ClickableAddressProps = {
  address: string
  chainId?: number
}

// TODO: once we have more chains, we should use the chainId to get the correct explorer
const mapChainIdToExplorer: { [key: string]: { name: string; url: string } } = {
  1: { name: 'Etherscan (Mainnet)', url: 'https://etherscan.io/address' },
  11155111: { name: 'Etherscan (Sepolia)', url: 'https://sepolia.etherscan.io/address' },
}

const getTarget = (address: string, chainId?: number) => {
  const explorer = chainId ? mapChainIdToExplorer[chainId.toString()] : mapChainIdToExplorer['1']
  return `${explorer.url}/${address}`
}

const getTitle = (address: string, chainId?: number) => {
  const explorer = chainId ? mapChainIdToExplorer[chainId.toString()] : mapChainIdToExplorer['1']
  return `View ${address} on ${explorer.name}`
}

export function ClickableAddress(props: ClickableAddressProps) {
  const { address, chainId } = props

  const shortAddress = shortenAddress(address)

  const target = useMemo(() => getTarget(address, chainId), [address, chainId])
  const title = useMemo(() => getTitle(address, chainId), [address, chainId])

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation()
  }

  return (
    <styledEl.Wrapper>
      <styledEl.AddressWrapper
        to={target}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
        onClick={handleClick}
      >
        {shortAddress}
      </styledEl.AddressWrapper>
      <CopyToClipboard text={address} iconClassName="clickable-address-copy-to-clipboard" />
    </styledEl.Wrapper>
  )
}
