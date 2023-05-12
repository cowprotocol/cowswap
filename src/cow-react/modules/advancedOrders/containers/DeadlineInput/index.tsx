import { useCallback, useRef } from 'react'
import { DeadlineSelector } from '../DeadlineSelector'
import { useDeadline } from '../DeadlineSelector/hooks/useDeadline'
import { useUpdateDeadline } from '../DeadlineSelector/hooks/useUpdateDeadline'
import { CustomDeadline } from '../DeadlineSelector/types'

export function DeadlineInput() {
  const { isCustomDeadline, deadline, customDeadline } = useDeadline()

  const currentDeadlineNode = useRef<HTMLButtonElement>()

  const updateDeadline = useUpdateDeadline()

  const selectDeadline = useCallback(
    (deadline: number) => {
      updateDeadline({ isCustomDeadline: false, deadline })
      currentDeadlineNode.current?.click()
    },
    [updateDeadline]
  )

  const selectCustomDeadline = useCallback(
    (customDeadline: CustomDeadline) => {
      updateDeadline({ isCustomDeadline: true, customDeadline })
    },
    [updateDeadline]
  )

  return (
    <DeadlineSelector
      deadline={deadline}
      isCustomDeadline={isCustomDeadline}
      customDeadline={customDeadline}
      selectDeadline={selectDeadline}
      selectCustomDeadline={selectCustomDeadline}
      currentDeadlineNode={currentDeadlineNode}
    />
  )
}
