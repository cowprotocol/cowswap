import { Settings } from '../../pure/Settings'
import { useAtom } from 'jotai'
import { limitOrdersSettingsAtom } from '../../state/limitOrdersSettingsAtom'

export function SettingsWidget() {
  const [state, setState] = useAtom(limitOrdersSettingsAtom)

  return <Settings state={state} onStateChanged={setState} />
}
