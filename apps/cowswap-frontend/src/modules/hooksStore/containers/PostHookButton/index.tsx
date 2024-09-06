import { useAtomValue } from 'jotai/index'

import PLUS_ICON from '@cowprotocol/assets/cow-swap/plus.svg'
import { useWalletInfo } from '@cowprotocol/wallet'

import SVG from 'react-inlinesvg'

import { useRemoveHook } from '../../hooks/useRemoveHook'
import { AppliedHookItem } from '../../pure/AppliedHookItem'
import { HookTooltip } from '../../pure/HookTooltip'
import { hooksAtom } from '../../state/hookDetailsAtom'
import * as styledEl from '../PreHookButton/styled'

export interface PostHookButtonProps {
  onOpen(): void
  onEditHook(uuid: string): void
}

export function PostHookButton({ onOpen, onEditHook }: PostHookButtonProps) {
  const { account } = useWalletInfo()
  const { postHooks } = useAtomValue(hooksAtom)
  const removeHook = useRemoveHook()

  return (
    <>
      {postHooks && (
        <styledEl.HookList>
          {postHooks.map((hook, index) => (
            <AppliedHookItem
              key={index}
              account={account}
              hookDetails={hook}
              removeHook={removeHook}
              editHook={onEditHook}
              isPreHook={false}
            />
          ))}
        </styledEl.HookList>
      )}
      <styledEl.Wrapper>
        <styledEl.AddHookButton onClick={onOpen}>
          <SVG src={PLUS_ICON} /> Add Post-Hook Action <HookTooltip isPreHook={false} />
        </styledEl.AddHookButton>{' '}
      </styledEl.Wrapper>
    </>
  )
}
