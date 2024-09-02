import { useAtomValue } from 'jotai/index'
import { useState } from 'react'

import PLUS_ICON from '@cowprotocol/assets/cow-swap/plus.svg'
import { useWalletInfo } from '@cowprotocol/wallet'

import SVG from 'react-inlinesvg'

import * as styledEl from './styled'

import { useRemoveHook } from '../../hooks/useRemoveHook'
import { HookItem } from '../../pure/HookItem'
import { HookTooltip } from '../../pure/HookTooltip'
import { hooksAtom } from '../../state/hookDetailsAtom'
import { HookStoreModal } from '../HookStoreModal'

export function PreHookButton() {
  const { account } = useWalletInfo()
  const [open, setOpen] = useState(false)
  const hooks = useAtomValue(hooksAtom)
  const removeHook = useRemoveHook()
  return (
    <>
      {hooks.preHooks.length > 0 && (
        <styledEl.HookList>
          {hooks.preHooks.map((hookDetails, index) => (
            <HookItem key={index} account={account} hookDetails={hookDetails} removeHook={removeHook} isPreHook />
          ))}
        </styledEl.HookList>
      )}

      <styledEl.Wrapper>
        <styledEl.AddHookButton onClick={() => setOpen(true)}>
          <SVG src={PLUS_ICON} /> Add Pre-Hook Action <HookTooltip isPreHook />
        </styledEl.AddHookButton>{' '}
      </styledEl.Wrapper>
      {open && <HookStoreModal onDismiss={() => setOpen(false)} isPreHook />}
    </>
  )
}
