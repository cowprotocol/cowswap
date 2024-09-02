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
import * as styledEl from '../PreHookButton/styled'

export function PostHookButton() {
  const { account } = useWalletInfo()
  const [open, setOpen] = useState(false)
  const hooks = useAtomValue(hooksAtom)
  const removeHook = useRemoveHook()

  return (
    <>
      {hooks.postHooks && (
        <styledEl.HookList>
          {hooks.postHooks.map((hook, index) => (
            <HookItem key={index} account={account} hookDetails={hook} removeHook={removeHook} isPreHook={false} />
          ))}
        </styledEl.HookList>
      )}
      <styledEl.Wrapper>
        <styledEl.AddHookButton onClick={() => setOpen(true)}>
          <SVG src={PLUS_ICON} /> Add Post-Hook Action <HookTooltip isPreHook={false} />
        </styledEl.AddHookButton>{' '}
      </styledEl.Wrapper>
      {open && <HookStoreModal onDismiss={() => setOpen(false)} isPreHook={false} />}
    </>
  )
}
