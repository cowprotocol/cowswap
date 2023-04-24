import { atomWithReset, useResetAtom } from 'jotai/utils'
import { ConfirmationModalProps } from '../pure/ConfirmationModal/ConfirmationModal'
import { useCallback, useEffect } from 'react'
import { ApplicationModal } from '@src/state/application/reducer'
import { useCloseModal, useOpenModal } from '@src/custom/state/application/hooks'
import { atom, useSetAtom } from 'jotai'
import { t } from '@lingui/macro'

type TriggerConfirmationParams = Pick<
  ConfirmationModalProps,
  'title' | 'description' | 'callToAction' | 'warning' | 'confirmWord'
>

interface ConfirmationModalContext {
  onDismiss: () => void
  title: string
  callToAction: string
  description?: string
  warning?: string
  confirmWord: string
  action: string
  onEnable: () => void
  triggerConfirmation: ({ title, description, callToAction, warning }: TriggerConfirmationParams) => Promise<void>
}

const DEFAULT_CONFIRMATION_MODAL_CONTEXT: ConfirmationModalContext = {
  onDismiss: () => {},
  onEnable: () => {},
  title: 'Confirm Action',
  callToAction: 'Confirm',
  confirmWord: t`confirm`,
  action: 'confirm',
  triggerConfirmation: async () => {},
}

export const confirmationModalContextAtom = atomWithReset<ConfirmationModalContext>(DEFAULT_CONFIRMATION_MODAL_CONTEXT)
export const updateConfirmationModalContextAtom = atom(
  null,
  (get, set, nextState: Partial<ConfirmationModalContext>) => {
    set(confirmationModalContextAtom, () => {
      const prevState = get(confirmationModalContextAtom)

      return { ...prevState, ...nextState }
    })
  }
)

export function useConfirmationRequest({
  onEnable: onEnableParam = () => {},
  onDismiss: onDismissParam = () => {},
}: Partial<Pick<ConfirmationModalContext, 'onEnable' | 'onDismiss'>>) {
  const openModal = useOpenModal(ApplicationModal.CONFIRMATION)
  const closeModal = useCloseModal(ApplicationModal.CONFIRMATION)
  const setContext = useSetAtom(updateConfirmationModalContextAtom)
  const resetContext = useResetAtom(confirmationModalContextAtom)
  const triggerConfirmation = useCallback(
    (params: TriggerConfirmationParams) => {
      setContext(params)
      openModal()
    },
    [setContext, openModal]
  )

  useEffect(() => {
    const onDismiss = () => {
      closeModal()
      onDismissParam()
      resetContext()
    }

    const onEnable = () => {
      closeModal()
      onEnableParam()
      resetContext()
    }

    setContext({
      onDismiss,
      onEnable,
    })
  }, [openModal, closeModal, onDismissParam, onEnableParam, resetContext, setContext])

  return triggerConfirmation
}
