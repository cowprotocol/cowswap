import CID from 'cids'
import multihashes from 'multihashes'
import { uploadTextFileToIpfs, pinByHash } from 'api/ipfs'

interface Metadata {
  version: string
}

export interface ReferralMetadata extends Metadata {
  address: string
}

export type MetadataDoc = {
  referrer?: ReferralMetadata
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
        address: referralAddress,
        version: '0.1.0',
      },
    },
  }
}

export function generateAppDataDoc(metadata: MetadataDoc = {}): AppDataDoc {
  return {
    version: '0.1.0',
    appCode: DEFAULT_APP_CODE,
    metadata: {
      ...metadata,
    },
  }
}

export async function uploadMetadataDocToIpfs(appDataDoc: AppDataDoc): Promise<string> {
  const cid = await uploadTextFileToIpfs(appDataDoc)
  await pinByHash(cid)
  const { digest } = multihashes.decode(new CID(cid).multihash)
  return `0x${Buffer.from(digest).toString('hex')}`
}
