import { useAtomValue } from 'jotai/index'
import { useState } from 'react'

import { ButtonSecondaryAlt } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Link } from 'legacy/components/Link'

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
        <styledEl.ButtonGroup>
          <ButtonSecondaryAlt onClick={() => setOpen(true)}>🪝 Add Pre-hook</ButtonSecondaryAlt>{' '}
          <HookTooltip isPreHook />
        </styledEl.ButtonGroup>
        <styledEl.List>
          <li>
            📚 <Link href="https://docs.cow.fi/cow-protocol/reference/sdks/cow-sdk">Learn more about hooks</Link>
          </li>
          <li>
            🪝 <Link href="https://docs.cow.fi/cow-protocol/reference/sdks/cow-sdk">Create your own hook</Link>
          </li>
        </styledEl.List>
      </styledEl.Wrapper>
      {open && <HookStoreModal onDismiss={() => setOpen(false)} isPreHook />}
    </>
  )
}
