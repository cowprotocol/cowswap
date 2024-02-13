import { PropsWithChildren } from 'react'

import { NewModal, NewModalProps } from '../NewModal'

type Props = PropsWithChildren & {
  onDismiss: NewModalProps['onDismiss']
}

export function RecreateOrderModal(props: Props) {
  const { onDismiss, children } = props

  return (
    <NewModal title={'Recreate Order'} modalMode onDismiss={onDismiss}>
      {/* TODO: Use tradewidget or something, don't recreate the form */}
      {children}
    </NewModal>
  )
}
