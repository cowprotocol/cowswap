// No supported recipient format (EVM address/ENS, chain-prefixed EVM, Solana, Bitcoin) comes
// close to 100 chars. Capping here prevents an unbounded string (e.g. a large clipboard paste)
// from ever reaching state: swapRawStateAtom is atomWithStorage, so every change re-serializes
// and re-persists the whole trade state to localStorage - the cost grows with the string length,
// and without a cap that can hang the tab.
export const MAX_RECIPIENT_LENGTH = 100
