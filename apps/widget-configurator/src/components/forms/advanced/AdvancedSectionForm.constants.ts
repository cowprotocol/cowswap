import { CONFIGURATOR_DEFAULT_WIDGET_BASE_URL } from '../../../utils/base-url/baseUrl'
import { PresetOption } from '../../ui/inputs/PresetsButtons/PresetsButtons.component'

export const ADVANCED_BASE_URL_PRESETS_OPTIONS: PresetOption[] = [
  { label: 'Local', value: 'http://localhost:3000' },
  { label: 'Dev', value: 'https://dev.swap.cow.fi' },
  { label: 'Production', value: 'https://swap.cow.fi' },
].map((presetOption) => {
  return {
    ...presetOption,
    label:
      presetOption.value === CONFIGURATOR_DEFAULT_WIDGET_BASE_URL
        ? `${presetOption.label} (default)`
        : presetOption.label,
  }
})

export const ADVANCED_DEFAULT_BASE_URL = CONFIGURATOR_DEFAULT_WIDGET_BASE_URL
