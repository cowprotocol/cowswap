import { MouseEvent, ReactNode, useCallback, useRef, useState } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { ExplorerDataType, getExplorerLink, shortenAddress, getIsNativeToken } from '@cowprotocol/common-utils'
import { Media, Tooltip } from '@cowprotocol/ui'

import { useBridgeSupportedNetwork } from 'entities/bridgeProvider'
import { Info } from 'react-feather'

import { AddressContextMenuContent } from './AddressContextMenuContent'
import * as styledEl from './styled'

export type ClickableAddressProps = {
  address: string
  chainId: number
}

export function ClickableAddress(props: ClickableAddressProps): ReactNode {
  const { address, chainId } = props

  const wrapperRef = useRef<HTMLDivElement>(null)

  const isMobile = useMediaQuery(Media.upToMedium(false))
  const bridgeNetwork = useBridgeSupportedNetwork(chainId)

  const [openTooltip, setOpenTooltip] = useState(false)

  const shortAddress = shortenAddress(address)

  const target = getExplorerLink(chainId, address, ExplorerDataType.TOKEN, bridgeNetwork?.blockExplorer.url)

  const shouldShowAddress = target && !getIsNativeToken(chainId, address)

  const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation?.()
    setOpenTooltip((prev) => !prev)
  }, [])

  const handleClickOutside = useCallback((event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation?.()
    setOpenTooltip(false)
  }, [])

  return (
    shouldShowAddress && (
      <styledEl.Wrapper openTooltip={openTooltip} alwaysShow={isMobile} ref={wrapperRef}>
        <styledEl.AddressWrapper>{shortAddress}</styledEl.AddressWrapper>
        <styledEl.InfoIcon onClick={handleClick}>
          <Tooltip
            content={<AddressContextMenuContent address={address} target={target} />}
            placement="bottom"
            wrapInContainer={false}
            show={openTooltip}
            onClickCapture={handleClickOutside}
            containerRef={wrapperRef}
          >
            <Info size={16} />
          </Tooltip>
        </styledEl.InfoIcon>
      </styledEl.Wrapper>
    )
  )
}
