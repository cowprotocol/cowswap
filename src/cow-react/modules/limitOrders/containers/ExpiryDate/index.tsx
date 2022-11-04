import * as styledEl from './styled'
import { Dropdown } from '@cow/common/pure/Dropdown'
import { limitOrdersDeadlines, maxCustomDeadline } from '@cow/modules/limitOrders/containers/ExpiryDate/deadlines'
import {
  limitOrdersSettingsAtom,
  updateLimitOrdersSettingsAtom,
} from '@cow/modules/limitOrders/state/limitOrdersSettingsAtom'
import { useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { useCallback, useMemo, useRef } from 'react'
import { ChevronDown } from 'react-feather'

function limitDateString(date: Date): string {
  const [first, second] = date.toISOString().split(':')

  return [first, second].join(':')
}

const customDateOptions: Intl.DateTimeFormatOptions = {
  year: '2-digit',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}

export function ExpiryDate() {
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateLimitOrdersSettingsAtom)
  const currentDeadlineNode = useRef<HTMLButtonElement>()

  const min = limitDateString(new Date())
  const max = limitDateString(new Date(Date.now() + maxCustomDeadline))

  const existingDeadline = useMemo(() => {
    return limitOrdersDeadlines.find((item) => item.value === settingsState.deadline)
  }, [settingsState.deadline])

  const customDeadlineTitle = useMemo(() => {
    return new Date(settingsState.deadline).toLocaleString(undefined, customDateOptions)
  }, [settingsState.deadline])

  const setDeadline = useCallback(
    (deadline: number) => {
      updateSettingsState({ deadline })
      currentDeadlineNode.current?.click() // Close dropdown
    },
    [updateSettingsState]
  )

  const onChange = useCallback(
    (event) => {
      const deadline = new Date(event.target.value).getTime()

      updateSettingsState({ deadline })
    },
    [updateSettingsState]
  )

  const list = (
    <styledEl.ListWrapper>
      {limitOrdersDeadlines.map(({ title, value }) => (
        <li key={value}>
          <styledEl.ListItem onClick={() => setDeadline(value)}>{title}</styledEl.ListItem>
        </li>
      ))}
      <styledEl.ListItem>
        Custom
        <styledEl.CustomInput type="datetime-local" onChange={onChange} min={min} max={max} />
      </styledEl.ListItem>
    </styledEl.ListWrapper>
  )

  return (
    <styledEl.Wrapper>
      <styledEl.Title>Expiry</styledEl.Title>
      <Dropdown content={list}>
        <styledEl.Current ref={currentDeadlineNode as any} isCustom={!existingDeadline}>
          <span>{existingDeadline ? existingDeadline.title : customDeadlineTitle}</span>
          <ChevronDown size="18" />
        </styledEl.Current>
      </Dropdown>
    </styledEl.Wrapper>
  )
}
