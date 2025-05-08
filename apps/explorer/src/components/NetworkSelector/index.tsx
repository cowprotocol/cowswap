import React, { useEffect, useRef, useState } from 'react'

import { CHAIN_INFO, getChainInfo } from '@cowprotocol/common-const'
import { useAvailableChains } from '@cowprotocol/common-hooks'

import { faCheck } from '@fortawesome/free-solid-svg-icons'

import { NetworkLabel, Option, OptionsContainer, SelectorContainer, StyledFAIcon } from './NetworkSelector.styled'

import { usePathSuffix } from '../../state/network'

type networkSelectorProps = {
  networkId: number
}

const ROUTES_WITH_PRESERVED_PATH = ['address']

export const NetworkSelector: React.FC<networkSelectorProps> = ({ networkId }) => {
  const selectContainer = useRef<HTMLInputElement>(null)
  const currentNetwork = getChainInfo(networkId)
  const currentNetworkName = currentNetwork.label.toLowerCase()
  const [open, setOpen] = useState(false)
  const pathSuffix = usePathSuffix()
  const availableChains = useAvailableChains()

  useEffect(() => {
    const closeOpenSelector = (e: MouseEvent | KeyboardEvent): void => {
      if (!open) return
      if (e instanceof KeyboardEvent) {
        if (e.key === 'Escape') {
          setOpen(false)
          return
        }
      } else if (selectContainer.current && !selectContainer.current.contains(e.target as HTMLElement)) {
        setOpen(false)
      }
    }

    window.addEventListener('mousedown', closeOpenSelector)
    window.addEventListener('keydown', closeOpenSelector)

    return (): void => {
      window.removeEventListener('mousedown', closeOpenSelector)
      window.removeEventListener('keydown', closeOpenSelector)
    }
  }, [open])

  return (
    <SelectorContainer ref={selectContainer} onClick={(): void => setOpen(!open)}>
      {' '}
      <NetworkLabel color={currentNetwork.color}>{currentNetworkName}</NetworkLabel>
      <span className={`arrow ${open && 'open'}`} />
      {open && (
        <OptionsContainer width={selectContainer.current?.offsetWidth || 0}>
          {availableChains.map((itemNetworkId) => {
            const network = CHAIN_INFO[itemNetworkId]

            /**
             * When path starts with 'address' we want to keep the same path
             * It allows users to check their account in multiple networks without needing to search for it again
             */
            const shouldPreservePath = ROUTES_WITH_PRESERVED_PATH.some((route) => pathSuffix?.startsWith(route))
            const url = shouldPreservePath ? `${network.urlAlias}/${pathSuffix || ''}` : network.urlAlias

            return (
              <Option to={'../' + url} color={network.color} key={itemNetworkId}>
                <div className="dot" />
                <div className={`name ${itemNetworkId === networkId && 'selected'}`}>{network.label}</div>
                {itemNetworkId === networkId && <StyledFAIcon icon={faCheck} />}
              </Option>
            )
          })}
        </OptionsContainer>
      )}
    </SelectorContainer>
  )
}
