import { Menu } from '@reach/menu-button'
import { ordersDeadlines } from './deadlines'
import { useCallback, useRef, useState } from 'react'
import { ChevronDown } from 'react-feather'
import { Trans } from '@lingui/macro'
import { useDisplayDeadline } from './hooks/useDisplayDeadline'
import { CustomDeadline } from './types'
import QuestionHelper from 'components/QuestionHelper'
import * as styledEl from './styled'
import { CustomDeadlineSelector } from '../CustomDeadlineSelector'
import { useDeadline } from '../DeadlineSelector/hooks/useDeadline'
import { useUpdateDeadline } from './hooks/useUpdateDeadline'

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
      <styledEl.Label>
        <styledEl.LabelWrapper>
          <span>Total time</span>
          <QuestionHelper text={<Trans>This is some text here</Trans>} />
        </styledEl.LabelWrapper>
      </styledEl.Label>

      <Menu>
        <styledEl.Current ref={currentDeadlineNode as any} $custom={!!customDeadline}>
          <span>{displayDeadline}</span>
          <ChevronDown size="18" />
        </styledEl.Current>

        <styledEl.ListWrapper>
          {ordersDeadlines.map((item) => (
            <li key={item.value}>
              <styledEl.ListItem onSelect={() => selectDeadline(item.value)}>
                <Trans>{item.title}</Trans>
              </styledEl.ListItem>
            </li>
          ))}
          <styledEl.ListItem onSelect={openModal}>
            <Trans>Custom</Trans>
          </styledEl.ListItem>
        </styledEl.ListWrapper>
      </Menu>

      <CustomDeadlineSelector
        selectCustomDeadline={selectCustomDeadline}
        customDeadline={customDeadline}
        onDismiss={onDismiss}
        isOpen={isOpen}
      />
    </styledEl.Wrapper>
  )
}
