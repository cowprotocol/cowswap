import { Menu } from '@reach/menu-button'
import { OrderDeadline, ordersDeadlines } from './deadlines'
import { useCallback, useState } from 'react'
import { ChevronDown } from 'react-feather'
import { Trans } from '@lingui/macro'
import { useDisplayDeadline } from './hooks/useDisplayDeadline'
import { CustomDeadline } from './types'
import QuestionHelper from 'components/QuestionHelper'
import * as styledEl from './styled'
import { CustomDeadlineSelector } from '../CustomDeadlineSelector'

export interface DeadlineSelectorProps {
  deadline: number
  parsedDeadline?: OrderDeadline
  isCustomDeadline: boolean
  customDeadline: CustomDeadline
  selectDeadline(deadline: number): void
  selectCustomDeadline(deadline: CustomDeadline): void
  currentDeadlineNode: React.MutableRefObject<HTMLButtonElement | undefined>
}

export function DeadlineSelector(props: DeadlineSelectorProps) {
  const { customDeadline, selectDeadline, selectCustomDeadline, currentDeadlineNode } = props
  const displayDeadline = useDisplayDeadline()

  const onSelect = useCallback(
    (deadline: OrderDeadline) => {
      selectDeadline(deadline.value)
    },
    [selectDeadline]
  )

  // Modal related code
  const [isOpen, setIsOpen] = useState(false)

  const openModal = useCallback(() => setIsOpen(true), [])
  const onDismiss = useCallback(() => setIsOpen(false), [])

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
              <styledEl.ListItem onSelect={() => onSelect(item)}>
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
        isOpen={isOpen}
        onDismiss={onDismiss}
      />
    </styledEl.Wrapper>
  )
}
