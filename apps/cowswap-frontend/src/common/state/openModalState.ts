import { atom } from 'jotai'

interface ModalState {
  id: string
  isOpen: boolean
  zIndex: number
}

const BASE_Z_INDEX = 1000

export const modalStackAtom = atom<ModalState[]>([])

export const openModalAtom = atom(
  (get) => get(modalStackAtom),
  (get, set, id: string) => {
    const currentStack = get(modalStackAtom)
    const existingModalIndex = currentStack.findIndex((modal) => modal.id === id)

    if (existingModalIndex !== -1) {
      // If the modal is already in the stack, move it to the top
      const updatedStack = [
        ...currentStack.slice(0, existingModalIndex),
        ...currentStack.slice(existingModalIndex + 1),
        { ...currentStack[existingModalIndex], isOpen: true, zIndex: BASE_Z_INDEX + currentStack.length },
      ]
      set(modalStackAtom, updatedStack)
    } else {
      // If it's a new modal, add it to the top of the stack
      set(modalStackAtom, [...currentStack, { id, isOpen: true, zIndex: BASE_Z_INDEX + currentStack.length }])
    }
  }
)

export const closeModalAtom = atom(null, (get, set, id: string) => {
  const currentStack = get(modalStackAtom)
  const updatedStack = currentStack.reduce<ModalState[]>((acc, modal) => {
    if (modal.id !== id && modal.isOpen) {
      return [...acc, modal] // Keep only open modals that are not being closed
    }
    return acc // Filter out closed modals and the one being closed
  }, [])
  set(modalStackAtom, updatedStack)
})

export const getModalStateAtom = atom((get) => (id: string) => {
  const stack = get(modalStackAtom)
  return stack.find((modal) => modal.id === id) || { id, isOpen: false, zIndex: BASE_Z_INDEX }
})
