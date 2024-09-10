import { useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai/index'
import { useCallback } from 'react'

import PLUS_ICON from '@cowprotocol/assets/cow-swap/plus.svg'
import { useWalletInfo } from '@cowprotocol/wallet'

import SVG from 'react-inlinesvg'

import { useHooks } from '../../hooks/useHooks'
import { useRemoveHook } from '../../hooks/useRemoveHook'
import { AppliedHookItem } from '../../pure/AppliedHookItem'
import { HookTooltip } from '../../pure/HookTooltip'
import * as styledEl from '../PreHookButton/styled'

export interface PostHookButtonProps {
  onOpen(): void
  onEditHook(uuid: string): void
}

export function PostHookButton({ onOpen, onEditHook }: PostHookButtonProps) {
  const { account } = useWalletInfo()
  const { postHooks } = useHooks()
  const removeHook = useRemoveHook()

  const setHooks = useSetAtom(hooksAtom)

  const moveHook = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const newPostHooks = [...postHooks]
      const [removed] = newPostHooks.splice(dragIndex, 1)
      newPostHooks.splice(hoverIndex, 0, removed)
      setHooks((prevState: { preHooks: any[]; postHooks: any[] }) => ({ ...prevState, postHooks: newPostHooks }))
    },
    [postHooks, setHooks]
  )

  return (
    <>
      {postHooks && (
        <styledEl.HookList>
          {postHooks.map((hook, index) => (
            <AppliedHookItem
              key={hook.uuid}
              account={account}
              hookDetails={hook}
              removeHook={removeHook}
              editHook={onEditHook}
              isPreHook={false}
              index={index}
              moveHook={moveHook}
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
