import { ReactNode, useCallback, useMemo, useRef, useState } from 'react'

import { i18n } from '@lingui/core'

import { useExtractText } from '@cowprotocol/common-utils'

import { Trans } from '@lingui/react/macro'
import { Menu } from '@reach/menu-button'
import { ChevronDown } from 'react-feather'

import { getLimitOrderDeadlines, LimitOrderDeadline } from './deadlines'
import * as styledEl from './styled'

import { CustomDeadlineDialog } from '../CustomDeadlineDialog/CustomDeadlineDialog.pure'

const CUSTOM_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: '2-digit',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}

export interface DeadlineSelectorProps {
  deadline?: LimitOrderDeadline
  customDeadline: number | null
  isDeadlineDisabled: boolean

  selectDeadline(deadline: LimitOrderDeadline): void

  selectCustomDeadline(deadline: number | null): void
}

export function DeadlineSelector(props: DeadlineSelectorProps): ReactNode {
  const { deadline, customDeadline, isDeadlineDisabled, selectDeadline, selectCustomDeadline } = props
  const { extractTextFromStringOrI18nDescriptor } = useExtractText()
  const currentDeadlineNode = useRef<HTMLButtonElement | null>(null)

  const limitOrderDeadlines = useMemo(() => getLimitOrderDeadlines(deadline), [deadline])

  const customDeadlineTitle = useMemo(() => {
    if (!customDeadline) {
      return ''
    }
    return new Date(customDeadline * 1000).toLocaleString(i18n.locale, CUSTOM_DATE_OPTIONS)
  }, [customDeadline])

  const setDeadline = useCallback(
    (deadline: LimitOrderDeadline) => {
      selectDeadline(deadline)
      selectCustomDeadline(null) // reset custom deadline
      currentDeadlineNode.current?.click() // Close dropdown
    },
    [selectCustomDeadline, selectDeadline],
  )

  const [isOpen, setIsOpen] = useState(false)

  const openModal = useCallback(() => {
    currentDeadlineNode.current?.click() // Close dropdown
    setIsOpen(true)
  }, [])

  const onDismiss = useCallback(() => setIsOpen(false), [])

  const deadlineDisplay = customDeadline
    ? customDeadlineTitle
    : deadline
      ? extractTextFromStringOrI18nDescriptor(deadline.title)
      : ''

  return (
    <styledEl.Wrapper>
      <styledEl.Label>
        <Trans>Order expires in</Trans>
      </styledEl.Label>

      {isDeadlineDisabled ? (
        <div>
          <span>{deadlineDisplay}</span>
        </div>
      ) : (
        <Menu>
          {/* TODO: Replace any with proper type definitions */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <styledEl.Current ref={currentDeadlineNode as any} $custom={!!customDeadline}>
            <span>{deadlineDisplay}</span>
            <ChevronDown size="18" />
          </styledEl.Current>
          <styledEl.ListWrapper>
            {limitOrderDeadlines.map((item) => (
              <li key={item.value}>
                <styledEl.ListItem onSelect={() => setDeadline(item)}>
                  {extractTextFromStringOrI18nDescriptor(item.title)}
                </styledEl.ListItem>
              </li>
            ))}
            <styledEl.ListItem onSelect={openModal}>
              <Trans>Custom</Trans>
            </styledEl.ListItem>
          </styledEl.ListWrapper>
        </Menu>
      )}

      <CustomDeadlineDialog
        isOpen={isOpen}
        customDeadline={customDeadline}
        onDismiss={onDismiss}
        selectCustomDeadline={selectCustomDeadline}
      />
    </styledEl.Wrapper>
  )
}
