import { CONFIG } from './meta'

export const GET_QUOTE = `curl '${CONFIG.url.api}/api/v1/quote' \
-H 'Content-Type: application/json' \
-d '{
 "kind": "sell",
 "sellAmountBeforeFee": "10000000000000000000",
 "sellToken": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
 "buyToken": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
 "from": "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
 "receiver": "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
 "appData": "0x0000000000000000000000000000000000000000000000000000000000000000",
 "validTo": 2524608000,
 "partiallyFillable": false
}'`
