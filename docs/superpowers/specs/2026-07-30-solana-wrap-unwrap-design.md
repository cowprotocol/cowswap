# SOL ↔ WSOL wrap/unwrap

Date: 2026-07-30
Status: approved, ready for implementation planning

## Goal

Give Solana the same in-widget wrap/unwrap flow that EVM chains have today: with the widget on Solana
and a SOL/WSOL pair selected, the trade button reads "Wrap" or "Unwrap" and executes a single Solana
transaction, with the result surfaced in the pending-activity list exactly like an EVM wrap.

Reference for the EVM flow: `useWrapNativeFlow` → `wrapUnwrapCallback` (`legacy/hooks/useWrapCallback.ts`).

## What already exists

Verified in the repo before designing:

- `SupportedChainId.SOLANA` (`1000000001`) is in `TRADABLE_SUPPORTED_CHAIN_IDS`.
- The SDK already defines WSOL: `WRAPPED_NATIVE_CURRENCIES[SOLANA] = { address: 'So11111111111111111111111111111111111111112', decimals: 9, symbol: 'WSOL' }`.
  Consequently `getIsWrapOrUnwrap` already returns `true` for a SOL/WSOL pair, and
  `TradeFormValidation.WrapUnwrapFlow` already fires — the button renders, it just has no Solana callback behind it.
- Solana is a first-class source chain in wallet state (`useAccountState` returns a `SolanaAccountState`
  when the selected Reown network is Solana).
- Balances work: `fetchSolanaTokenBalances` reads ATAs for SPL and Token-2022; `useSolanaNativeBalance`
  polls native SOL on the same 11s cadence as wagmi's `useBalance`.
- `BlockNumberUpdater` feeds the Solana **slot** into the block-number atom, so `useBlockNumber()` is
  populated on Solana and the `FinalizeTxUpdater` polling loop already ticks there.
- `getExplorerLink` already routes Solana to the Solana Explorer.
- `@solana/web3.js` (1.98.4), `@solana/spl-token` (0.4.14) and `@reown/appkit-adapter-solana` (1.8.19)
  are already dependencies.
- Everything Solana is gated behind `IS_SOLANA_ENABLED` (a localStorage flag), so this feature inherits
  that gate for free — Solana is not reachable as a source chain without it.

`getDefaultTradeRawState(SOLANA)` already defaults to WSOL → USDC (by address, since Solana is non-EVM),
so WSOL is reachable as input today.

## The one hard platform constraint

On Solana a WSOL balance *is* lamports held inside the owner's Associated Token Account. There is no
`withdraw(amount)` equivalent to WETH's. The only way to convert WSOL back to SOL is
`closeAccount`, which returns the **entire** account balance plus the rent-exempt reserve and
deallocates the account.

**Decision: exact-amount unwrap via close + re-wrap in a single transaction.** Close the ATA, then —
when a remainder exists — re-create it and re-wrap the remainder in the same transaction. The user
unwraps exactly the amount they typed, so there is no UX divergence from EVM. The rent-exempt reserve
(2,039,280 lamports) is refunded by the close and re-paid by the re-creation, so the net SOL delta is
`+amount − fee`.

Rejected alternatives:

- **Unwrap-all only** (what the `0xjkrdev/solana-wrapper` reference does — its unwrap ignores the input
  amount entirely). Would require locking the amount field to the full balance so the displayed number
  does not lie, which diverges from the EVM flow.
- **Temp-account partial unwrap** (create account with seed → SPL transfer → close). Extra instructions
  and rent churn with no benefit over close + re-wrap.

## Architecture

### Chain dispatch at the hook boundary

`useWrapNativeFlow` keeps its existing responsibility — the `ON_BEFORE_WRAP_UNWRAP` widget-hook gate,
then delegate to a callback — and gains a second callback source:

```ts
const evmCallback = useWrapNativeCallback(state?.inputCurrencyAmount)          // existing, unchanged
const solanaCallback = useSolanaWrapNativeCallback(state?.inputCurrencyAmount) // new
const wrapCallback = solanaCallback ?? evmCallback
```

`useSolanaWrapNativeCallback` returns `null` unless `isSolanaChain(chainId)`, so EVM behaviour is
unchanged. Everything downstream of the button is already chain-agnostic and is reused as-is:
`tradeButtonsMap`, `WrapNativeModal`, `wrapNativeStateAtom`, `useWrapNativeScreenState`,
`getWrapDescription` (its copy comes from `getChainCurrencySymbols(SOLANA)` → "Wrap X SOL to WSOL").

The only consumer of the return value is `wrapNativeFlow(): Promise<unknown>` in
`tradeFormValidation/types.ts`, so returning a base58 signature instead of a viem `0x` hash ripples
nowhere. `wrapUnwrapCallback`'s own `{ hash: Hash }` signature is left alone.

### New files

Under `apps/cowswap-frontend/src/modules/trade/services/wrapNativeSolana/`:

