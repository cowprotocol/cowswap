# appData module

See also:

- [CoW Swap Architecture](../../../docs/architecture-overview.md)
- [Broader CoW Swap Architecture](https://github.com/cowprotocol/cowswap-diagrams)

![appData module](./appData-module.drawio.svg)

## Desciption

This module returns the `appData` metadata, which should be used for attaching additional information to the orders.

This module will facilitate to get this information, both in a object format, and in the hash that should be used in the `app-data` field of new orders.

## App-data project

This module depends on the library https://github.com/cowprotocol/app-data

# Details

This module will expose two hooks:

- `useAppData()`: Exposes the app hash and the document associated to it.
- `useUploadAppData()`: Returns a function which can be invoked when an `appData` should be uploaded. This will be uploaded to IPFS. In case of errors, it will keep re-attempting.
