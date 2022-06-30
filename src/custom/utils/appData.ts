import { COW_SDK } from 'constants/index'
import { MetadataDoc, QuoteMetadata, ReferralMetadata, SupportedChainId } from '@cowprotocol/cow-sdk'
import { environmentName } from 'utils/environments'

//TODO: move helper methods to SDK
const QUOTE_METADATA_VERSION = '0.2.0'
const REFERRER_METADATA_VERSION = '0.1.0'

export type BuildAppDataParams = {
  chainId: SupportedChainId
  slippageBips: string
  sellAmount?: string
  buyAmount?: string
  quoteId?: number
  referrerAccount?: string
  appCode: string
}

export async function buildAppData({
  chainId,
  slippageBips,
  sellAmount,
  buyAmount,
  quoteId,
  referrerAccount,
  appCode,
}: BuildAppDataParams) {
  const sdk = COW_SDK[chainId]

  // build quote metadata, not required in the schema but always present
  const quoteMetadata = _buildQuoteMetadata(slippageBips)
  const metadata: MetadataDoc = { quote: quoteMetadata }

  // build referrer metadata, optional
  if (referrerAccount) {
    metadata.referrer = _buildReferralMetadata(referrerAccount)
  }

  const doc = sdk.metadataApi.generateAppDataDoc(metadata, { appCode, environment: environmentName })

  const calculatedAppData = await sdk.metadataApi.calculateAppDataHash(doc)

  return { doc, calculatedAppData }
}

function _buildQuoteMetadata(slippageBips: string): QuoteMetadata {
  return { version: QUOTE_METADATA_VERSION, slippageBips }
}

function _buildReferralMetadata(address: string): ReferralMetadata {
  return {
    address,
    version: REFERRER_METADATA_VERSION,
  }
}