| File | Responsibility |
| --- | --- |
| `buildWrapSolInstructions.ts` | Pure. `(owner, lamports) => TransactionInstruction[]` |
| `buildUnwrapSolInstructions.ts` | Pure. `(owner, lamports, wsolBalance) => TransactionInstruction[]` |
| `solanaWrapUnwrapCallback.ts` | Orchestration: modal, analytics, send, `addTransaction`. Mirrors `wrapUnwrapCallback` |
| `useSolanaWrapNativeCallback.ts` | Context assembly. Mirrors `useWrapNativeContext` |

And `libs/wallet/src/api/hooks/useSolanaWalletProvider.ts`, wrapping
`useAppKitProvider<Provider>('solana')` from `@reown/appkit/react`, exported from `libs/wallet`
alongside `useSolanaNativeBalance`.

## Transaction construction

WSOL is a classic SPL mint, so `TOKEN_PROGRAM_ID` throughout — no Token-2022 branch. `WSOL_MINT` is
derived from `WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA].address` rather than hardcoded, so it
stays in sync with the SDK.

### Wrap (SOL → WSOL)

The **idempotent** ATA-creation instruction avoids a pre-flight `getAccountInfo` round-trip and the
race where the account appears between the check and the send:

```ts
const ata = getAssociatedTokenAddressSync(WSOL_MINT, owner, false, TOKEN_PROGRAM_ID)

;[
  createAssociatedTokenAccountIdempotentInstruction(owner, ata, owner, WSOL_MINT),
  SystemProgram.transfer({ fromPubkey: owner, toPubkey: ata, lamports }),
  createSyncNativeInstruction(ata),
]
```

`syncNative` is required: the `SystemProgram.transfer` moves lamports into the account but does not
update the SPL token amount field.

### Unwrap (WSOL → SOL)

```ts
const ix = [createCloseAccountInstruction(ata, owner, owner)]
const remainder = wsolBalance - lamports

if (remainder > 0n) {
  ix.push(
    createAssociatedTokenAccountIdempotentInstruction(owner, ata, owner, WSOL_MINT),
    SystemProgram.transfer({ fromPubkey: owner, toPubkey: ata, lamports: remainder }),
    createSyncNativeInstruction(ata),
  )
}
```

Solana executes instructions sequentially within a transaction, so closing and re-creating the same
address in one transaction is valid.

The builder itself is pure and takes `wsolBalance` as an argument. `solanaWrapUnwrapCallback` reads that
value fresh from the chain via `connection.getTokenAccountBalance(ata)` immediately before building, not
from the balances atom — a stale poll would otherwise produce a wrong remainder and silently unwrap the
wrong amount. If `lamports > wsolBalance` the builder throws before anything is signed.

### Assembly and send

Reown's provider does **not** populate `recentBlockhash` or `feePayer` — verified in
`WalletStandardProvider.sendTransaction`, which is just `signTransaction` followed by
`connection.sendRawTransaction`. So the transaction is built fully on our side:

```ts
const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
const tx = new Transaction({ feePayer: owner, blockhash, lastValidBlockHeight }).add(...ix)
const signature = await provider.sendTransaction(tx, connection)
```

`sendTransaction` is preferred over `signAndSendTransaction` because it requires only the
`SolanaSignTransaction` wallet-standard feature, whereas `signAndSendTransaction` additionally requires
`SolanaSignAndSendTransaction`, which not every wallet exposes (Reown throws when it is missing).

## Transaction tracking

The Solana transaction goes into the existing `enhancedTransactions` store so it appears in the pending
activity list with a Solana Explorer link and a confirmation snackbar, like an EVM wrap.

1. **`legacy/state/enhancedTransactions/reducer.ts`** — add `HashType.SOLANA_TX`. Change the
   `transactionHash` assignment from `hashType === HashType.ETHEREUM_TX ? hash : null` to
   `hashType === HashType.GNOSIS_SAFE_TX ? null : hash`, so Solana signatures land in `transactionHash`.
   (Behaviour for the two existing hash types is unchanged.)

2. **`useTransactionAdder`** — when `isSolanaChain(chainId)`, skip the wagmi `getTransactionCount` call
   (Solana has no nonce) and tag the transaction `HashType.SOLANA_TX` with `nonce: 0`. The nonce field is
   required by `AddTransactionParams` but is never read on the Solana path — only
   `checkOnChainTransaction`'s replacement detection uses it. Solana transactions are stored under
   chainId `1000000001`, so they cannot pollute EVM nonce bookkeeping.
   `solanaWrapUnwrapCallback` passes `data: { lastValidBlockHeight }` through to the store for the
   expiry check below; `data` is already an untyped passthrough field on `AddTransactionParams`.

3. **`usePendingTransactionsContext`** — add `solanaConnection: Connection | undefined` (from
   `useAppKitConnection`) to `CheckEthereumTransactions`, and guard the nonce fetch behind the same
   chain check. The existing `if (!lastBlockNumber || !account || !hasPendingTxs) return null` guard
   already passes on Solana because slots populate the block-number atom. The
   `CheckEthereumTransactions` type name is left as-is; renaming it is unrelated churn.

