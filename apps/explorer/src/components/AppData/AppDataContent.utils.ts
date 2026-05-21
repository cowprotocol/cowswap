import { AnyAppDataDocVersion } from '@cowprotocol/cow-sdk'

export type AppDataTab = 'raw' | 'parsed'

export const APPDATA_VIEW_STORAGE_KEY = 'explorer.appDataContent.view'

export function getStoredView(): AppDataTab {
  if (typeof window === 'undefined') return 'raw'

  const storedView = window.localStorage.getItem(APPDATA_VIEW_STORAGE_KEY)
  return storedView === 'parsed' ? 'parsed' : 'raw'
}

export function parseQuoteBody(decodedAppData?: AnyAppDataDocVersion): unknown {
  if (!decodedAppData) return undefined

  try {
    return {
      ...decodedAppData,
      metadata: {
        ...decodedAppData.metadata,
        bridging: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(decodedAppData.metadata as any).bridging,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          quoteBody: JSON.parse((decodedAppData.metadata as any).bridging.quoteBody),
        },
      },
    }
  } catch {
    return decodedAppData
  }
}

export function stringifyJson(value: unknown): string {
  if (value === undefined) return ''
  return JSON.stringify(value, null, 2)
}
