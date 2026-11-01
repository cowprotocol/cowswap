# Issuer dividends

Every issuer passes a stock's dividends on to holders, but in one of three places:

- **In the token price** (`price-accrual`): Ondo, Coinbase and wrapped xStocks. Your balance never changes,
  and each token becomes worth a bit more than one share.
- **In your balance** (`rebase`): xStocks and bStocks. The token price stays close to one share, and your
  balance grows.
- **In your wallet as cash** (`cash-payout`): Reality. The token price stays close to one share, and the
  dividend is paid out separately in stablecoins.

The first two reinvest the dividend, with no payout or airdrop. All three leave the holder with the same value.
But a raw Ondo token and a raw xStocks token of the same stock are not equal units. Comparing them "per token"
is slightly wrong, and gets more wrong with every dividend.

The model of each issuer is `ISSUER_DIVIDEND_MODELS` in `src/entities/asset/model/issuers.ts`.

## Ondo: price accrual

When a dividend is paid, Ondo raises the token's redemption price by the dividend. Ondo's own example:
after a $1.00 dividend, the token is worth the stock price plus $1.00. The holder does nothing and gets the
gain when they sell.

Ondo tracks this as a **shares multiplier**, the number of underlying shares one token stands for. It
starts at 1 and only grows. So:

- **Balance:** constant.
- **Token price:** about stock price × multiplier, a **premium over the stock** that grows with each
  dividend.
- **On the ex-dividend date:** the stock price drops by roughly the dividend, but the token price does
  not. The token-to-stock ratio steps up.

Real figure from Ondo, for NVDAon: token price $219.40, NVIDIA stock price $219.03, a multiplier of about
1.0017. NVIDIA pays almost no dividend, so the premium is tiny. A high-yield stock builds a premium of a
few percent per year.

Where the multiplier is published:

- Ondo's market-data API, field `sharesMultiplier`. It needs an API key.
- The onchain `SyntheticSharesOracle`, which covers only a subset of assets.
- Chainlink price feeds for Ondo tokens, which include the multiplier.

## xStocks: rebasing

xStocks applies the dividend as a **multiplier on balances**: every holder's balance goes up.

- **Balance:** grows at each dividend, without any transfer.
  - On EVM chains, `balanceOf()` already returns the adjusted balance.
  - On Solana and TON, the raw onchain amount stays the same, and wallets show the amount × the multiplier
    stored in the token's metadata.
- **Token price:** stays close to the stock price, because one token stays close to one share.
- **Activation:** a new multiplier takes effect at 00:30 UTC on the day after the ex-dividend date.
  xStocks recommends venues pause trading the token for about 15 minutes before and after, since the
  balance and the fair price change at that instant.

The current and pending multipliers are public:
`https://api.xstocks.fi/api/v2/public/assets/{SYMBOL}/multiplier?network={NETWORK}`.

**Wrapped xStocks (`WNVDAX` and others) are the exception.** A wrapper keeps balances fixed, so the
dividend shows up in its price instead, the same way as Ondo. Our registry has 21 of them: 18 on Arbitrum,
2 on Ink and 1 on Ethereum.

## Coinbase: price accrual

Coinbase tokens on Base (the B20 standard) work like Ondo. A cash dividend, net of withholding tax and a
Coinbase fee, is converted into shares of the stock and raises a **multiplier**: after a dividend it might be
1.02, so one token redeems for 1.02 shares.

- **Balance:** constant.
- **Token price:** about stock price × multiplier, a premium over the stock that grows with each dividend.
- **Stock splits** also go into the multiplier: a 10:1 split drops the token price about 10× and raises the
  multiplier about 10×.

Where the multiplier is published:

- The token contract: `balanceOfUI(account)` returns the raw balance × the multiplier.
- Chainlink total-return feeds for Coinbase tokens, which include the multiplier.

The app doesn't load it yet, so Coinbase shares are estimated from the token price, as for Ondo without an
API key.

## bStocks: rebasing

bStocks (Binance, on BNB Chain) work like xStocks. Dividends, net of the 30% US withholding tax for non-US
holders, are reinvested automatically, and a **multiplier** increases every holder's balance. Stock splits
change balances the same way: a 2-for-1 split doubles the balance and halves the token price.

- **Balance:** grows at each dividend, without any transfer.
- **Token price:** stays close to the stock price.

The app counts a bStocks token as one share. That assumes `balanceOf()` already returns the adjusted
balance, as for xStocks on EVM chains. bStocks don't document this, so it should be checked on a token
contract before relying on equivalent shares.

