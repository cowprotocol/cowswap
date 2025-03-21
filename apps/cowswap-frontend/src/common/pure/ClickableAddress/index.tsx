import { MouseEvent, useCallback, useState } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { shortenAddress } from '@cowprotocol/common-utils'
import { Tooltip } from '@cowprotocol/ui'

import { Info } from 'react-feather'

import { Content } from './Content'
import * as styledEl from './styled'

const getTarget = (address: string, chainId: number) => {
  const chainInfo = getChainInfo(chainId)
  return chainInfo ? `${chainInfo.explorer}/address/${address}` : undefined
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

  const [openTooltip, setOpenTooltip] = useState(false)

  const shortAddress = shortenAddress(address)

  const target = getTarget(address, chainId)

  const shouldShowAddress = target && !isNativeToken(address, chainId)

  const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setOpenTooltip((prev) => !prev)
  }, [])

  const handleClickCapture = useCallback((event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    setOpenTooltip((prev) => !prev)
  }, [])

  return (
    shouldShowAddress && (
      <styledEl.Wrapper openTooltip={openTooltip}>
        <styledEl.AddressWrapper>{shortAddress}</styledEl.AddressWrapper>
        <styledEl.InfoIcon onClick={handleClick}>
          <Tooltip
            content={<Content address={address} target={target} />}
            placement="bottom"
            wrapInContainer
            onClickCapture={handleClickCapture}
            show={openTooltip}
          >
            <Info size={16} />
          </Tooltip>
        </styledEl.InfoIcon>
      </styledEl.Wrapper>
    )
  )
}
