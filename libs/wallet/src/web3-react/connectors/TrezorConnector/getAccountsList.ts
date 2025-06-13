import { publicToAddress } from 'ethereumjs-util'
import HDNode from 'hdkey'

import { TREZOR_DERIVATION_PATH } from '../../../api/utils/getHwAccount'

import type { TrezorConnect } from '@trezor/connect-web'

/**
 * This file contains cherry-picked code from import { TrezorSubprovider } from '@0x/subproviders'
 */

export async function getAccountsList(trezorConnect: TrezorConnect, offset = 0, limit = 100): Promise<string[] | null> {
  const initialDerivedKeyInfo = await initialDerivedKeyInfoAsync(trezorConnect)

  if (!initialDerivedKeyInfo) return null

  const derivedKeyInfos = calculateDerivedHDKeyInfos(initialDerivedKeyInfo, offset, limit)

  return derivedKeyInfos.map((k) => k.address)
}

interface DerivedHDKeyInfo {
  hdKey: HDNode
  address: string
  derivationPath: string
  baseDerivationPath: string
}

class DerivedHDKeyInfoIterator {
  private index = 0

  constructor(private parentDerivedKeyInfo: DerivedHDKeyInfo, private offset = 0, private limit = 100) {}
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  next() {
    const baseDerivationPath = this.parentDerivedKeyInfo.baseDerivationPath
    const derivationIndex = this.offset + this.index
    const fullDerivationPath = `m/${baseDerivationPath}/${derivationIndex}`
    const path = `m/${derivationIndex}`
    const hdKey = this.parentDerivedKeyInfo.hdKey.derive(path)
    const address = addressOfHDKey(hdKey)
    const derivedKey = {
      address,
      hdKey,
      baseDerivationPath,
      derivationPath: fullDerivationPath,
    }
    const isDone = this.index === this.limit
    this.index++
    return {
      done: isDone,
      value: derivedKey,
    }
  }
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  [Symbol.iterator]() {
    return this
  }
}

const derivedKeyInfoCache = new Map<TrezorConnect, DerivedHDKeyInfo>()

async function initialDerivedKeyInfoAsync(trezorConnect: TrezorConnect): Promise<DerivedHDKeyInfo | null> {
  if (derivedKeyInfoCache.has(trezorConnect)) {
    return derivedKeyInfoCache.get(trezorConnect) || null
  }

  const response = await trezorConnect.getPublicKey({
    path: TREZOR_DERIVATION_PATH,
  })

  if (!response.success) return null

  const payload = response.payload
  const hdKey = new HDNode()
  hdKey.publicKey = new Buffer(payload.publicKey, 'hex')
  hdKey.chainCode = new Buffer(payload.chainCode, 'hex')
  const address = addressOfHDKey(hdKey)

  const info: DerivedHDKeyInfo = {
    hdKey,
    address,
    derivationPath: TREZOR_DERIVATION_PATH,
    baseDerivationPath: TREZOR_DERIVATION_PATH.slice(2),
  }

  derivedKeyInfoCache.set(trezorConnect, info)

  return info
}

function calculateDerivedHDKeyInfos(
  parentDerivedKeyInfo: DerivedHDKeyInfo,
  offset: number,
  limit: number
): DerivedHDKeyInfo[] {
  const derivedKeys: DerivedHDKeyInfo[] = []
  const derivedKeyIterator = new DerivedHDKeyInfoIterator(parentDerivedKeyInfo, offset, limit)

  for (const key of derivedKeyIterator) {
    derivedKeys.push(key)
  }

  return derivedKeys
}

function addressOfHDKey(hdKey: HDNode): string {
  const shouldSanitizePublicKey = true
  const derivedPublicKey = hdKey.publicKey
  const ethereumAddressUnprefixed = publicToAddress(derivedPublicKey, shouldSanitizePublicKey).toString('hex')

  return '0x' + ethereumAddressUnprefixed.toLowerCase()
}
