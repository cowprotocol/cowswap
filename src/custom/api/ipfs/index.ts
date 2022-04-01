import { PINATA_API_KEY, PINATA_SECRET_API_KEY, PINATA_API_URL } from 'constants/ipfs'

type PinataPinResponse = {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

const pinataUrl = `${PINATA_API_URL}/pinning/pinJSONToIPFS`

const headers = new Headers({
  'Content-Type': 'application/json',
  pinata_api_key: PINATA_API_KEY,
  pinata_secret_api_key: PINATA_SECRET_API_KEY,
})

export async function pinJSONToIPFS(file: any): Promise<PinataPinResponse> {
  const body = JSON.stringify({
    pinataContent: file,
    pinataMetadata: { name: 'appData-affiliate' },
  })

  const request = new Request(pinataUrl, {
    method: 'POST',
    headers,
    body,
  })

  const response = await fetch(request)
  const data = await response.json()

  if (response.status !== 200) {
    throw new Error(data.error.details || data.error)
  }

  return data
}
