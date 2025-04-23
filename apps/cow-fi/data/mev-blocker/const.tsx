import { Link } from '@/components/Link'
import { Color, ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'
import { CowFiCategory, toCowFiGtmEvent } from 'src/common/analytics/types'

import IMG_LOGO_SAFE from '@cowprotocol/assets/images/logo-safe.svg'
import IMG_LOGO_KARPATKEY from '@cowprotocol/assets/images/logo-karpatkey.svg'
import IMG_LOGO_BLOCKNATIVE from '@cowprotocol/assets/images/logo-blocknative.svg'
import IMG_LOGO_RABBY from '@cowprotocol/assets/images/logo-rabby.svg'
import IMG_LOGO_KEEPKEY from '@cowprotocol/assets/images/logo-keepkey.svg'
import IMG_LOGO_AMBIRE from '@cowprotocol/assets/images/logo-ambire.svg'
import IMG_LOGO_CRYPTO_COM from '@cowprotocol/assets/images/logo-crypto-com.svg'
import IMG_LOGO_UNISWAP from '@cowprotocol/assets/images/logo-uniswap.svg'

import IMAGE_MEVBLOCKER_REVIEW_1 from '@cowprotocol/assets/images/image-mevblocker-review-1.svg'
import IMAGE_MEVBLOCKER_REVIEW_2 from '@cowprotocol/assets/images/image-mevblocker-review-2.svg'
import IMAGE_MEVBLOCKER_REVIEW_3 from '@cowprotocol/assets/images/image-mevblocker-review-3.svg'
import IMAGE_MEVBLOCKER_REVIEW_4 from '@cowprotocol/assets/images/image-mevblocker-review-4.svg'
import IMAGE_MEVBLOCKER_REVIEW_5 from '@cowprotocol/assets/images/image-mevblocker-review-5.svg'
import IMAGE_MEVBLOCKER_REVIEW_6 from '@cowprotocol/assets/images/image-mevblocker-review-6.svg'

import IMAGE_FULLPROTECTION from '@cowprotocol/assets/images/image-fullprotection.svg'
import IMGAGE_FASTFREE from '@cowprotocol/assets/images/image-fastfree.svg'
import IMAGE_PROFIT from '@cowprotocol/assets/images/image-profit.svg'

export const MEV_BLOCKER_LIST = [
  {
    id: 'fullprotection',
    description: 'Protection from frontrunning and sandwich attacks on all types of transactions',
    iconImage: IMAGE_FULLPROTECTION,
    bgColor: Color.cowfi_orange_bright,
    textColor: Color.cowfi_orange_pale,
  },
  {
    id: 'profit',
    description: 'Profit from any backrunning opportunities your transactions create',
    iconImage: IMAGE_PROFIT,
    bgColor: Color.cowfi_peach,
    textColor: Color.cowfi_orange_bright,
  },
  {
    id: 'fastfree',
    description: 'A fast, free, censorship-resistant solution open to all searchers and builders',
    iconImage: IMGAGE_FASTFREE,
    bgColor: Color.cowfi_lightBlue4,
    textColor: `var(${UI.COLOR_BLUE_900_PRIMARY})`,
  },
]

export const TRUSTED_BY_CONTENT = [
  {
    href: 'https://uniswap.org/',
    src: IMG_LOGO_UNISWAP,
  },
  {
    href: 'https://rabby.io/',
    src: IMG_LOGO_RABBY,
  },
  {
    href: 'https://crypto.com/',
    src: IMG_LOGO_CRYPTO_COM,
  },
  {
    href: 'https://swap.cow.fi/',
    component: <ProductLogo variant={ProductVariant.CowSwap} theme="dark" />,
  },
  {
    href: 'https://safe.global/',
    src: IMG_LOGO_SAFE,
  },
  {
    href: 'https://www.karpatkey.com/',
    src: IMG_LOGO_KARPATKEY,
  },
  {
    href: 'https://www.keepkey.com/',
    src: IMG_LOGO_KEEPKEY,
  },
  {
    href: 'https://www.ambire.com/',
    src: IMG_LOGO_AMBIRE,
  },
  {
    href: 'https://www.blocknative.com/',
    src: IMG_LOGO_BLOCKNATIVE,
  },
]

export const TESTIMONIAL_LIST = [
  {
    title: 'MEV Blocker fixed my marriage!',
    description: '– Anon',
    bgColor: Color.cowfi_blue_bright,
    textColor: Color.neutral0,
    iconImage: IMAGE_MEVBLOCKER_REVIEW_1,
  },
  {
    title: "If I'd known about MEV Blocker sooner, I could've had a lambo by now",
    description: '– Anon',
    bgColor: Color.cowfi_orange_bright,
    textColor: Color.cowfi_orange_pale,
    iconImage: IMAGE_MEVBLOCKER_REVIEW_2,
  },
  {
    title: 'I was tired of getting rekt, so I started using MEV Blocker',
    description: '– Anon',
    bgColor: Color.neutral100,
    textColor: Color.cowfi_orange_bright,
    iconImage: IMAGE_MEVBLOCKER_REVIEW_3,
  },
  {
    title: 'Robots should work for me, not against me',
    description: '– Anon',
    bgColor: Color.neutral100,
    textColor: Color.cowfi_orange_bright,
    iconImage: IMAGE_MEVBLOCKER_REVIEW_4,
  },
  {
    title: "Nobody's stolen my lunch money since I started using MEV Blocker",
    description: '– Anon',
    bgColor: Color.cowfi_yellow,
    textColor: Color.cowfi_orange_bright,
    iconImage: IMAGE_MEVBLOCKER_REVIEW_5,
  },
  {
    title: 'I used MEV Blocker and I instantly went up a tax bracket',
    description: '– Anon',
    bgColor: Color.cowfi_orange_bright,
    textColor: Color.cowfi_yellow,
    iconImage: IMAGE_MEVBLOCKER_REVIEW_6,
  },
]

export const FAQ_DATA = [
  {
    question: 'What is MEV?',
    answer: (
      <>
        MEV or "maximal extractable value" is a method used by savvy actors (known as "searchers") to exploit your
        transactions at your expense. <br />
        <br />
        Any time you make a transaction that carries value, searchers can "frontrun" it by submitting the exact same
        transaction before you and keeping the profits for themselves. After getting frontrun, you can also get
        "backrun", which is where the searcher cleans up any price slippage your trade caused, again keeping the profits
        for themselves. Both a frontrun and a backrun together are known as a "sandwich attack" — the worst type of MEV.
        <br />
        <br />
        MEV gives you a worse price for your transactions and can cause you to lose out on hundreds or even thousands of
        dollars. MEV Blocker is an easy solution - an RPC endpoint that protects all types of transactions from MEV.
      </>
    ),
  },
  {
    question: 'What is an RPC endpoint?',
    answer: (
      <>
        An RPC (remote procedure call) endpoint is used to connect applications like wallets to the blockchain. <br />
        <br />
        MEV Blocker is a special RPC endpoint that ensures your trades are protected from MEV. It does this by sending
        your transaction to a network of searchers that scan for backrunning opportunities, but cannot frontrun or
        sandwich your trades. <br />
        <br />
        You can add RPC endpoints like MEV Blocker by changing the selected network in your crypto wallet. Some DeFi
        trading apps will also be able to integrate the MEV Blocker RPC endpoint directly — making it a default for all
        users.{' '}
        <Link
          href="https://t.me/+yonLSGoFPRI0YTFk"
          external
          data-click-event={toCowFiGtmEvent({
            category: CowFiCategory.MEVBLOCKER,
            action: 'Click Contact',
          })}
        >
          Get in touch
        </Link>{' '}
        if you're interested in doing this!
      </>
    ),
  },
  {
    question: 'What kinds of MEV does MEV Blocker protect from?',
    answer: (
      <>
        MEV blocker protects from most kinds of frontrunning, but especially from trade sandwiching, which is when a
        searcher trades just before and just after your transaction to make a profit.
      </>
    ),
  },
  {
    question: 'How does MEV Blocker RPC give you a rebate and when?',
    answer: (
      <>
        MEV Blocker also lets you benefit from backrunning. It does this by allowing searchers to "bid" in an auction to
        win the right to backrun your trade. When this happens, users of MEV Blocker receive 90% of the profit their
        backrunning opportunity creates (compared with 0% when not using MEV Blocker). The rebate is paid to the user
        that sent the transaction (tx.origin), immediately in the same block.
        <br />
        <br />
        In return for benefitting from backrunning your trade, these searchers are not allowed to frontrun or sandwich
        you — thus protecting you from the worst types of MEV.
      </>
    ),
  },
  {
    question: 'When and where should I use MEV Blocker?',
    answer: (
      <>
        You should use MEV Blocker as often as possible!
        <br />
        <br />
        While some DEXs like{' '}
        <Link
          href="https://swap.cow.fi/"
          external
          data-click-event={toCowFiGtmEvent({
            category: CowFiCategory.MEVBLOCKER,
            action: 'Click CoW Swap',
          })}
        >
          CoW Swap
        </Link>{' '}
        offer MEV protection for your DeFi trades, most DeFi venues and NFT marketplaces do not provide any type of MEV
        protection.
        <br />
        <br />
        This is where MEV Blocker comes in: any user or dApp can implement it and it protects all types of transactions
        from MEV.
        <br />
        <br />
        See a chance to mint the next Cryptopunks but don't want anyone to snatch the opportunity from you? Use MEV
        Blocker.
        <br />
        <br />
        Want to trade directly on an AMM that doesn't protect you from MEV? Use MEV Blocker.
        <br />
        <br />
        And more!
      </>
    ),
  },
  {
    question: 'How do I install MEV Blocker?',
    answer: (
      <>
        To use MEV Blocker, you will need to add the MEV Blocker RPC endpoint to your wallet. You can do that easily by
        following the instructions{' '}
        <Link
          href="#rpc"
          data-click-event={toCowFiGtmEvent({
            category: CowFiCategory.MEVBLOCKER,
            action: 'Click RPC',
          })}
        >
          here
        </Link>
        . (Note that once your MEV Blocker is added to your wallet, you might need to check that it is your selected
        network from time to time.)
        <br />
        <br />
        If your wallet does not support adding custom RPC endpoints, you may have to contact your wallet developer to
        get MEV Blocker included as a supported RPC.
      </>
    ),
  },
  {
    question: 'How does MEV Blocker work?',
    answer: (
      <>
        MEV Blocker facilitates an auction between a network of "searchers" who are given the opportunity to backrun
        your transactions. In return, they protect you from frontrunning and sandwich attacks - the nasty types of MEV
        that exploit Ethereum users every day.
        <br />
        <br />
        When searchers submit winning bids through the orderflow auction, MEV Blocker sends the full amount of the bid
        to users and validators at a 90/10 split. Validators keep the 10% as a reward, and users pocket the other 90% as
        profit they'd miss out on if they weren't using MEV Blocker.
        <br />
        <br />
        As long as you have MEV Blocker set as the RPC in your wallet (as if it were another network), you are protected
        from frontrunning and sandwiching when using any Ethereum dApp. And the profit share from backrunning is
        deposited automatically into your wallet.
      </>
    ),
  },
  {
    question: 'Which block builders does MEV Blocker submit to?',
    answer: (
      <>
        MEV Blocker submits to all major block builders, including Builder0x69, f1b, Flashbots, rsync builder, Titan
        Builder, Gambit labs and Beaver Build.
      </>
    ),
  },
  {
    question: 'Does this RPC offer revert protection?',
    answer: (
      <>
        No, this RPC focuses on fast execution, however, we are offering another endpoint which offers revert
        protection.
        <br />
        <br />
        This separate endpoint focuses on providing revert protection first, at the expense of possibly slower inclusion
        time. You can use this second endpoint by using{' '}
        <Link
          href="https://rpc.mevblocker.io/noreverts"
          external
          data-click-event={toCowFiGtmEvent({
            category: CowFiCategory.MEVBLOCKER,
            action: 'Click No Reverts',
          })}
        >
          https://rpc.mevblocker.io/noreverts
        </Link>{' '}
        as the url instead.
      </>
    ),
  },
  {
    question: 'Does this RPC offer a secure & private RPC endpoint?',
    answer: (
      <>
        Yes! if you want your transactions to be completely private, and you don't care about the refund, you need to
        connect to the following endpoint:{' '}
        <Link
          href="https://rpc.mevblocker.io/norefunds"
          external
          data-click-event={toCowFiGtmEvent({
            category: CowFiCategory.MEVBLOCKER,
            action: 'Click No Refunds',
          })}
        >
          https://rpc.mevblocker.io/norefunds
        </Link>{' '}
        as the url instead.
        <br />
        <br />
        This endpoint focuses on privacy for users that want to perform transactions and it will not share TX data over
        WS. It prevents transactions failures (same as /noreverts).
        <br />
        <br />
        Note: This endpoint is intended for sophisticated users who can unstuck transactions themselves.
      </>
    ),
  },
  {
    question: 'While using MEV Blocker RPC, is it safe to ignore slippage control?',
    answer: (
      <>
        NO, you should ALWAYS set slippage control to have multiple protections in place.
        <br />
        <br />
        The goal of RPC is to prevent 99% of sandwiches but no existing solution can provide full 100% protection. Due
        to reorgs/forked blocks 0.1% of transactions might become publicly available before on-chain confirmation.
      </>
    ),
  },
  {
    question: 'Who made MEV Blocker?',
    answer: (
      <>
        MEV Blocker is jointly formulated and maintained by{' '}
        <Link
          href="https://cow.fi/"
          external
          utmContent="mev-blocker-cow-protocol"
          data-click-event={toCowFiGtmEvent({
            category: CowFiCategory.MEVBLOCKER,
            action: 'Click CoW Protocol',
          })}
        >
          CoW Protocol
        </Link>
        ,{' '}
        <Link
          href="https://agnostic-relay.net/"
          external
          utmContent="mev-blocker-agnostic"
          data-click-event={toCowFiGtmEvent({
            category: CowFiCategory.MEVBLOCKER,
            action: 'Click Agnostic',
          })}
        >
          Agnostic Relay
        </Link>
        , and{' '}
        <Link
          href="https://beaverbuild.org/"
          external
          utmContent="mev-blocker-beaver"
          data-click-event={toCowFiGtmEvent({
            category: CowFiCategory.MEVBLOCKER,
            action: 'Click Beaver',
          })}
        >
          Beaver Build
        </Link>
        . It is open to all searchers and block builders.
        <br />
        <br />
        This collaboration represents our commitment to providing a trusted, neutral product available to all Ethereum
        users. We invite additional contributors - please get in touch if you're interested in supporting the project.
      </>
    ),
  },
  {
    question: 'How do I participate as a searcher?',
    answer: (
      <>
        If you are a searcher that is interested in collaborating with MEV Blocker RPC, please check out the{' '}
        <Link
          href="https://docs.cow.fi/mevblocker"
          external
          utmContent="mev-blocker-docs"
          data-click-event={toCowFiGtmEvent({
            category: CowFiCategory.MEVBLOCKER,
            action: 'Click Docs',
          })}
        >
          documentation
        </Link>{' '}
        for searchers and{' '}
        <Link
          href="https://t.me/+yonLSGoFPRI0YTFk"
          external
          utmContent="mev-blocker-telegram"
          data-click-event={toCowFiGtmEvent({
            category: CowFiCategory.MEVBLOCKER,
            action: 'Click Telegram',
          })}
        >
          join the community
        </Link>
        .
      </>
    ),
  },
  {
    question: 'How can I get in touch?',
    answer: (
      <>
        If you are a searcher or a dApp developer, or if you're a user that has questions about MEV Blocker, please
        reach out via{' '}
        <Link
          href="https://t.me/+yonLSGoFPRI0YTFk"
          external
          data-click-event={toCowFiGtmEvent({
            category: CowFiCategory.MEVBLOCKER,
            action: 'Click Telegram',
          })}
        >
          Telegram
        </Link>
        .
      </>
    ),
  },
]
