import { useState } from 'react'

import { HookToDappMatch } from '@cowprotocol/hook-dapp-lib'

import { ChevronDown, ChevronUp } from 'react-feather'

import * as styledEl from './styled'

export function HookItem({ item, index }: { item: HookToDappMatch; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

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
            <b>Version:</b> {item.dapp.version}
          </p>
          <p>
            <b>Description:</b> {item.dapp.descriptionShort}
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
