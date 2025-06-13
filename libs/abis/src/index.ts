// Custom
import { Interface } from '@ethersproject/abi'

import _AirdropAbi from './abis/Airdrop.json'
import _ComposableCoWAbi from './abis/ComposableCoW.json'
import _CowShedContractAbi from './abis/CowShedContract.json'
import _CoWSwapEthFlowAbi from './abis/CoWSwapEthFlow.json'
import _GPv2SettlementAbi from './abis/GPv2Settlement.json'
import _MerkleDropAbi from './abis/MerkleDrop.json'
import _Multicall3Abi from './abis/Multicall3.json'
import _SBCDepositContractAbi from './abis/SBCDepositContract.json'
import _SignatureVerifierMuxerAbi from './abis/SignatureVerifierMuxer.json'
import _TokenDistroAbi from './abis/TokenDistro.json'
import _vCowAbi from './abis/vCow.json'
import _ArgentWalletContractAbi from './abis-legacy/argent-wallet-contract.json'
import _ArgentWalletDetectorAbi from './abis-legacy/argent-wallet-detector.json'
import _Eip2612Abi from './abis-legacy/eip_2612.json'
import _EnsPublicResolverAbi from './abis-legacy/ens-public-resolver.json'
import _EnsAbi from './abis-legacy/ens-registrar.json'
import _Erc1155Abi from './abis-legacy/erc1155.json'
import _Erc20Abi from './abis-legacy/erc20.json'
import _Erc20Bytes32Abi from './abis-legacy/erc20_bytes32.json'
import _Erc721Abi from './abis-legacy/erc721.json'
import _UniswapInterfaceMulticallAbi from './abis-legacy/UniswapInterfaceMulticall.json'
import _WethAbi from './abis-legacy/weth.json'

import type { Erc20Interface } from './generated/legacy/Erc20'

export const GPv2SettlementAbi = _GPv2SettlementAbi
export const ComposableCoWAbi = _ComposableCoWAbi
export const vCowAbi = _vCowAbi
export const SignatureVerifierMuxerAbi = _SignatureVerifierMuxerAbi
export const MerkleDropAbi = _MerkleDropAbi
export const TokenDistroAbi = _TokenDistroAbi
export const CoWSwapEthFlowAbi = _CoWSwapEthFlowAbi
export const SBCDepositContractAbi = _SBCDepositContractAbi
export const AirdropAbi = _AirdropAbi
export const CowShedContractAbi = _CowShedContractAbi

export * from './generated/custom'
export type { GPv2Order } from './generated/custom/ComposableCoW'
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
export { Erc20__factory } from './generated/legacy/factories/Erc20__factory'

// EthFlow
export type { CoWSwapEthFlow } from './generated/ethflow'

export const ArgentWalletContractAbi = _ArgentWalletContractAbi
export const ArgentWalletDetectorAbi = _ArgentWalletDetectorAbi
export const Eip2612Abi = _Eip2612Abi
export const EnsPublicResolverAbi = _EnsPublicResolverAbi
export const EnsAbi = _EnsAbi
export const Erc1155Abi = _Erc1155Abi
export const Erc20Abi = _Erc20Abi
export const ERC_20_INTERFACE = new Interface(Erc20Abi) as Erc20Interface
export const Erc20Bytes32Abi = _Erc20Bytes32Abi
export const Erc721Abi = _Erc721Abi
export const WethAbi = _WethAbi
export const UniswapInterfaceMulticallAbi = _UniswapInterfaceMulticallAbi
export const Multicall3Abi = _Multicall3Abi
