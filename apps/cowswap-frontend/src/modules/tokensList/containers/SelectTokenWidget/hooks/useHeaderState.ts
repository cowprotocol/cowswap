import { useWidgetCallbacks } from '../context/WidgetCallbacksContext'
import { useWidgetConfig } from '../context/WidgetConfigContext'

interface HeaderState {
  title: string
  showManageButton: boolean
  onDismiss: () => void
  onOpenManageWidget: () => void
}

export function useHeaderState(): HeaderState {
  const { title, showManageButton } = useWidgetConfig()
  const { onDismiss, onOpenManageWidget } = useWidgetCallbacks()

  return { title, showManageButton, onDismiss, onOpenManageWidget }
}
