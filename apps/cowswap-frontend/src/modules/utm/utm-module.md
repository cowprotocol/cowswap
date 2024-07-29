# UTM module

See also:

- [CoW Swap Architecture](../../../docs/architecture-overview.md)
- [Broader CoW Swap Architecture](https://github.com/cowprotocol/cowswap-diagrams)

![UTM module](./utm-module.drawio.svg)

## Description

This module adds support for handling UTM codes.

> 📖 For more information on UTM codes, please read:
>
> - [https://agencyanalytics.com/blog/utm-tracking](https://agencyanalytics.com/blog/utm-tracking)
> - [https://support.google.com/analytics/answer/1033863?hl=en#zippy=%2Cin-this-article](https://support.google.com/analytics/answer/1033863?hl=en#zippy=%2Cin-this-article)

## Notion Processes

For creating campagins or collaborations, there's a process:

- [Create UTM Codes for on-chain analytics](https://www.notion.so/cownation/Create-UTM-codes-for-on-chain-analytics-cd1ec4ce33964da48a374c8d17b00913?pvs=4)

# Details

This module will expose two hooks:

- `useUtm()`: Exposes the UTM codes
- `useInitializeUtm()`: Hook that will make sure the UTM codes are intialised bade on the URL parameters
