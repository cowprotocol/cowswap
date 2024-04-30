import type { I18n } from '@lingui/core'
import { en, es, sr } from 'make-plural/plurals'

//anounce which locales we are going to use and connect them to approprite plural rules
export function initTranslation(i18n: I18n): void {
  i18n.loadLocaleData({
    en: { plurals: en },
    es: { plurals: es },
    pseudo: { plurals: en }
  })
}

export async function loadTranslation(locale: string, isProduction = true) {
  let data
  if (isProduction) {
    data = await import(`../translations/locales/${locale}/messages`)
  } else {
    data = await import(
      `@lingui/loader!../translations/locales/${locale}/messages.po`
    )
  }

  return data.messages
}