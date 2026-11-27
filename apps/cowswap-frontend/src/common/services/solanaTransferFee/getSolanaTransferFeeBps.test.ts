/**
 * Mint decoding checks `instanceof Uint8Array`, which fails for jsdom-realm buffers.
 * @jest-environment node
 */
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js'

import { getSolanaTransferFeeBps } from './getSolanaTransferFeeBps'

const FEE_MINT = new PublicKey('HcRLc9VDgjLeK154xDawfb1dmVJ98DoSqcwTHGqiDeJR')
// Mainnet mint data of FEE_MINT, a Token-2022 mint with a 300 bps transfer fee in both fee slots
const FEE_MINT_DATA =
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALAViG0YdaQ0JAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEAbAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAtXK96l8U0l2WOVhsmI9Djj1NA8git1QpO9FQLCssuGsf5IzgAAAABBAAAAAAAAAAAZKeztuANLAEBBAAAAAAAAAAAZKeztuANLAESAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2zdaXB3TWd0BklMZG9+cKOseYaKAmAPNDp23JXokhVhMApgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPbN1pcHdNZ3QGSUxkb35wo6x5hooCYA80OnbcleiSFWDQAAAEFub255bW91cyBDYXQEAAAAWkNBVEUAAABodHRwczovL2dhdGV3YXkuaXJ5cy54eXovR055NmQ5ZGhoRXV4RkJxS2I4RWdtNWJlaVJNTDRmRFVTNnp1S1F1VHM3WXMAAAAA'

const NO_FEE_MINT = new PublicKey('2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo')
// Mainnet mint data of PYUSD, a Token-2022 mint with a transfer fee extension set to 0 bps
const NO_FEE_MINT_DATA =
  'AQAAAJPkMU4Y+uEbsZMeeiiX9ljfNXCarVZ7fbwaCVSmePpU6cWX4WdmAgAGAQEAAAAXhTJh72q4Uypn8FOGWq0xKT/PB88SCrW5oVcGVI3AKwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQMAIAAXhTJh72q4Uypn8FOGWq0xKT/PB88SCrW5oVcGVI3AKwwAIAAXhTJh72q4Uypn8FOGWq0xKT/PB88SCrW5oVcGVI3AKwEAbAAXhTJh72q4Uypn8FOGWq0xKT/PB88SCrW5oVcGVI3AKxeFMmHvarhTKmfwU4ZarTEpP88HzxIKtbmhVwZUjcArAAAAAAAAAABdAgAAAAAAAAAAAAAAAAAAAABdAgAAAAAAAAAAAAAAAAAAAAAEAEEAF4UyYe9quFMqZ/BThlqtMSk/zwfPEgq1uaFXBlSNwCsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAIEAF4UyYe9quFMqZ/BThlqtMSk/zwfPEgq1uaFXBlSNwCscN+ZDO3ME3YJzeuQNm4vzxJ9bDmxJqNUzKLPlBpAcVwEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgBAABeFMmHvarhTKmfwU4ZarTEpP88HzxIKtbmhVwZUjcArAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAEAAF4UyYe9quFMqZ/BThlqtMSk/zwfPEgq1uaFXBlSNwCsXkkg7bIoqh7dHHYFPlZH5OVyECpzj2fTVun06S4p0nhMArgAXhTJh72q4Uypn8FOGWq0xKT/PB88SCrW5oVcGVI3AKxeSSDtsiiqHt0cdgU+Vkfk5XIQKnOPZ9NW6fTpLinSeCgAAAFBheVBhbCBVU0QFAAAAUFlVU0RPAAAAaHR0cHM6Ly90b2tlbi1tZXRhZGF0YS5wYXhvcy5jb20vcHl1c2RfbWV0YWRhdGEvcHJvZC9zb2xhbmEvcHl1c2RfbWV0YWRhdGEuanNvbgAAAAA='

