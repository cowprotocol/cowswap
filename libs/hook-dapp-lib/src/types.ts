import { HookDappType, HookDappWalletCompatibility } from './consts'

export interface CowHook {
  target: string
  callData: string
  gasLimit: string
  dappId: string
}

export interface HookDappConditions {
  position?: 'post' | 'pre'
  walletCompatibility?: HookDappWalletCompatibility[]
  supportedNetworks?: number[]
}

export interface CowHookCreation {
  hook: Omit<CowHook, 'dappId'>
  recipientOverride?: string
}

export interface TokenData {
  address: string
}

export interface CowHookDetails extends CowHookCreation {
  hook: CowHook
  uuid: string
}

export interface CowHookToEdit extends CowHookCreation {
  uuid: string
}

export interface CoWHookDappActions {
  addHook(payload: CowHookCreation): void

  editHook(payload: CowHookToEdit): void

  setSellToken(token: TokenData): void

  setBuyToken(token: TokenData): void
}

export interface HookDappOrderParams {
  kind: 'buy' | 'sell'
  validTo: number
  sellTokenAddress: string
  buyTokenAddress: string
  receiver: string
  sellAmount: string
  buyAmount: string
}

enum SimpleTypeType {
  Address = 'address',
  Bool = 'bool',
  Bytes = 'bytes',
  Slice = 'slice',
  String = 'string',
  Uint = 'uint',
}

interface Type {
  type: SimpleTypeType
}

enum SoltypeType {
  Address = 'address',
  Bool = 'bool',
  Bytes32 = 'bytes32',
  MappingAddressUint256 = 'mapping (address => uint256)',
  MappingUint256Uint256 = 'mapping (uint256 => uint256)',
  String = 'string',
  Tuple = 'tuple',
  TypeAddress = 'address[]',
  TypeTuple = 'tuple[]',
  Uint16 = 'uint16',
  Uint256 = 'uint256',
  Uint48 = 'uint48',
  Uint56 = 'uint56',
  Uint8 = 'uint8',
}

enum StorageLocation {
  Calldata = 'calldata',
  Default = 'default',
  Memory = 'memory',
  Storage = 'storage',
}

interface SoltypeElement {
  name: string
  type: SoltypeType
  storage_location: StorageLocation
  components: SoltypeElement[] | null
  offset: number
  index: string
  indexed: boolean
  simple_type?: Type
}

interface RawElement {
  address: string
  key: string
  original: string
  dirty: string
}

export interface StateDiff {
  address: string
  soltype: SoltypeElement | null
  original: string | Record<string, unknown>
  dirty: string | Record<string, unknown>
  raw: RawElement[]
}

export interface HookDappContext {
  chainId: number
  account?: string
  orderParams: HookDappOrderParams | null
  hookToEdit?: CowHookDetails
  isSmartContract: boolean | undefined
  isPreHook: boolean
  isDarkMode: boolean
  // { [address: string]: { [token: string]: balanceDiff: string } }
  // example: { '0x123': { '0x456': '100', '0xabc': '-100' } }
  balancesDiff: Record<string, Record<string, string>>
  stateDiff: StateDiff[]
}

export interface HookDappBase {
  id: string
  name: string
  descriptionShort?: string
  description?: string
  type: HookDappType
  version: string
  website: string
  image: string
  conditions?: HookDappConditions
}
