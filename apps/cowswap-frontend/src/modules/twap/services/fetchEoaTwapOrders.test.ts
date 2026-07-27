import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { fetchEoaTwapOrders } from './fetchEoaTwapOrders'

const EOA = '0x016f34D4f2578c3e9DFfC3f2b811Ba30c0c9e7f3'
const LIVE_ORDER_HASH = '0xf8edb9707569dec76a362bb6bac1909fdf43d5afe70beca3e422ec7b1bbaa237'

describe('fetchEoaTwapOrders', () => {
  it('maps a known EOA TWAP from the live programmatic orders API', async () => {
    const { orders, totalCount } = await fetchEoaTwapOrders(EOA, SupportedChainId.GNOSIS_CHAIN, 100)
    const order = Object.values(orders).find(({ hash }) => hash === LIVE_ORDER_HASH)

    expect(order?.id).toBeTruthy()

    expect({
      order: order
        ? {
            hash: order.hash,
            chainId: order.chainId,
            safeAddress: order.safeAddress,
            resolvedOwner: order.resolvedOwner,
            partOrdersCount: order.partOrdersCount,
            status: order.status,
            order: {
              sellToken: order.order.sellToken,
              buyToken: order.order.buyToken,
              t0: order.order.t0,
              n: order.order.n,
              t: order.order.t,
            },
            executionInfo: order.executionInfo,
          }
        : null,
      totalCount,
    }).toMatchInlineSnapshot(`
      {
        "order": {
          "chainId": 100,
          "executionInfo": {
            "confirmedPartsCount": 2,
            "info": {
              "executedBuyAmount": "678620197252801976",
              "executedFeeAmount": "722702729572645",
              "executedSellAmount": "200000000000000000",
            },
          },
          "hash": "0xf8edb9707569dec76a362bb6bac1909fdf43d5afe70beca3e422ec7b1bbaa237",
          "order": {
            "buyToken": "0x177127622c4a00f3d409b75571e12cb3c8973d3c",
            "n": 2,
            "sellToken": "0xaf204776c7245bf4147c2612bf6e5972ee483701",
            "t": 300,
            "t0": 1757527335,
          },
          "partOrdersCount": 2,
          "resolvedOwner": "0x016f34d4f2578c3e9dffc3f2b811ba30c0c9e7f3",
          "safeAddress": "0x62587918b2f00176646679509217a5a4d1ebbfd5",
          "status": "Fulfilled",
        },
        "totalCount": 13,
      }
    `)
  }, 30_000)
})
