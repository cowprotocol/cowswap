# Amounts formatting

The application needs to display amounts of different sizes, from extremely small to extremely large, while maintaining accuracy.

There are two types of amounts:

- token amount: `100 000.54 COW`
- fiat amounts: `≈ $1 946 628.4`

### Feature-flags

`localStorage.setItem('amountsRefactoring', '1')` - to highlight components with formatted tokens and fiat amounts

### Language-sensitive number formatting

The solution uses [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) API for numbers formatting.

### Trailing zeros

All functions and components mentioned in this documents are using `trimTrailingZeros()` function to avoid values with trailing zeros.

Example: `trimTrailingZeros('12.092000') -> 12.092`
Example: `trimTrailingZeros('24.000000') -> 24`

### Precision

The `smart` precision algorithm:

1. When an amount is less than `1`, then precision is `6` (`0.003411`)
2. When an amount is less than `100_000`, then precision is `4` (`2 002.5901`)
3. When an amount is less than `1M`, then precision is `3` (`640 123.012`)
4. When an amount is less than `10M`, then precision is `2` (`2 700 000.08`)
5. When an amount is greater than `10M`, then precision is `3` (`65 200 000.102`)
6. When an amount is greater than `1B`, then precision is `3` AND plus suffix `B` (`12.502B`)
7. When an amount is greater than `1T`, then precision is `3` AND plus suffix `T` adds (`6.2T`)

## Token amounts

Examples:
`<TokenAmount amount={amount} tokenSymbol={amount.currency} />` - looks like `400 DAI`
`<TokenAmount amount={amount} />` - looks like `6 000.11`

The component has `title` attribute and displays the full amount on hover.

The `amount` property has type `FractionLike`. It includes `Fraction`, `Price` and `CurrencyAmount` from `@uniswap/sdk-core`

An amount could be formatted using `formatTokenAmount(amount)` function.
Or `formatAmountWithPrecision(amount, precision)` if you need custom precision.

## Fiat amounts

Examples:
`<FiatAmount amount={amount}` - looks like `≈ $2 001.54`

The precision for fiat amounts is always `2`
