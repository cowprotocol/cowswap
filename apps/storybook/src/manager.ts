import { GLOBALS_UPDATED } from 'storybook/internal/core-events'
import { addons } from 'storybook/manager-api'
import { themes } from 'storybook/theming'

import type { GlobalsUpdatedPayload } from 'storybook/internal/types'

addons.setConfig({
  theme: themes.light,
})

addons.ready().then((channel) => {
  channel.on(GLOBALS_UPDATED, ({ globals }: GlobalsUpdatedPayload) => {
    addons.setConfig({
      theme: globals.themeMode === 'dark' ? themes.dark : themes.light,
    })
  })
})
