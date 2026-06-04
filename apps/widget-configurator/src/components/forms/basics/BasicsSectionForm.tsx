import type { ReactNode } from 'react'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { LOCALE_OPTIONS, WIDGET_MODE_OPTIONS } from '../../../configurator.constants'
import { COMMENTS_BY_PARAM_NAME } from '../../snippet/code-example-templates/common/codeExample.constants'
import { RadioGroupInput } from '../../ui/inputs/RadioGroupInput/RadioGroupInput.component'
import { SelectInput } from '../../ui/inputs/Select/single/SelectInput.component'
import { TextInput } from '../../ui/inputs/TextInput/TextInput.component'

import type { SidebarSectionFormProps } from '../forms.types'

const WIDGET_MODE_TOOLTIP = (
  <Stack divider={<Divider flexItem />} spacing={1.2}>
    <Typography sx={{ fontSize: '1.2rem', lineHeight: 1.45 }}>
      <Box component="span" sx={{ fontWeight: 600 }}>
        Dapp mode:
      </Box>{' '}
      the host app provides the wallet connection and network switching.
    </Typography>
    <Typography sx={{ fontSize: '1.2rem', lineHeight: 1.45 }}>
      <Box component="span" sx={{ fontWeight: 600 }}>
        Standalone mode:
      </Box>{' '}
      the widget uses its own wallet provider and shows its own connect wallet controls.
    </Typography>
  </Stack>
)

export function BasicsSectionForm({ values, onChange }: SidebarSectionFormProps): ReactNode {
  return (
    <>
      <TextInput
        name="appCode"
        label="App code"
        value={values.appCode}
        onChange={onChange}
        helperText={COMMENTS_BY_PARAM_NAME.appCode}
        inputProps={{ maxLength: 50 }}
      />

      <RadioGroupInput
        name="widgetMode"
        label="Mode"
        value={values.widgetMode}
        options={WIDGET_MODE_OPTIONS}
        onChange={onChange}
        tooltip={WIDGET_MODE_TOOLTIP}
        tooltipAriaLabel="Explain widget modes"
      />

      <SelectInput
        name="locale"
        label="Forced locale"
        value={values.locale}
        emptyLabel
        options={LOCALE_OPTIONS}
        onChange={onChange}
      />
    </>
  )
}
