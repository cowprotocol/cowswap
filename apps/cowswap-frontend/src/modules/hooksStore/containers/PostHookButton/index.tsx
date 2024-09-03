import { useAtomValue } from 'jotai/index'

import { ButtonSecondaryAlt } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useRemoveHook } from '../../hooks/useRemoveHook'
import { HookItem } from '../../pure/HookItem'
import { HookTooltip } from '../../pure/HookTooltip'
import { hooksAtom } from '../../state/hookDetailsAtom'
import * as styledEl from '../PreHookButton/styled'

export interface PostHookButtonProps {
  onOpen(): void
}

export function PostHookButton({ onOpen }: PostHookButtonProps) {
  const { account } = useWalletInfo()
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
          <ButtonSecondaryAlt onClick={onOpen}>🪝 Add Post-hook</ButtonSecondaryAlt> <HookTooltip isPreHook={false} />
        </styledEl.ButtonGroup>
      </styledEl.Wrapper>
    </>
  )
}
