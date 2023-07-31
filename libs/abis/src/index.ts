// Custom
export * from './generated/custom'
export type { GPv2Order } from './generated/custom/ComposableCoW'
export const GPv2SettlementAbi = require('./abis/GPv2Settlement.json')
export const ComposableCoWAbi = require('./abis/ComposableCoW.json')
export const vCowAbi = require('./abis/vCow.json')
export const SignatureVerifierMuxerAbi = require('./abis/SignatureVerifierMuxer.json')
export const MerkleDropAbi = require('./abis/MerkleDrop.json')
export const TokenDistroAbi = require('./abis/TokenDistro.json')

// Legacy
export type {
  ArgentWalletContract,
  ArgentWalletDetector,
  EnsPublicResolver,
  EnsRegistrar,
  Erc20,
  Erc721,
  Erc1155,
  Weth,
  UniswapInterfaceMulticall,
} from './generated/legacy'

export type { Erc20Interface } from './generated/legacy/Erc20'

// EthFlow
export type { CoWSwapEthFlow } from './generated/ethflow'
export const ethFlowBarnJson = require('@cowprotocol/ethflowcontract/networks.barn.json')
export const ethFlowProdJson = require('@cowprotocol/ethflowcontract/networks.prod.json')

// Legacy ABIs
export const ArgentWalletContractAbi = require('./abis-legacy/argent-wallet-contract.json')
export const ArgentWalletDetectorAbi = require('./abis-legacy/argent-wallet-detector.json')
export const CoWSwapEthFlowJson = require('@cowprotocol/ethflowcontract/artifacts/CoWSwapEthFlow.sol/CoWSwapEthFlow.json')
export const Eip2612Abi = require('./abis-legacy/eip_2612.json')
export const EnsPublicResolverAbi = require('./abis-legacy/ens-public-resolver.json')
export const EnsAbi = require('./abis-legacy/ens-registrar.json')
export const Erc1155Abi = require('./abis-legacy/erc1155.json')
export const Erc20Abi = require('./abis-legacy/erc20.json')
export const Erc20Bytes32Abi = require('./abis-legacy/erc20_bytes32.json')
export const Erc721Abi = require('./abis-legacy/erc721.json')
export const WethAbi = require('./abis-legacy/weth.json')
