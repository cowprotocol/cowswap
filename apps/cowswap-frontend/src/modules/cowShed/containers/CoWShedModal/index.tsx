import { useAtom } from 'jotai/index'
import { ReactNode } from 'react'

import ReactDOM from 'react-dom'

import { cowShedModalAtom } from '../../state/cowShedModalAtom'
import { CoWShedWidget } from '../CoWShedWidget'

export function CoWShedModal(): ReactNode {
  const [cowShedModal, setCowShedModal] = useAtom(cowShedModalAtom)

  const toggleModal = (): void => {
    setCowShedModal((state) => ({
      ...state,
      isOpen: !state.isOpen,
    }))
  }

  if (!cowShedModal.isOpen) return null

  return ReactDOM.createPortal(<CoWShedWidget onDismiss={toggleModal} modalMode />, document.body)
}
