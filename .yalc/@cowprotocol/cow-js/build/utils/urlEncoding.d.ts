/**
 * Encodes given symbol into a URL friendly string.
 * Additionally, encodes chars that might be ambiguous in the URL
 * such as a dash `-`
 *
 * @param symbol Symbol to URL encode
 */
export declare function encodeSymbol(symbol: string): string;
/**
 * Syntactic sugar for encoding Token objects where `symbol` is an optional property.
 * When there's no symbol, uses token address instead.
 *
 * @param token Object containing address and optionally symbol
 */
export declare function encodeTokenSymbol(token: {
    symbol?: string;
    address: string;
}): string;
/**
 * Decodes symbol which is URL encoded.
 * Trims trailing and leading spaces.
 *
 * @param symbol URL encoded symbol
 */
export declare function decodeSymbol(symbol: string): string;
//# sourceMappingURL=urlEncoding.d.ts.map