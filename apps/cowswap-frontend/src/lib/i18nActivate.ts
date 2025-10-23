import { SupportedLocale } from '@cowprotocol/common-const'

import { i18n } from '@lingui/core'
import {
  af,
  ar,
  ca,
  cs,
  da,
  de,
  el,
  en,
  es,
  fi,
  fr,
  he,
  hu,
  id,
  it,
  ja,
  ko,
  nl,
  no,
  pl,
  pt,
  ro,
  ru,
  sr,
  sv,
  sw,
  tr,
  uk,
  vi,
  zh,
} from 'make-plural/plurals'
import { PluralCategory } from 'make-plural/plurals'

type LocalePlural = {
  [key in SupportedLocale]: (n: number | string, ord?: boolean) => PluralCategory
}

const plurals: LocalePlural = {
  'af-ZA': af,
  'ar-SA': ar,
  'ca-ES': ca,
  'cs-CZ': cs,
  'da-DK': da,
  'de-DE': de,
  'el-GR': el,
  'en-US': en,
  'es-ES': es,
  'fi-FI': fi,
  'fr-FR': fr,
  'he-IL': he,
  'hu-HU': hu,
  'id-ID': id,
  'it-IT': it,
  'ja-JP': ja,
  'ko-KR': ko,
  'nl-NL': nl,
  'no-NO': no,
  'pl-PL': pl,
  'pt-BR': pt,
  'pt-PT': pt,
  'ro-RO': ro,
  'ru-RU': ru,
  'sr-SP': sr,
  'sv-SE': sv,
  'sw-TZ': sw,
  'tr-TR': tr,
  'uk-UA': uk,
  'vi-VN': vi,
  'zh-CN': zh,
  'zh-TW': zh,
  pseudo: en,
}

export function loadLocalePluralRules(locale: SupportedLocale): void {
  const pluralRule = plurals[locale]

  if (!pluralRule) {
    return
  }

  const lingui = i18n as {
    loadLocaleData?: (
      targetLocale: SupportedLocale,
      data: { plurals: (n: number | string, ord?: boolean) => unknown },
    ) => void
  }

  lingui.loadLocaleData?.(locale, { plurals: pluralRule })
}

export type LocaleCatalogModule = {
  default?: {
    messages?: Record<string, unknown>
  }
  messages?: Record<string, unknown>
}

export type LocaleCatalogLoader = () => Promise<LocaleCatalogModule>
export type LocaleCatalogLoaders = Record<string, LocaleCatalogLoader>

export function createDynamicActivate(loaders: LocaleCatalogLoaders) {
  return async function dynamicActivate(locale: SupportedLocale): Promise<void> {
    loadLocalePluralRules(locale)
    try {
      const catalogLoader = loaders[`../locales/${locale}.po`] || loaders[`../locales/${locale}.js`]

      if (!catalogLoader) {
        throw new Error(`Missing locale catalog for ${locale}`)
      }

      const catalog = await catalogLoader()
      // Bundlers will either export it as default or as a named export named default.
      const messages = catalog.messages || catalog.default?.messages || catalog.default || {}
      i18n.load(locale, messages)
      i18n.activate(locale)
    } catch (error) {
      // Do nothing
      console.error('Could not load locale file: ' + locale, error)
    }
  }
}
