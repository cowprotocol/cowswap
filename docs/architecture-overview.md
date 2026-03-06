# CoW Swap Architecture

Owner: frontend platform maintainers
Status: Reference (visual)
Last reviewed: 2026-03-05
Normative rules: [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md)

> This documentation is part of the broader https://github.com/cowprotocol/cowswap-diagrams

Overall architecture of the project

![Overall Architecture](./architecture-overview.drawio.svg)

## Modules

### Core modules

- wallet
- transactions
- gas
- prices

### Trading modules

- [trade](../apps/cowswap-frontend/src/modules/trade/docs/trade-module.md)
- swap
- limitOrder
- twap

### Helper trading modules

- cancelOrder
- wrapNative

### Basic components (UI building blocks)

- components
- forms

### UI modules

- account
- notifications
- activity

### appData

- [appData](../apps/cowswap-frontend/src/modules/appData/appData-module.md)
- ~affiliate~ (not used right now)
- [utm](../apps/cowswap-frontend/src/modules/utm/utm-module.md)

### Token modules

- tokens
- tokenLists
- tokenImages
- cowToken

### Other

- misc
