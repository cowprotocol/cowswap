import { useEffect, useState } from 'react'
import { Dropdown } from '@cow/common/pure/Dropdown'
import { LimitOrderDeadline, limitOrdersDeadlines, MAX_CUSTOM_DEADLINE, MIN_CUSTOM_DEADLINE } from './deadlines'
import { GpModal as Modal } from '@src/custom/components/Modal'

import { useCallback, useMemo, useRef } from 'react'
import { ChevronDown } from 'react-feather'
import {
  ListWrapper,
  ListItem,
  Wrapper,
  Header,
  Current,
  ModalWrapper,
  ModalHeader,
  ModalFooter,
  ModalContent,
  CloseIcon,
  CustomInput,
  CustomLabel,
} from './styled'
import { Trans } from '@lingui/macro'
import { ButtonPrimary, ButtonSecondary } from '@src/components/Button'

function limitDateString(date: Date): string {
  const [first, second] = date.toISOString().split(':')

  return [first, second].join(':')
}

const CUSTOM_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
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
  const { deadline, customDeadline, selectDeadline, selectCustomDeadline } = props

  const currentDeadlineNode = useRef<HTMLButtonElement | null>(null)

  // Min and Max dates are fixed for as long as the component is mounted
  const [minDate, maxDate] = useMemo(() => {
    const now = Date.now()

    return [new Date(now + MIN_CUSTOM_DEADLINE), new Date(now + MAX_CUSTOM_DEADLINE)]
  }, [])

  const min = limitDateString(minDate)
  const max = limitDateString(maxDate)

  const [error, setError] = useState<string | null>(null)
  const [value, setValue] = useState<string>(customDeadline ? limitDateString(new Date(customDeadline * 1000)) : min)

  // Validate `value` from datetime-local input and store it if valid
  useEffect(() => {
    try {
      const newDeadline = new Date(value).getTime()

      if (newDeadline < minDate.getTime()) {
        setError(`Must be after ${minDate.toLocaleDateString()} ${minDate.toLocaleTimeString()}`)
      } else if (newDeadline > maxDate.getTime()) {
        setError(`Must be before ${maxDate.toLocaleDateString()} ${maxDate.toLocaleTimeString()}`)
      } else {
        // Only update deadline if it's within a valid range
        setError(null)
        selectCustomDeadline(Math.round(newDeadline / 1000))
      }
    } catch (e) {
      console.error(`[DeadlineSelector] Failed to parse input value to Date`, value, e)
      setError(`Failed to parse date and time provided`)
    }
  }, [maxDate, minDate, selectCustomDeadline, value])

  const existingDeadline = useMemo(() => limitOrdersDeadlines.find((item) => item === deadline), [deadline])

  const customDeadlineTitle = useMemo(() => {
    if (!customDeadline) {
      return ''
    }
    return new Date(customDeadline * 1000).toLocaleString(undefined, CUSTOM_DATE_OPTIONS)
  }, [customDeadline])

  const setDeadline = useCallback(
    (deadline: LimitOrderDeadline) => {
      selectDeadline(deadline)
      currentDeadlineNode.current?.click() // Close dropdown
    },
    [selectDeadline]
  )

  // Sets value from input, if it exists
  const onChange = useCallback(({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
    value && setValue(value)
  }, [])

  const [isOpen, setIsOpen] = useState(false)
  const openModal = () => {
    currentDeadlineNode.current?.click() // Close dropdown
    setIsOpen(true)
  }
  const onDismiss = () => setIsOpen(false)

  const list = (
    <ListWrapper>
      {limitOrdersDeadlines.map((item) => (
        <li key={item.value}>
          <ListItem onClick={() => setDeadline(item)}>
            <Trans>{item.title}</Trans>
          </ListItem>
        </li>
      ))}
      <ListItem onClick={openModal}>
        <Trans>Custom</Trans>
      </ListItem>
    </ListWrapper>
  )

  return (
    <Wrapper>
      <Header>
        <Trans>Expiry</Trans>
      </Header>
      <Dropdown content={list}>
        <Current ref={currentDeadlineNode} isCustom={!!customDeadline}>
          <span>{customDeadline ? customDeadlineTitle : existingDeadline?.title}</span>
          <ChevronDown size="18" />
        </Current>
      </Dropdown>

      {/* Custom deadline modal */}
      <Modal isOpen={isOpen} onDismiss={onDismiss}>
        <ModalWrapper>
          <ModalHeader>
            <h3>
              <Trans>Set custom deadline</Trans>
            </h3>
            <CloseIcon onClick={onDismiss} />
          </ModalHeader>
          <ModalContent>
            <CustomLabel htmlFor="custom-deadline">
              <Trans>Choose a custom deadline for your limit order:</Trans>
              <CustomInput
                type="datetime-local"
                id="custom-deadline"
                onChange={onChange}
                min={min}
                max={max}
                value={value}
                pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
              />
            </CustomLabel>
            {/* TODO: style me!!! */}
            {error && <div>{error}</div>}
          </ModalContent>
          <ModalFooter>
            <ButtonSecondary onClick={onDismiss}>Cancel</ButtonSecondary>
            <ButtonPrimary onClick={onDismiss} disabled={!!error}>
              <Trans>Set custom date</Trans>
            </ButtonPrimary>
          </ModalFooter>
        </ModalWrapper>
      </Modal>
    </Wrapper>
  )
}
