import { i18n, MessageDescriptor } from '@lingui/core'

/**
 * Utility function to extract text from either a string or an internationalization message descriptor.
 *
 * @param text - Either a plain string or a MessageDescriptor object for i18n
 * @returns The text as a string - either the original string or the translated message
 */
export const extractTextFromStringOrI18nDescriptor = (text?: string | MessageDescriptor): string | undefined =>
  text ? (typeof text === 'string' ? text : i18n._(text as MessageDescriptor)) : undefined
