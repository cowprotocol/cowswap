import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useLocation } from 'react-router-dom'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { SelectorContainer, OptionsContainer, Option, NetworkLabel, StyledFAIcon } from './NetworkSelector.styled'
import { replaceURL } from 'utils/url'
import { NO_REDIRECT_HOME_ROUTES } from 'const'
import { cleanNetworkName } from 'utils'
import { NETWORK_OPTIONS } from '../../consts/network'

type networkSelectorProps = {
  networkId: number
}

export const NetworkSelector: React.FC<networkSelectorProps> = ({ networkId }) => {
  const selectContainer = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const name = NETWORK_OPTIONS.find((network) => network.id === networkId)?.name.toLowerCase()
  const [open, setOpen] = useState(false)

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

  const redirectToNetwork = (newNetwork: string, currentNetwork: number): void => {
    const shouldNotRedirectHome = NO_REDIRECT_HOME_ROUTES.some((r: string) => location.pathname.includes(r))

    navigate(shouldNotRedirectHome ? replaceURL(location.pathname, newNetwork, currentNetwork) : `/${newNetwork}`)
  }
  return (
    <SelectorContainer ref={selectContainer} onClick={(): void => setOpen(!open)}>
      {' '}
      <NetworkLabel className={cleanNetworkName(name)}>{name}</NetworkLabel>
      <span className={`arrow ${open && 'open'}`} />
      {open && (
        <OptionsContainer width={selectContainer.current?.offsetWidth || 0}>
          {NETWORK_OPTIONS.map((network) => (
            <Option onClick={(): void => redirectToNetwork(network.url, networkId)} key={network.id}>
              <div className={`dot ${cleanNetworkName(network.name)} `} />
              <div className={`name ${network.id === networkId && 'selected'}`}>{network.name}</div>
              {network.id === networkId && <StyledFAIcon icon={faCheck} />}
            </Option>
          ))}
        </OptionsContainer>
      )}
    </SelectorContainer>
  )
}
