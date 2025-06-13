import { atom, useSetAtom } from 'jotai'
import { atomWithReset, useResetAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { Command } from '@cowprotocol/types'

import { t } from '@lingui/macro'

import { useCloseModal, useOpenModal } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

import { ConfirmationModalProps } from '../pure/ConfirmationModal/ConfirmationModal'

type TriggerConfirmationParams = Pick<
  ConfirmationModalProps,
  'title' | 'description' | 'callToAction' | 'warning' | 'confirmWord' | 'action' | 'skipInput'
>
interface ConfirmationModalContext {
  onDismiss: Command
  activePromise?: Promise<boolean>
  title: string
  callToAction: string
  description?: string
  warning?: string
  confirmWord: string
  action: string
  onEnable: Command
  skipInput?: boolean
  triggerConfirmation: ({
    title,
    description,
    callToAction,
    warning,
    skipInput,
  }: TriggerConfirmationParams) => Promise<void>
}

const DEFAULT_CONFIRMATION_MODAL_CONTEXT: ConfirmationModalContext = {
  onDismiss: () => {},
  onEnable: () => {},
  title: 'Confirm Action',
  callToAction: 'Confirm',
  confirmWord: t`confirm`,
  action: 'confirm',
  skipInput: false,
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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useConfirmationRequest({
  onEnable: onEnableParam,
  onDismiss: onDismissParam,
}: Partial<Pick<ConfirmationModalContext, 'onEnable' | 'onDismiss'>>) {
  const openModal = useOpenModal(ApplicationModal.CONFIRMATION)
  const closeModal = useCloseModal(ApplicationModal.CONFIRMATION)
  const setContext = useSetAtom(updateConfirmationModalContextAtom)
  const resetContext = useResetAtom(confirmationModalContextAtom)

  return useCallback(
    (params: TriggerConfirmationParams): Promise<boolean> => {
      return new Promise((resolve) => {
        // TODO: Add proper return type annotation
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        const onDismiss = () => {
          closeModal()
          onDismissParam?.()
          resetContext()
          resolve(false)
        }

        // TODO: Add proper return type annotation
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        const onEnable = () => {
          closeModal()
          onEnableParam?.()
          resetContext()
          resolve(true)
        }

        setContext({
          ...params,
          onDismiss,
          onEnable,
        })
        openModal()
      })
    },
    [setContext, openModal, closeModal, onDismissParam, resetContext, onEnableParam]
  )
}
