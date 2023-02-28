import { Menu } from '@reach/menu-button'
import { LimitOrderDeadline, limitOrdersDeadlines, maxCustomDeadline } from './deadlines'

import { ChangeEventHandler, useCallback, useMemo, useRef } from 'react'
import { ChevronDown } from 'react-feather'
import * as styledEl from './styled'
import { Trans } from '@lingui/macro'
import ms from 'ms.macro'
import { DEFAULT_DATE_FORMAT } from '@cow/constants/intl'

function limitDateString(date: Date): string {
  const [first, second] = date.toISOString().split(':')

  return [first, second].join(':')
}

export interface DeadlineSelectorProps {
  deadline: LimitOrderDeadline | undefined
  customDeadline: number | null
  selectDeadline(deadline: LimitOrderDeadline): void
  selectCustomDeadline(deadline: number): void
}

export function DeadlineSelector(props: DeadlineSelectorProps) {
  const { deadline, customDeadline, selectDeadline, selectCustomDeadline } = props
  const currentDeadlineNode = useRef<HTMLButtonElement>()

  const min = limitDateString(new Date(Date.now() + ms`30min`))
  const max = limitDateString(new Date(Date.now() + maxCustomDeadline))

  const existingDeadline = useMemo(() => {
    return limitOrdersDeadlines.find((item) => item === deadline)
  }, [deadline])

  const customDeadlineTitle = useMemo(() => {
    if (!customDeadline) return ''
    return new Date(customDeadline * 1000).toLocaleString(undefined, DEFAULT_DATE_FORMAT)
  }, [customDeadline])

  const setDeadline = useCallback(
    (deadline: LimitOrderDeadline) => {
      selectDeadline(deadline)
      currentDeadlineNode.current?.click() // Close dropdown
    },
    [selectDeadline]
  )

  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const customDeadline = Math.round(new Date(event.target.value).getTime() / 1000)

      selectCustomDeadline(customDeadline)
    },
    [selectCustomDeadline]
  )

  return (
    <styledEl.Wrapper>
      <styledEl.Label>
        <Trans>Order expires</Trans>
      </styledEl.Label>
      <Menu>
        <styledEl.Current ref={currentDeadlineNode as any}>
          <span>{customDeadline ? customDeadlineTitle : existingDeadline?.title}</span>
          <ChevronDown size="18" />
        </styledEl.Current>
        <styledEl.ListWrapper>
          {limitOrdersDeadlines.map((item) => (
            <li key={item.value}>
              <styledEl.ListItem onSelect={() => setDeadline(item)}>
                <Trans>{item.title}</Trans>
              </styledEl.ListItem>
            </li>
          ))}
          <styledEl.ListItem onSelect={() => void 0}>
            <Trans>Custom</Trans>
            <styledEl.CustomInput type="datetime-local" onChange={onChange} min={min} max={max} />
          </styledEl.ListItem>
        </styledEl.ListWrapper>
      </Menu>
    </styledEl.Wrapper>
  )
}
