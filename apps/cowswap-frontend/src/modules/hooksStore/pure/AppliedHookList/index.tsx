import { useRef, useEffect } from 'react'

import { CowHookDetails } from '@cowprotocol/hook-dapp-lib'

import Sortable from 'sortablejs'
import styled from 'styled-components/macro'

import { HookDapp } from '../../types/hooks'
import { findHookDappById } from '../../utils'
import { AppliedHookItem } from '../AppliedHookItem'

const HookList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-flow: column wrap;
  gap: 10px;
`

interface AppliedHookListProps {
  account: string | undefined
  dapps: HookDapp[]
  hooks: CowHookDetails[]
  isPreHook: boolean
  removeHook: (uuid: string, isPreHook: boolean) => void
  editHook: (uuid: string) => void
  moveHook: (fromIndex: number, toIndex: number) => void
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function AppliedHookList({
  account,
  dapps,
  hooks,
  isPreHook,
  removeHook,
  editHook,
  moveHook,
}: AppliedHookListProps) {
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    let sortable: Sortable | undefined

    if (listRef.current) {
      sortable = Sortable.create(listRef.current, {
        animation: 250,
        sort: true,
        ghostClass: 'blue-background-class',
        easing: 'ease-in-out',
        handle: '.DragArea',
        dataIdAttr: 'data-uid',
        onEnd: function (evt) {
          if (evt.oldIndex != null && evt.newIndex != null && evt.oldIndex !== evt.newIndex) {
            moveHook(evt.oldIndex, evt.newIndex)
          }
        },
      })
    }

    return () => {
      if (sortable) {
        sortable.destroy()
      }
    }
  }, [moveHook])

  return (
    <HookList ref={listRef}>
      {hooks.map((hookDetails, index) => {
        return (
          <AppliedHookItem
            key={hookDetails.uuid}
            dapp={findHookDappById(dapps, hookDetails)}
            index={index}
            account={account}
            hookDetails={hookDetails}
            isPreHook={isPreHook}
            removeHook={removeHook}
            editHook={editHook}
          />
        )
      })}
    </HookList>
  )
}
