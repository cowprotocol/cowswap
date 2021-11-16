import pinataSDK, { PinataPinResponse } from '@pinata/sdk'
import { PINATA_API_KEY, PINATA_SECRET_API_KEY } from 'constants/ipfs'

const pinata = pinataSDK(PINATA_API_KEY, PINATA_SECRET_API_KEY)

export async function pinJSONToIPFS(file: any): Promise<PinataPinResponse> {
  return pinata.pinJSONToIPFS(file, { pinataMetadata: { name: 'appData-affiliate' } })
}
