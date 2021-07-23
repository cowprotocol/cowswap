export enum MetadataKind {
  REFERRAL = 'referrer',
}

interface Metadata {
  kind: MetadataKind
  version: string
}

export interface ReferralMetadata extends Metadata {
  referrer: string
}

export type MetadataDoc = {
  [MetadataKind.REFERRAL]?: ReferralMetadata
}

export type AppDataDoc = {
  version: string
  appCode?: string
  metadata: MetadataDoc
}

export const DEFAULT_APP_CODE = 'CowSwap'

export function generateReferralMetadataDoc(
  referralAddress: string,
  appDataDoc: AppDataDoc = generateAppDataDoc()
): AppDataDoc {
  return {
    ...appDataDoc,
    metadata: {
      ...appDataDoc.metadata,
      referrer: {
        kind: MetadataKind.REFERRAL,
        referrer: referralAddress,
        version: '1.0.0',
      },
    },
  }
}

export function generateAppDataDoc(metadata: MetadataDoc = {}): AppDataDoc {
  return {
    version: '1.0.0',
    appCode: DEFAULT_APP_CODE,
    metadata: {
      ...metadata,
    },
  }
}