const TRANSFER_FEE_CONFIG_EXTENSION_TYPE = 1
// Token-2022 places the account type byte right after the 165-byte base account, then TLV extensions
const EXTENSIONS_OFFSET = 166
// Inside TransferFeeConfig: two 32-byte authorities and a u64 withheld amount precede the older fee,
// each fee is { epoch: u64, maximumFee: u64, transferFeeBasisPoints: u16 }
const OLDER_FEE_OFFSET = 72
const NEWER_FEE_OFFSET = 90
const FEE_BPS_OFFSET = 16

function accountInfo(owner: PublicKey, data: Buffer): AccountInfo<Buffer> {
  return { owner, data, executable: false, lamports: 1, rentEpoch: 0 }
}

function createConnection(info: AccountInfo<Buffer> | null, epoch = 1_000): Connection {
  return {
    getAccountInfo: jest.fn().mockResolvedValue(info),
    getEpochInfo: jest.fn().mockResolvedValue({ epoch }),
  } as unknown as Connection
}

function setNewerFee(data: Buffer, epoch: bigint, bps: number): Buffer {
  const copy = Buffer.from(data)
  let offset = EXTENSIONS_OFFSET

  while (offset < copy.length) {
    const type = copy.readUInt16LE(offset)
    const length = copy.readUInt16LE(offset + 2)

    if (type === TRANSFER_FEE_CONFIG_EXTENSION_TYPE) {
      const newerFee = offset + 4 + NEWER_FEE_OFFSET
      copy.writeBigUInt64LE(epoch, newerFee)
      copy.writeUInt16LE(bps, newerFee + FEE_BPS_OFFSET)

      expect(copy.readUInt16LE(offset + 4 + OLDER_FEE_OFFSET + FEE_BPS_OFFSET)).toBe(300)

      return copy
    }

    offset += 4 + length
  }

  throw new Error('TransferFeeConfig extension not found')
}

const feeMintData = Buffer.from(FEE_MINT_DATA, 'base64')

describe('getSolanaTransferFeeBps', () => {
  it('returns the transfer fee of a Token-2022 mint', async () => {
    const connection = createConnection(accountInfo(TOKEN_2022_PROGRAM_ID, feeMintData))

    await expect(getSolanaTransferFeeBps(connection, FEE_MINT)).resolves.toBe(300)
    expect(connection.getEpochInfo).not.toHaveBeenCalled()
  })

  it('returns null for a Token-2022 mint whose transfer fee is zero', async () => {
    const connection = createConnection(accountInfo(TOKEN_2022_PROGRAM_ID, Buffer.from(NO_FEE_MINT_DATA, 'base64')))

    await expect(getSolanaTransferFeeBps(connection, NO_FEE_MINT)).resolves.toBeNull()
  })

  it('returns null for a mint owned by the legacy token program', async () => {
    const connection = createConnection(accountInfo(TOKEN_PROGRAM_ID, Buffer.alloc(82)))

    await expect(getSolanaTransferFeeBps(connection, FEE_MINT)).resolves.toBeNull()
  })

  it('returns null when the mint account does not exist', async () => {
    const connection = createConnection(null)

    await expect(getSolanaTransferFeeBps(connection, FEE_MINT)).resolves.toBeNull()
  })

  it('returns the older fee before the newer fee epoch is reached', async () => {
    const data = setNewerFee(feeMintData, 2_000n, 500)
    const connection = createConnection(accountInfo(TOKEN_2022_PROGRAM_ID, data), 1_999)

    await expect(getSolanaTransferFeeBps(connection, FEE_MINT)).resolves.toBe(300)
  })

  it('returns the newer fee once its epoch is reached', async () => {
    const data = setNewerFee(feeMintData, 2_000n, 500)
    const connection = createConnection(accountInfo(TOKEN_2022_PROGRAM_ID, data), 2_000)

    await expect(getSolanaTransferFeeBps(connection, FEE_MINT)).resolves.toBe(500)
  })
})
