import erc20AbiJson from './abi/Erc20.json';
import wethAbiJson from './abi/Weth.json';
import tcrAbiJson from './abi/Tcr.json';
export * from './types';
export * from './Erc20Contract';
export * from './WethContract';
export * from './TcrContract';
export const erc20Abi = erc20AbiJson;
export const wethAbi = wethAbiJson;
export const tcrAbi = tcrAbiJson;
export function createErc20Contract(web3, address) {
    // FIXME: There's an issue with this conversion: https://github.com/gnosis/dex-telegram/issues/14
    const unknownContract = new web3.eth.Contract(erc20Abi, address);
    return unknownContract;
}
export function createWrapEtherContract(web3, address) {
    // FIXME: There's an issue with this conversion: https://github.com/gnosis/dex-telegram/issues/14
    const unknownContract = new web3.eth.Contract(wethAbi, address);
    return unknownContract;
}
export function createTcrContract(web3, address) {
    // FIXME: There's an issue with this conversion: https://github.com/gnosis/dex-telegram/issues/14
    const unknownContract = new web3.eth.Contract(tcrAbi, address);
    return unknownContract;
}
//# sourceMappingURL=index.js.map