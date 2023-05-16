import { TradeSelect, TradeSelectItem } from '@cow/modules/trade/pure/TradeSelect'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import Modal from '@cow/common/pure/Modal'

interface DeadlineSelectorProps {
  items: TradeSelectItem[]
  deadline: number
  setDeadline(value: number): void
}

const CUSTOM_OPTION: TradeSelectItem = { label: 'Custom', value: 'CUSTOM_ITEM_VALUE' }

export function DeadlineSelector(props: DeadlineSelectorProps) {
  const { items, deadline, setDeadline } = props
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const customInput = useRef<HTMLInputElement>(null)

  const itemsWithCustom = useMemo(() => {
    return [...items, CUSTOM_OPTION]
  }, [items])

  const onSelect = useCallback((item: TradeSelectItem) => {
    if (item === CUSTOM_OPTION) {
      setIsCustomModalOpen(true)
    } else {
      setDeadline(item.value as number)
    }
  }, [])

  const submitCustom = useCallback(() => {
    setDeadline(parseInt(customInput.current?.value || '0'))
    setIsCustomModalOpen(false)
  }, [])

  const active = useMemo(() => {
    const itemFromList = items.find((item) => item.value === deadline)

    if (!itemFromList) {
      return { label: new Date(deadline).toLocaleString(), value: deadline }
    }

    return itemFromList
  }, [deadline])

  return (
    <>
      <TradeSelect label="Total time" hint="Some hint" items={itemsWithCustom} active={active} onSelect={onSelect} />
      <Modal isOpen={isCustomModalOpen} onDismiss={() => setIsCustomModalOpen(false)}>
        <h3>Set custom:</h3>
        <input ref={customInput} type="number" />
        <button onClick={submitCustom}>Submit</button>
      </Modal>
    </>
  )
}
