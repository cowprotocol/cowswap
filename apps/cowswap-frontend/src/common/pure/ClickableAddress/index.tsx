import { MouseEvent } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { shortenAddress } from '@cowprotocol/common-utils'
import { HoverTooltip } from '@cowprotocol/ui'

import CopyHelper, { CopyIcon } from 'legacy/components/Copy/CopyMod'

import * as styledEl from './styled'

const getTarget = (address: string, chainId: number) => {
  const chainInfo = getChainInfo(chainId)
  return chainInfo ? `${chainInfo.explorer}/address/${address}` : undefined
}

const getTitle = (address: string, chainId: number) => {
  const chainInfo = getChainInfo(chainId)

  if (chainInfo?.explorerTitle === 'Etherscan' && chainInfo?.name !== 'mainnet') {
    return `View ${address} on (${chainInfo.label}) ${chainInfo.explorerTitle}`
  }

  return chainInfo ? `View ${address} on ${chainInfo.explorerTitle}` : undefined
}

const isNativeToken = (address: string, chainId: number) => {
  const chainInfo = getChainInfo(chainId)
  return chainInfo ? chainInfo.nativeCurrency.address === address : false
}

export type ClickableAddressProps = {
  address: string
  chainId: number
}

export function ClickableAddress(props: ClickableAddressProps) {
  const { address, chainId } = props

  const shortAddress = shortenAddress(address)

  const target = getTarget(address, chainId)
  const title = getTitle(address, chainId)

  const shouldShowAddress = target && title && !isNativeToken(address, chainId)

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation()
  }

  return (
    shouldShowAddress && (
      <styledEl.Wrapper>
        <HoverTooltip {...props} placement="bottom" content={title} wrapInContainer>
          <styledEl.AddressWrapper to={target} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
            {shortAddress}
          </styledEl.AddressWrapper>
        </HoverTooltip>
        <CopyHelper toCopy={address} clickableLink={false}>
          <CopyIcon />
        </CopyHelper>
      </styledEl.Wrapper>
    )
  )
}
