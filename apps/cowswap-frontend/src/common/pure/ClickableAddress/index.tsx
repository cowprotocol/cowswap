import { MouseEvent, useCallback, useRef, useState } from 'react'

import { ExplorerDataType, getExplorerLink, shortenAddress, getIsNativeToken } from '@cowprotocol/common-utils'
import { Tooltip } from '@cowprotocol/ui'

import { Info } from 'react-feather'

import { Content } from './Content'
import * as styledEl from './styled'

export type ClickableAddressProps = {
  address: string
  chainId: number
}

export function ClickableAddress(props: ClickableAddressProps) {
  const { address, chainId } = props

  const wrapperRef = useRef<HTMLDivElement>(null)

  const [openTooltip, setOpenTooltip] = useState(false)

  const shortAddress = shortenAddress(address)

  const target = getExplorerLink(chainId, address, ExplorerDataType.TOKEN)

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
      <styledEl.Wrapper openTooltip={openTooltip} ref={wrapperRef}>
        <styledEl.AddressWrapper>{shortAddress}</styledEl.AddressWrapper>
        <styledEl.InfoIcon onClick={handleClick}>
          <Tooltip
            content={<Content address={address} target={target} />}
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
