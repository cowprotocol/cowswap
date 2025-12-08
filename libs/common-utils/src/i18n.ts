import { useCallback } from 'react'

import { i18n, MessageDescriptor } from '@lingui/core'
import { useLingui } from '@lingui/react/macro'

/**
 * Utility function to extract text from either a string or an internationalization message descriptor.
 *
 * @param text - Either a plain string or a MessageDescriptor object for i18n
 * @returns The text as a string - either the original string or the translated message
 */
export const extractTextFromStringOrI18nDescriptor = (text?: string | MessageDescriptor): string | undefined =>
  text ? (typeof text === 'string' ? text : i18n._(text as MessageDescriptor)) : undefined

export const useExtractText = (): {
  extractTextFromStringOrI18nDescriptor: (text?: string | MessageDescriptor) => string | undefined
} => {
  const { i18n } = useLingui()

  const extractTextFromStringOrI18nDescriptor = useCallback(
    (text?: string | MessageDescriptor): string | undefined => {
      if (!text) return undefined
      return typeof text === 'string' ? text : i18n._(text)
    },
    [i18n],
  )

  return { extractTextFromStringOrI18nDescriptor }
}