## Reality: cash payout

Reality (Bitget's protocol, rTokens on Arbitrum) keeps a **clean price**: one token tracks
one share, and dividends never go into the token.

- **Cash dividends** are converted to USDT, net of tax, and paid out separately. Holders don't claim them.
- **Stock dividends** are paid as additional rTokens.
- **Balance:** constant, apart from stock dividends.
- **Token price:** stays close to the stock price. On the ex-dividend date it drops with the stock.

The payout terms depend on the stock, the record date and where the token is held, so not every holder gets
every dividend.

## Worked example

A stock trades at $100 and pays a $1 dividend. On the ex-dividend date it opens at $99. You hold 10
tokens worth $1,000. Reinvesting $1 at $99 buys 1 / 99 ≈ 0.0101 extra shares per share held.

|                             | Ondo                   | xStocks               |
| --------------------------- | ---------------------- | --------------------- |
| Balance before → after      | 10 → **10**            | 10 → **10.101**       |
| Multiplier before → after   | 1 → 1.0101             | 1 → 1.0101            |
| Token price after           | 99 × 1.0101 ≈ **$100** | **≈ $99**             |
| Token price vs stock after  | **+1.01%**             | ≈ 0%                  |
| Position value after        | 10 × $100 = $1,000     | 10.101 × $99 = $1,000 |
| Shares of the stock you own | 10 × 1.0101 = 10.101   | 10.101                |

Both holders own 10.101 shares and $1,000. The Ondo holder has fewer tokens, each worth more. Coinbase
behaves like Ondo, and bStocks like xStocks. A Reality holder keeps 10 tokens worth 10 × $99 = $990, owns
10 shares, and receives the $10 dividend, net of tax, in USDT.

## What it means for the app

- **"% vs stock" for Ondo and Coinbase is not mispricing.** A price-accrual token above the stock price is
  mostly reinvested dividends. The asset page explains this with a hover hint on those rows when they trade
  above the stock. Rebasing and cash-payout rows get a hint at any premium.
- **Ondo's multiplier also tracks stock splits,** so it is not always close to 1: `NFLXon` stands for 10
  shares and `ETHAon` for a third of one. Never assume a token is at least one share.
- **Value a position with the token's own price,** not the stock price. "Balance × stock price" undervalues
  Ondo by the size of its premium. The portfolio and the positions table use per-token prices, falling
  back to the stock price × multiplier when a token has none.
- **"Equivalent shares" is balance × multiplier.** The app loads Ondo's multiplier (`ONDO_API_KEY`), uses 1
  for rebasing xStocks and bStocks and for cash-payout Reality tokens, and reads what a wrapped xStocks token
  redeems for onchain. Without a multiplier, as for Coinbase, it estimates the shares of a price-accrual
  token as token price ÷ stock price.
- **xStocks and bStocks balances change on their own.** A holder sees their balance grow after a dividend
  with no trade in their history. The asset page and the trade widget announce the pause around a pending
  multiplier activation. The pause covers xStocks only: the app knows no activation time for bStocks.
- **Prices and quotes are compared per share.** The token tables and "Best quote" divide a token's price by
  its multiplier, so tokens of every issuer rank on the same unit. Coinbase tokens are the exception until
  their multiplier is loaded: they are compared per token.
- **Reality dividends leave the app's view.** The USDT payout is not part of the token, so a Reality
  position's value drops on the ex-dividend date with the stock, by the dividend the holder was paid.

How the multipliers were wired in is in `.plans/completed/2026-10-23-rwa-dividend-multipliers.md`.

## Sources

- Ondo's explanation and the NVDAon figures: the issuer facts thread in Slack, linked from Linear FE-958
- Ondo market-data API: https://docs.ondo.finance/api-reference/assets/get-market-data-for-an-asset
- Ondo contracts (`SyntheticSharesOracle`): https://docs.ondo.finance/addresses
- xStocks multipliers: https://docs.xstocks.fi/developers/multipliers
- Coinbase tokens and the B20 multiplier: https://docs.base.org/base-chain/asset-issuance/tokenized-stocks-on-base
  and https://www.base.org/blog/b20-tokenized-stocks-on-base
- bStocks: https://www.bstocks.finance/en and https://finst.com/en/learn/articles/what-are-bstocks
- Reality: https://www.bitget.com/academy/reality-rtokens-vs-ondo-tokenized-stocks-us-equity and
  https://www.bitget.com/academy/how-to-receive-dividends-from-tokenized-us-stocks-bitget-2026-guide
