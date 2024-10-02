import { useState } from 'react'

import { HookToDappMatch } from '@cowprotocol/hook-dapp-lib'

import { ChevronDown, ChevronUp } from 'react-feather'

import { clickOnHooks } from 'modules/analytics'

import * as styledEl from './styled'

export function HookItem({ item, index }: { item: HookToDappMatch; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleLinkClick = () => {
    clickOnHooks(item.dapp?.name || 'Unknown hook dapp')
  }

  return (
    <styledEl.HookItemWrapper as="li">
      <styledEl.HookItemHeader onClick={() => setIsOpen(!isOpen)}>
        <styledEl.HookItemInfo>
          <styledEl.HookNumber>{index + 1}</styledEl.HookNumber>
          {item.dapp ? (
            <>
              <img src={item.dapp.image} alt={item.dapp.name} />
              <span>{item.dapp.name}</span>
            </>
          ) : (
            <span>Unknown hook dapp</span>
          )}
        </styledEl.HookItemInfo>
        <styledEl.ToggleIcon isOpen={isOpen}>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </styledEl.ToggleIcon>
      </styledEl.HookItemHeader>
      {isOpen && item.dapp && (
        <styledEl.HookItemContent>
          <p>
            <b>Description:</b> {item.dapp.descriptionShort}
          </p>
          <p>
            <b>Version:</b> {item.dapp.version}
          </p>
          <p>
            <b>Website:</b>{' '}
            <a href={item.dapp.website} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>
              {item.dapp.website}
            </a>
          </p>
          <p>
            <b>calldata:</b> {item.hook.callData}
          </p>
          <p>
            <b>target:</b> {item.hook.target}
          </p>
          <p>
            <b>gasLimit:</b> {item.hook.gasLimit}
          </p>
        </styledEl.HookItemContent>
      )}
    </styledEl.HookItemWrapper>
  )
}
