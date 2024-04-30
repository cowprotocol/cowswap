import { LinkWithUtm } from 'modules/utm'
import { CONFIG } from '@/const/meta'
import { IMAGE_PATH } from '@/const/paths'

const DAO_LOGOS_PATH = IMAGE_PATH + '/dao-logos/'

export const DAO_CONTENT = {
  slides: [
    {
      image: `${IMAGE_PATH}/dao-enjoy-surplus.svg`,
      title: 'Enjoy more price surplus than anywhere else',
      description:
        'Every DEX aggregator will tell you they have the best prices, but at the end of the day, CoW Swap does everything they do and then some. With peer-to-peer order matching, gas optimization, and MEV protection, CoW Swap improves your quoted price and forwards the surplus back to you.',
    },
    {
      image: `${IMAGE_PATH}/dao-custom-tailor-orders.svg`,
      title: 'Stop scrambling for signatures',
      description:
        "Tired of rushing to sign the multi-sig? Eyes glazed over from staring at candlesticks? CoW Swap automatically adjusts your trade's execution path to fill your order at the best possible price, every time.",
    },
    {
      image: `${IMAGE_PATH}/dao-vote-once.svg`,
      title: 'Forget about voting twice ',
      description:
        "Milkman orders from CoW Swap let your DAO approve trades based on dynamic price feeds rather than fixed prices, so you don't have to re-vote if the market moves significantly.",
    },
    {
      image: `${IMAGE_PATH}/dao-outsmart-bots.svg`,
      title: 'Outsmart the bots',
      description:
        "CoW Swap offers MEV protection that is one order of magnitude better than any other exchange. Solvers execute trades on your behalf so you're never exposed to on-chain attacks – and even when trade details are announced weeks in advance, CoW Swap stands between you and the MEV bots.",
    },
    {
      image: `${IMAGE_PATH}/dao-manage-price-impact.svg`,
      title: 'Manage price impact',
      description:
        "Your trades move markets… but being the biggest isn't always the best. CoW Swap spreads your order across multiple liquidity pools so you make as little of a splash as possible.",
    },
    {
      image: `${IMAGE_PATH}/dao-do-more.svg`,
      title: 'Do anything you can imagine',
      description:
        'With CoW Swap you can customize rules for your orders above and beyond traditional settings. Want to trigger a trade only when a wallet has n funds in it? Want to schedule recurring trades? CoW Swap lets you do all that and more in just a few clicks.',
    },
  ],

  orderTypes: [
    {
      icon: `${IMAGE_PATH}/icon-milkman.svg`,
      title: 'Milkman Orders',
      description: (
        <>
          Ensure your trades are always close to the real-time market price thanks to the{' '}
          <LinkWithUtm
            href="https://github.com/charlesndalton/milkman"
            defaultUtm={{ ...CONFIG.utm, utmContent: 'daos-page' }}
            passHref
          >
            <a target="_blank" rel="nofollow noreferrer">
              Milkman bot
            </a>
          </LinkWithUtm>
          . Set the maximum deviation you&apos;ll accept, and Milkman will do the rest.
        </>
      ),
    },
    {
      icon: `${IMAGE_PATH}/icon-twap-orders.svg`,
      title: 'TWAP Orders',
      description:
        'Time-weighted average price orders allow you to spread your trade out over time, averaging out your trading price, minimizing price impact, and allowing for lower slippage.',
    },
    {
      icon: `${IMAGE_PATH}/icon-limit-orders.svg`,
      title: 'Limit Orders',
      description:
        "CoW Swap's surplus-capturing limit orders allow you to set a price and sit back while your order gets filled over time - perfect for token buybacks and other large trades.",
    },
    {
      icon: `${IMAGE_PATH}/icon-price-walls.svg`,
      title: 'Price Walls',
      description:
        'Pick an asset, define a threshold price, and CoW Swap will automatically sell above the threshold, and buy below it.',
    },
    {
      icon: `${IMAGE_PATH}/icon-basket-sells.svg`,
      title: 'Basket Sells',
      description: (
        <>
          <LinkWithUtm href="https://dump.services/" defaultUtm={{ ...CONFIG.utm, utmContent: 'daos-page' }} passHref>
            <a target="_blank" rel="nofollow noreferrer">
              Dump.services
            </a>
          </LinkWithUtm>
          , a collaboration between CoW Swap and Yearn, allows DAOs and traders to sell multiple tokens in a single
          transaction.
        </>
      ),
    },
    {
      icon: `${IMAGE_PATH}/icon-logic.svg`,
      title: 'Place Your Logic Here',
      description:
        'ERC-1271 Smart Orders and CoW Hooks allow you to define your own complex trading logic; if you can think it, you can trade it.',
    },
  ],
  trustedDAOs: [
    {
      icon: `${DAO_LOGOS_PATH}aave.svg`,
      title: 'Aave',
      description: 'Aave DAO used CoW Swap to swap over $4 million directly into Balancer liquidity pool',
      link: 'https://medium.com/@cow-protocol/aave-trade-breakdown-e17a7563d7ba',
      volume: '$4 million',
    },
    {
      icon: `${DAO_LOGOS_PATH}nexus.svg`,
      title: 'Nexus Mutual',
      description:
        'In the largest DAO trade ever, Nexus Mutual relied on CoW Swap to trade 14,400 ETH for the rETH liquid staking token',
      link: 'https://medium.com/@cow-protocol/nexus-mutual-trade-breakdown-4aacc6a94be8',
      volume: '14,400 ETH',
    },
    {
      icon: `${DAO_LOGOS_PATH}ens.svg`,
      title: 'ENS',
      description: 'ENS DAO traded a whopping 10,000 of ETH ($16.5 million dollars) for USDC through CoW Swap',
      link: 'https://medium.com/@cow-protocol/ens-trade-breakdown-a8eb00ddd8c0',
      volume: '10,000 ETH',
    },
    { icon: `${DAO_LOGOS_PATH}karpatkey.svg`, title: 'Karpatkey', link: 'https://www.karpatkey.com/' },
    { icon: `${DAO_LOGOS_PATH}maker.svg`, title: 'MakerDAO', link: 'https://makerdao.com/' },
    { icon: `${DAO_LOGOS_PATH}lido.svg`, title: 'Lido', link: 'https://lido.fi/' },
    { icon: `${DAO_LOGOS_PATH}yearn.svg`, title: 'Yearn', link: 'https://yearn.finance/' },
    { icon: `${DAO_LOGOS_PATH}gnosis.svg`, title: 'Gnosis', link: 'https://www.gnosis.io/' },
    { icon: `${DAO_LOGOS_PATH}synthetix.svg`, title: 'Synthetix', link: 'https://synthetix.io/' },
    { icon: `${DAO_LOGOS_PATH}balancer.svg`, title: 'Balancer', link: 'https://balancer.fi/' },
    { icon: `${DAO_LOGOS_PATH}aura.svg`, title: 'Aura', link: 'https://aura.finance/' },
    { icon: `${DAO_LOGOS_PATH}vitadao.svg`, title: 'VitaDAO', link: 'https://www.vitadao.com/' },
    { icon: `${DAO_LOGOS_PATH}polygon.svg`, title: 'Polygon', link: 'https://polygon.technology/' },
    { icon: `${DAO_LOGOS_PATH}pleasrdao.svg`, title: 'PleasrDAO', link: 'https://pleasr.org/' },
    { icon: `${DAO_LOGOS_PATH}olympus.svg`, title: 'Olympus', link: 'https://www.olympusdao.finance/' },
    { icon: `${DAO_LOGOS_PATH}dxdao.svg`, title: 'DxDAO', link: 'https://dxdao.eth.limo/' },
    { icon: `${DAO_LOGOS_PATH}mstables.svg`, title: 'mStables', link: 'https://mstable.org/' },
    { icon: `${DAO_LOGOS_PATH}index.svg`, title: 'Index', link: 'https://indexcoop.com/' },
    { icon: `${DAO_LOGOS_PATH}rhino.svg`, title: 'Rhino', link: 'https://rhino.fi/' },
    { icon: `${DAO_LOGOS_PATH}jpgd.svg`, title: 'JPGD', link: 'https://jpegd.io/' },
    { icon: `${DAO_LOGOS_PATH}benddao.svg`, title: 'BendDAO', link: 'https://www.benddao.xyz/' },
    { icon: `${DAO_LOGOS_PATH}alchemix.svg`, title: 'Alchemix', link: 'https://alchemix.fi/' },
    { icon: `${DAO_LOGOS_PATH}stargate.svg`, title: 'Stargate', link: 'https://stargate.io/' },
    { icon: `${DAO_LOGOS_PATH}shapeshift.svg`, title: 'ShapeShift', link: 'https://shapeshift.com/' },
    { icon: `${DAO_LOGOS_PATH}stakedao.svg`, title: 'StakeDAO', link: 'https://stakedao.org/' },
    { icon: `${DAO_LOGOS_PATH}cryptex.svg`, title: 'Cryptex', link: 'https://cryptex.finance/' },
    { icon: `${DAO_LOGOS_PATH}frax.svg`, title: 'Frax', link: 'https://frax.finance/' },
    { icon: `${DAO_LOGOS_PATH}dfx.svg`, title: 'DFX', link: 'https://dfx.finance/' },
    { icon: `${DAO_LOGOS_PATH}reflexer.svg`, title: 'Reflexer', link: 'https://www.reflexer.finance/' },
    { icon: `${DAO_LOGOS_PATH}citydao.svg`, title: 'CityDAO', link: 'https://citydao.io/' },
    { icon: `${DAO_LOGOS_PATH}threshold.svg`, title: 'Threshold', link: 'https://threshold.network/' },
    { icon: `${DAO_LOGOS_PATH}krausehouse.svg`, title: 'KrauseHouse', link: 'https://krausehouse.ca/' },
    { icon: `${DAO_LOGOS_PATH}tokenlon.svg`, title: 'Tokenlon', link: 'https://tokenlon.im/' },
    { icon: `${DAO_LOGOS_PATH}idle.svg`, title: 'Idle', link: 'https://idle.finance/' },
    { icon: `${DAO_LOGOS_PATH}teller.svg`, title: 'Teller', link: 'https://teller.finance/' },
    { icon: `${DAO_LOGOS_PATH}sherlock.svg`, title: 'Sherlock', link: 'https://sherlock.xyz/' },
    { icon: `${DAO_LOGOS_PATH}badgerdao.svg`, title: 'BadgerDAO', link: 'https://badger.finance/' },
    { icon: `${DAO_LOGOS_PATH}solace.svg`, title: 'Solace', link: 'https://solace.fi/' },
    { icon: `${DAO_LOGOS_PATH}dreamdao.png`, title: 'DreamDAO', link: 'https://dreamdao.io/' },
    { icon: `${DAO_LOGOS_PATH}ondo.svg`, title: 'Ondo', link: 'https://ondo.finance/' },
    { icon: `${DAO_LOGOS_PATH}abracadabra.png`, title: 'Abracadabra', link: 'https://abracadabra.money/' },
    { icon: `${DAO_LOGOS_PATH}aragon.svg`, title: 'Aragorn', link: 'https://aragon.org/' },
  ],
}
