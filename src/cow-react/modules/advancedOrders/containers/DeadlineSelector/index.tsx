import { useCallback, useRef, useState } from 'react'

import { useDisplayDeadline } from './hooks/useDisplayDeadline'
import { CustomDeadline } from './types'
import { CustomDeadlineSelector } from '../CustomDeadlineSelector'
import { useDeadline } from '../DeadlineSelector/hooks/useDeadline'
import { useUpdateDeadline } from './hooks/useUpdateDeadline'
import { DeadlineDisplayPart } from '../DeadlineDisplayPart'
import { Selector } from './pure/Selector'
import * as styledEl from './styled'

export function DeadlineSelector() {
  const { customDeadline } = useDeadline()

  // Modal related code
  const [isOpen, setIsOpen] = useState(false)

  const openModal = useCallback(() => setIsOpen(true), [])
  const onDismiss = useCallback(() => setIsOpen(false), [])

  const currentDeadlineNode = useRef<HTMLButtonElement>()
  const displayDeadline = useDisplayDeadline()
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
    <styledEl.Wrapper>
      <Selector
        currentDeadlineNode={currentDeadlineNode}
        selectDeadline={selectDeadline}
        openModal={openModal}
        customDeadline={customDeadline}
        displayDeadline={displayDeadline}
      />

      <DeadlineDisplayPart />

      <CustomDeadlineSelector
        selectCustomDeadline={selectCustomDeadline}
        customDeadline={customDeadline}
        onDismiss={onDismiss}
        isOpen={isOpen}
      />
    </styledEl.Wrapper>
  )
}
