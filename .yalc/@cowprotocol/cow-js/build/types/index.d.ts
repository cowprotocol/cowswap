export declare type Command = () => void;
export declare type AsyncCommand = () => Promise<void>;
export interface WithAddressMainnetOpt {
    addressMainnet?: string;
}
export interface WithId {
    id: number;
}
export interface WithSymbolAndName {
    symbol?: string;
    name?: string;
}
export interface WithAddress {
    address: string;
}
export interface WithDecimals {
    decimals: number;
}
export declare type TokenErc20 = WithSymbolAndName & WithAddress & WithDecimals;
export declare type Token = TokenErc20 & WithAddressMainnetOpt & Partial<WithId>;
export declare type TokenDex = TokenErc20 & WithAddressMainnetOpt & WithId;
export interface TokenDetailsConfig extends WithSymbolAndName, WithDecimals {
    addressByNetwork: {
        [networkId: string]: string | undefined;
    };
}
export declare type TokenDetailsConfigLegacy = TokenDetailsConfig & WithId;
//# sourceMappingURL=index.d.ts.map