import { ReactNode } from 'react'

import { Header } from './Header'

import { useCloseTokenSelectWidget } from '../../../../hooks/useCloseTokenSelectWidget'
import { useDismissHandler, useHeaderState, useManageWidgetVisibility } from '../../hooks'

export function ConnectedHeader(): ReactNode {
  const { closeManageWidget } = useManageWidgetVisibility()
  const closeTokenSelectWidget = useCloseTokenSelectWidget()
  const onDismiss = useDismissHandler(closeManageWidget, closeTokenSelectWidget)
  const { title, showManageButton, onOpenManageWidget } = useHeaderState()

  return (
    <Header
      title={title}
      showManageButton={showManageButton}
      onDismiss={onDismiss}
      onOpenManageWidget={onOpenManageWidget}
    />
  )
}
