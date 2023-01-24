import { useState } from 'react'
import { Dropdown } from '@cow/common/pure/Dropdown'
import { LimitOrderDeadline, limitOrdersDeadlines, maxCustomDeadline } from './deadlines'
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
import ms from 'ms.macro'
import { ButtonPrimary, ButtonSecondary } from '@src/components/Button'

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
    return new Date(customDeadline * 1000).toLocaleString(undefined, customDateOptions)
  }, [customDeadline])

  const setDeadline = useCallback(
    (deadline: LimitOrderDeadline) => {
      selectDeadline(deadline)
      currentDeadlineNode.current?.click() // Close dropdown
    },
    [selectDeadline]
  )

  const onChange = useCallback(
    (event) => {
      const customDeadline = Math.round(new Date(event.target.value).getTime() / 1000)

      selectCustomDeadline(customDeadline)
    },
    [selectCustomDeadline]
  )

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
        <Current ref={currentDeadlineNode as any} isCustom={!!customDeadline}>
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
            <CustomLabel htmlFor="meeting-time">
              <Trans>Choose a custom deadline for your limit order:</Trans>
              <CustomInput
                type="datetime-local"
                onChange={onChange}
                min={min}
                max={max}
                value={customDeadline || min}
              />
            </CustomLabel>
          </ModalContent>
          <ModalFooter>
            <ButtonSecondary onClick={onDismiss}>Cancel</ButtonSecondary>
            <ButtonPrimary onClick={onDismiss}>
              <Trans>Set custom date</Trans>
            </ButtonPrimary>
          </ModalFooter>
        </ModalWrapper>
      </Modal>
    </Wrapper>
  )
}

// write bash cron job to run this script every day at 00:00
