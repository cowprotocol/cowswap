import { useAtomValue } from 'jotai/index'
import { useState } from 'react'

import { ButtonSecondaryAlt } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

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
        <styledEl.ButtonGroup>
          <ButtonSecondaryAlt onClick={() => setOpen(true)}>🪝 Add Post-hook</ButtonSecondaryAlt>{' '}
          <HookTooltip isPreHook={false} />
        </styledEl.ButtonGroup>
      </styledEl.Wrapper>
      {open && <HookStoreModal onDismiss={() => setOpen(false)} isPreHook={false} />}
    </>
  )
}
