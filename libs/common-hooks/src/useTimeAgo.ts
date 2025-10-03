import { useEffect, useState } from 'react'

import { SUPPORTED_LOCALES } from '@cowprotocol/common-const'

import { useLingui } from '@lingui/react/macro'
import * as timeago from 'timeago.js'
import * as locales from 'timeago.js/lib/lang'

type LocaleFunc = (diff: number, idx: number, totalSec?: number | undefined) => [string, string]

/**
 * Returns the timeago.js and short locale equivalents for a given locale string.
 * @param locale - The locale string (e.g., 'en-US').
 * @returns An object with `timeAgoLocale` and `shortLocale` properties.
 */
const getLocaleEquivalent = (locale: string): { timeAgoLocale: string; shortLocale: string } => {
  return { timeAgoLocale: locale.replace('-', '_'), shortLocale: locale.slice(0, 2) }
}

/**
 * Initializes and registers supported locales for timeago.js.
 * Maps SUPPORTED_LOCALES to the corresponding timeago.js locale functions.
 */
const timeAgoInit = (): void => {
  const localesKeys = Object.keys(locales)
  const localesMap = locales as Record<string, LocaleFunc>

  for (const supportedLocale in SUPPORTED_LOCALES) {
    const { timeAgoLocale, shortLocale } = getLocaleEquivalent(SUPPORTED_LOCALES[supportedLocale])

    if (localesKeys.includes(timeAgoLocale)) {
      timeago.register(SUPPORTED_LOCALES[supportedLocale], localesMap[timeAgoLocale])
    } else if (localesKeys.includes(shortLocale)) {
      timeago.register(SUPPORTED_LOCALES[supportedLocale], localesMap[shortLocale])
    }
  }
}

timeAgoInit()

export function useTimeAgo(value?: string | number | Date, interval = 1000): string {
  const [timeAgoValue, setTimeAgoValue] = useState('')
  const { i18n } = useLingui()
  const locale = i18n.locale

  useEffect(() => {
    if (!value) {
      setTimeAgoValue('')
      return
    } else {
      setTimeAgoValue(timeago.format(value, locale))
    }

    const id = setInterval(() => {
      setTimeAgoValue(timeago.format(value, locale))
    }, interval)

    return () => clearInterval(id)
  }, [value, interval, locale])

  return timeAgoValue
}
