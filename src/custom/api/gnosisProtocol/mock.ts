import { ChainId } from 'state/lists/actions'
import deterministicHash from 'utils/deterministicHash'
import { MetadataKind } from 'utils/metadata'
import { AppMetadata, UploadMetadataParams } from './api'

const appDataDoc = {
  version: '1.0.0',
  appCode: 'CowSwap',
  metadata: {
    referrer: {
      kind: MetadataKind.REFERRAL,
      referrer: '0x1811be0994930fE9480eAEDe25165608B093ad7A',
      version: '1.0.0',
    },
  },
}

const appMetadataResponse: AppMetadata = {
  hash: deterministicHash(appDataDoc),
  metadata: appDataDoc,
  user: appDataDoc.metadata.referrer.referrer,
}

export async function getAppDataDoc(chainId: ChainId, address: string): Promise<AppMetadata | null> {
  console.log(
    '[util:operator] Get AppData doc for',
    chainId,
    address,
    address === appDataDoc.metadata.referrer.referrer
      ? ''
      : `. Pass ${appDataDoc.metadata.referrer.referrer} as address to return a valid appData document`
  )

  if (address === appDataDoc.metadata.referrer.referrer) {
    return appMetadataResponse
  }

  return null
}

export async function uploadAppDataDoc(params: UploadMetadataParams): Promise<void> {
  console.log('[utils:operatorMock] Post AppData doc', params)
  return
}
