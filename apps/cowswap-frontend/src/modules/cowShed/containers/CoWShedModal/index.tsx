import { ReactNode } from 'react'

import { useCowShedModal, useSetShedModal } from 'entities/cowShed/useCowShedModal'
import ReactDOM from 'react-dom'

import { CoWShedWidget } from '../CoWShedWidget'

export function CoWShedModal(): ReactNode {
  const cowShedModal = useCowShedModal()
  const setCowShedModal = useSetShedModal()

  const toggleModal = (): void => {
    setCowShedModal((state) => ({
      ...state,
      isOpen: !state.isOpen,
    }))
  }

  if (!cowShedModal.isOpen) return null

  return ReactDOM.createPortal(<CoWShedWidget onDismiss={toggleModal} modalMode />, document.body)
}
