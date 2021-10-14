import safeStringify from 'fast-safe-stringify'
import pinataSDK, { PinataPinByHashResponse } from '@pinata/sdk'
import { IPFS_URI, PINATA_API_KEY, PINATA_SECRET_API_KEY } from 'constants/ipfs'

const pinata = pinataSDK(PINATA_API_KEY, PINATA_SECRET_API_KEY)

export async function uploadTextFileToIpfs(file: any): Promise<string> {
  const { create } = await import('ipfs-http-client')
  const client = create({ url: IPFS_URI })
  const doc = safeStringify.stableStringify(file)
  const { cid } = await client.add(doc)
  return cid.toString()
}

export async function pinByHash(hash: string): Promise<PinataPinByHashResponse> {
  return pinata.pinByHash(hash)
}
