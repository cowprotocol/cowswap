import { decodeAppData } from 'modules/appData/utils/decodeAppData'

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null
}

function readString(value: unknown, key: string): string | undefined {
  if (!isRecord(value)) return undefined

  const raw = value[key]

  return typeof raw === 'string' ? raw : undefined
}

function normalizeCode(code: string | undefined): string | undefined {
  if (!code) return undefined
  const trimmedCode = code.trim()

  return trimmedCode ? trimmedCode.toUpperCase() : undefined
}

export function getReferrerCodeFromAppData(fullAppData: string | undefined): string | undefined {
  if (!fullAppData) return undefined

  const decoded = decodeAppData(fullAppData)

  if (!decoded || !isRecord(decoded) || !isRecord(decoded.metadata) || !isRecord(decoded.metadata.referrer)) {
    return undefined
  }

  return normalizeCode(readString(decoded.metadata.referrer, 'code'))
}

export function getAppDataHash(order: unknown): string | undefined {
  const appData = readString(order, 'appData')

  if (!appData || appData.trim().startsWith('{')) {
    return undefined
  }

  return appData
}

export function extractFullAppDataFromResponse(response: unknown): string | undefined {
  if (!response) return undefined

  if (typeof response === 'string') {
    return response
  }

  if (!isRecord(response)) {
    return undefined
  }

  const fullAppData =
    readString(response, 'fullAppData') || readString(response, 'full_app_data') || readString(response, 'appData')

  if (fullAppData) {
    return fullAppData
  }

  const document = response.document
  if (isRecord(document)) {
    return JSON.stringify(document)
  }

  return undefined
}
