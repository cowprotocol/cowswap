import BN from 'bn.js';
export { fromWei, toWei, isBN, toBN } from 'web3-utils';
export function toBnOrNull(value) {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    try {
        return new BN(value);
    }
    catch (error) {
        return null;
    }
}
const id2Network = {
    1: 'Mainnet',
    3: 'Ropsten',
    4: 'Rinkeby',
    5: 'Goerli',
    42: 'Kovan',
    100: 'xDai',
};
export const getNetworkFromId = (networkId) => id2Network[networkId] || 'Unknown Network';
//# sourceMappingURL=ethereum.js.map