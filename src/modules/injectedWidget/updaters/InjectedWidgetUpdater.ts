import { useUpdateWidgetAppParams } from '../hooks/useUpdateWidgetAppParams'
import { useUpdateWidgetUrl } from '../hooks/useUpdateWidgetUrl'

export function InjectedWidgetUpdater() {
  useUpdateWidgetUrl()
  useUpdateWidgetAppParams()

  return null
}
