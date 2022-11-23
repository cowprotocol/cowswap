"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeSymbol = exports.encodeTokenSymbol = exports.encodeSymbol = void 0;
// We cannot have a dash in the symbol because:
// 1. We use a `-` to separate token symbols in the URL to name the market.
//   For example "A-B", where A is the sell token and B is the buy token
// 2. Tokens can have dashes in their symbols
// 3. Even if we encode dashes to `%2D`, browsers auto convert them back to `-`
// For these reasons, we are picking a symbol that is not ambiguous with a dash
// and it has very little chance to be used as part of a token symbol.
// Meet, the circle dash ⊝ https://www.fileformat.info/info/unicode/char/229d/index.htm
const encodedDashSymbol = '\u229D';
const dashRegex = /-/g;
const encodedDashRegex = new RegExp(encodedDashSymbol, 'g');
/**
 * Encodes given symbol into a URL friendly string.
 * Additionally, encodes chars that might be ambiguous in the URL
 * such as a dash `-`
 *
 * @param symbol Symbol to URL encode
 */
function encodeSymbol(symbol) {
    const sanitizedSymbol = symbol
        .trim() // Your token has leading/trailing spaces? Bad luck
        .replace(dashRegex, encodedDashSymbol); // Your token has dashes? you won't see them for awhile
    return encodeURIComponent(sanitizedSymbol);
}
exports.encodeSymbol = encodeSymbol;
/**
 * Syntactic sugar for encoding Token objects where `symbol` is an optional property.
 * When there's no symbol, uses token address instead.
 *
 * @param token Object containing address and optionally symbol
 */
function encodeTokenSymbol(token) {
    return token.symbol ? encodeSymbol(token.symbol) : token.address;
}
exports.encodeTokenSymbol = encodeTokenSymbol;
/**
 * Decodes symbol which is URL encoded.
 * Trims trailing and leading spaces.
 *
 * @param symbol URL encoded symbol
 */
function decodeSymbol(symbol) {
    return decodeURIComponent(symbol)
        .replace(encodedDashRegex, '-') // Put the dashes back
        .trim(); // Remove any leading/trailing spaces that might have sneaked in
}
exports.decodeSymbol = decodeSymbol;
//# sourceMappingURL=urlEncoding.js.map