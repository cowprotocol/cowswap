import { publicToAddress } from 'ethereumjs-util'
import HDNode from 'hdkey'

import { TREZOR_DERIVATION_PATH } from 'modules/wallet/api/utils/getHwAccount'

import type { TrezorConnect } from '@trezor/connect-web'

/**
 * This file contains cherry-picked code from import { TrezorSubprovider } from '@0x/subproviders'
 */

export async function getAccountsAsync(trezorConnect: TrezorConnect, numberOfAccounts = 100): Promise<string[] | null> {
  const initialDerivedKeyInfo = await initialDerivedKeyInfoAsync(trezorConnect)

  if (!initialDerivedKeyInfo) return null

  const derivedKeyInfos = calculateDerivedHDKeyInfos(initialDerivedKeyInfo, numberOfAccounts)

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

  constructor(private parentDerivedKeyInfo: DerivedHDKeyInfo, private searchLimit = 1000) {}
  next() {
    const baseDerivationPath = this.parentDerivedKeyInfo.baseDerivationPath
    const derivationIndex = this.index
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
    const isDone = this.index === this.searchLimit
    this.index++
    return {
      done: isDone,
      value: derivedKey,
    }
  }
  [Symbol.iterator]() {
    return this
  }
}

async function initialDerivedKeyInfoAsync(trezorConnect: TrezorConnect): Promise<DerivedHDKeyInfo | null> {
  const response = await trezorConnect.getPublicKey({
    path: TREZOR_DERIVATION_PATH,
  })

  if (!response.success) return null

  const payload = response.payload
  const hdKey = new HDNode()
  hdKey.publicKey = new Buffer(payload.publicKey, 'hex')
  hdKey.chainCode = new Buffer(payload.chainCode, 'hex')
  const address = addressOfHDKey(hdKey)

  return {
    hdKey,
    address,
    derivationPath: TREZOR_DERIVATION_PATH,
    baseDerivationPath: TREZOR_DERIVATION_PATH.slice(2),
  }
}

function calculateDerivedHDKeyInfos(parentDerivedKeyInfo: DerivedHDKeyInfo, numberOfKeys: number): DerivedHDKeyInfo[] {
  const derivedKeys: DerivedHDKeyInfo[] = []
  const derivedKeyIterator = new DerivedHDKeyInfoIterator(parentDerivedKeyInfo, numberOfKeys)

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
