import { useRef, useEffect } from 'react'

import Sortable from 'sortablejs'
import styled from 'styled-components/macro'

import { CowHookDetailsSerialized } from '../../types/hooks'
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
  account?: string
  hooks: CowHookDetailsSerialized[]
  isPreHook: boolean
  removeHook: (uuid: string, isPreHook: boolean) => void
  editHook: (uuid: string) => void
  moveHook: (fromIndex: number, toIndex: number) => void
}

export function AppliedHookList({ account, hooks, isPreHook, removeHook, editHook, moveHook }: AppliedHookListProps) {
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
      {hooks.map((hookDetails, index) => (
        <AppliedHookItem
          key={hookDetails.uuid}
          index={index}
          hookDetails={hookDetails}
          account={account}
          isPreHook={isPreHook}
          removeHook={removeHook}
          editHook={editHook}
        />
      ))}
    </HookList>
  )
}
