import { FC, ReactNode } from 'react'

import { DEFAULT_LOCALE } from '@cowprotocol/common-const'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

interface ProviderProps {
  children: ReactNode
}

i18n.load(DEFAULT_LOCALE, {})
i18n.activate(DEFAULT_LOCALE)

export const LinguiWrapper: FC<ProviderProps> = ({ children }) => {
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}