4. **`FinalizeTxUpdater`** — add a third branch:

   ```ts
   if (transaction.hashType === HashType.GNOSIS_SAFE_TX) return checkSafeTransaction(transaction, params)
   if (transaction.hashType === HashType.SOLANA_TX) return checkSolanaTransaction(transaction, params)
   return checkOnChainTransaction(transaction, params)
   ```

5. **`checkSolanaTransaction`** (new, in `FinalizeTxUpdater/services/`) polls
   `connection.getSignatureStatuses([signature])`:

   - `err` present → `finalizeTransaction` with `status: 'reverted'` (the reducer then sets
     `errorMessage`).
   - `confirmationStatus` is `confirmed` or `finalized` → `finalizeTransaction` with `status: 'success'`.
   - status `null` → if `getBlockHeight() > lastValidBlockHeight` the blockhash has expired and the
     transaction can never land, so finalize as failed; otherwise dispatch `checkedTransaction` with the
     current slot and retry on the next tick.

   It returns a `cancel` closure (backed by an `isCancelled` flag) to match the contract the other two
   checkers use.

   Without the expiry check a dropped transaction would sit pending forever, since `getSignatureStatuses`
   returns `null` indistinguishably for "not yet landed" and "never landed". This is the Solana analogue
   of `checkOnChainTransaction`'s `NOT_BROADCAST_GRACE_PERIOD_MS` handling.

6. **Synthetic receipt.** `SerializableTransactionReceipt` is filled as
   `{ transactionHash: signature, blockNumber: slot, from: account, to: null, contractAddress: null, blockHash: '', transactionIndex: 0, status }`.
   That is sufficient for the reducer, the activity list, and `OnchainTransactionEventsUpdater`'s
   snackbar — `TransactionContentWithLink` → `getExplorerLink` already handles Solana.

## Reachability and the Max fix

- **`maxAmountSpend` bug.** `MIN_NATIVE_CURRENCY_FOR_GAS` has no `SOLANA` entry, so Solana falls back to
  `MIN_NATIVE_CURRENCY_FOR_GAS_LOW = 10n ** 15n`. That constant assumes 18 decimals; against SOL's 9 it
  reserves 1,000,000 SOL, so "Max" on SOL always resolves to 0. Add:

  ```ts
  // SOL has 9 decimals, unlike the 18-decimal tiers above.
  // Covers the ~5_000 lamport fee plus the 2_039_280 lamport ATA rent-exempt reserve.
  const MIN_NATIVE_CURRENCY_FOR_GAS_SOLANA: bigint = 10n ** 7n // 0.01 SOL
  ```

  A flat per-chain constant keeps `maxAmountSpend` synchronous, which every caller relies on.

- **`defaultFavoriteTokens[SOLANA]`** is currently `{}` — add SOL and WSOL so the pair is selectable
  from the favourites row.

## Error handling

`solanaWrapUnwrapCallback` mirrors the EVM control flow: `openTransactionConfirmationModal` → send →
`addTransaction` → `closeModals`. A user rejection (detected from the wallet-standard error / Reown's
`WalletSignTransactionError`) closes the modal silently and returns `null`; any other failure routes to
`openErrorModal`, which transitions the open modal to its error screen. The `useModals: false` path
rethrows, matching `wrapUnwrapCallback`.

Analytics reuse `CowSwapAnalyticsCategory.WRAP_NATIVE_TOKEN` with the same `Send` / `Sign` / `Reject` /
`Error` actions and the same `operationMessage` label, so Solana wraps aggregate with EVM wraps.

## Testing

- **Instruction builders** carry the bulk of the coverage, since they are pure:
  - wrap composes idempotent-create → transfer → syncNative, in that order;
  - unwrap with `lamports === wsolBalance` emits exactly one close instruction;
  - partial unwrap emits close → idempotent-create → transfer(remainder) → syncNative;
  - `lamports > wsolBalance` throws.
- **`checkSolanaTransaction`** against a stubbed connection: success, `err`, still-pending (dispatches
  `checkedTransaction`), and expired blockhash (finalizes as failed).
- **`useTransactionAdder`**: asserts no nonce fetch happens when the chain is Solana, and that the
  transaction is tagged `HashType.SOLANA_TX`.
- Reown hooks are mocked per-test, the way the existing Solana hooks in `libs/wallet` already do
  (`jest.mock('@reown/appkit-adapter-solana/react', …)`). `testing/reownMock.ts` needs
  `useAppKitProvider` added, since `apps/cowswap-frontend/jest.config.mjs` maps
  `@reown/appkit/react` to it.

## Known risk

The activity-list rendering path (`useActivityDerivedState`, `useCategorizeRecentActivity`, and the
activity card components) is EVM-shaped and has not been audited end-to-end for Solana. If it turns out
to need Solana-specific handling, that is additional scope inside the tracking section — to be reported
rather than silently absorbed.

## Out of scope

- Trading (as opposed to wrapping) on Solana.
- Any change to the EVM wrap path beyond the `?? evmCallback` dispatch.
- Renaming `CheckEthereumTransactions` or otherwise refactoring `enhancedTransactions` beyond the
  additions listed above.
