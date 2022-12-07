import { Dropdown } from '@cow/common/pure/Dropdown'
import { LimitOrderDeadline, limitOrdersDeadlines } from './deadlines'

import { useCallback, useMemo, useRef } from 'react'
import { ChevronDown } from 'react-feather'
import * as styledEl from './styled'
import { Trans } from '@lingui/macro'

// function limitDateString(date: Date): string {
//   const [first, second] = date.toISOString().split(':')

//   return [first, second].join(':')
// }

const customDateOptions: Intl.DateTimeFormatOptions = {
  year: '2-digit',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}

export interface DeadlineSelectorProps {
  deadline: LimitOrderDeadline | undefined
  customDeadline: number | null
  selectDeadline(deadline: LimitOrderDeadline): void
  selectCustomDeadline(deadline: number): void
}

export function DeadlineSelector(props: DeadlineSelectorProps) {
  const { deadline, customDeadline, selectDeadline } = props
  const currentDeadlineNode = useRef<HTMLButtonElement>()

  // const min = limitDateString(new Date(Date.now() + ms`30min`))
  // const max = limitDateString(new Date(Date.now() + maxCustomDeadline))

  const existingDeadline = useMemo(() => {
    return limitOrdersDeadlines.find((item) => item === deadline)
  }, [deadline])

  const customDeadlineTitle = useMemo(() => {
    if (!customDeadline) return ''
    return new Date(customDeadline * 1000).toLocaleString(undefined, customDateOptions)
  }, [customDeadline])

  const setDeadline = useCallback(
    (deadline: LimitOrderDeadline) => {
      selectDeadline(deadline)
      currentDeadlineNode.current?.click() // Close dropdown
    },
    [selectDeadline]
  )

  // const onChange = useCallback(
  //   (event) => {
  //     const customDeadline = Math.round(new Date(event.target.value).getTime() / 1000)
  //
  //     selectCustomDeadline(customDeadline)
  //   },
  //   [selectCustomDeadline]
  // )

  const list = (
    <styledEl.ListWrapper>
      {limitOrdersDeadlines.map((item) => (
        <li key={item.value}>
          <styledEl.ListItem onClick={() => setDeadline(item)}>
            <Trans>{item.title}</Trans>
          </styledEl.ListItem>
        </li>
      ))}
      {/* <styledEl.ListItem>
        <Trans>Custom</Trans>
        <styledEl.CustomInput type="datetime-local" onChange={onChange} min={min} max={max} />
      </styledEl.ListItem> */}
    </styledEl.ListWrapper>
  )

  return (
    <styledEl.Wrapper>
      <styledEl.Header>
        <Trans>Expiry</Trans>
      </styledEl.Header>
      <Dropdown content={list}>
        <styledEl.Current ref={currentDeadlineNode as any} isCustom={!!customDeadline}>
          <span>{customDeadline ? customDeadlineTitle : existingDeadline?.title}</span>
          <ChevronDown size="18" />
        </styledEl.Current>
      </Dropdown>
    </styledEl.Wrapper>
  )
}
