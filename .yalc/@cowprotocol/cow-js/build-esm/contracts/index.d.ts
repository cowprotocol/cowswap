import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Erc20Contract } from './Erc20Contract';
import { WethContract } from './WethContract';
import { TcrContract } from './TcrContract';
export * from './types';
export * from './Erc20Contract';
export * from './WethContract';
export * from './TcrContract';
export declare const erc20Abi: AbiItem[];
export declare const wethAbi: AbiItem[];
export declare const tcrAbi: AbiItem[];
export declare function createErc20Contract(web3: Web3, address?: string): Erc20Contract;
export declare function createWrapEtherContract(web3: Web3, address?: string): WethContract;
export declare function createTcrContract(web3: Web3, address?: string): TcrContract;
//# sourceMappingURL=index.d.ts.map