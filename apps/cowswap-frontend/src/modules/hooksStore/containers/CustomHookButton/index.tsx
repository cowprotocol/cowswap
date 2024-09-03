import { useAtomValue } from 'jotai/index'
import { useState } from 'react'

import PLUS_ICON from '@cowprotocol/assets/cow-swap/plus.svg'
import { useWalletInfo } from '@cowprotocol/wallet'

import SVG from 'react-inlinesvg'

import { useRemoveHook } from '../../hooks/useRemoveHook'
import { HookItem } from '../../pure/HookItem'
import { HookTooltip } from '../../pure/HookTooltip'
import { hooksAtom } from '../../state/hookDetailsAtom'
import { HookStoreModal } from '../HookStoreModal'
import * as styledEl from '../styled'

// TODO: Add custom hook logic
export function CustomHookButton() {
  const { account } = useWalletInfo()
  const [open, setOpen] = useState(false)
  const hooks = useAtomValue(hooksAtom)
  const removeHook = useRemoveHook()
  return (
    <>
      {hooks.customHooks.length > 0 && (
        <styledEl.HookList>
          {hooks.customHooks.map((hookDetails, index) => (
            <HookItem
              key={index}
              account={account}
              hookDetails={hookDetails}
              removeHook={removeHook}
              isPreHook={false}
            />
          ))}
        </styledEl.HookList>
      )}

      <styledEl.Wrapper>
        <styledEl.AddHookButton onClick={() => setOpen(true)}>
          <SVG src={PLUS_ICON} /> Add Custom Hook
        </styledEl.AddHookButton>{' '}
      </styledEl.Wrapper>
      {open && <HookStoreModal onDismiss={() => setOpen(false)} isPreHook />}
    </>
  )
}
