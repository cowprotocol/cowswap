import { Page, Content } from 'modules/application/pure/Page'
import { LinkScrollable } from 'components/Link'
import { Link } from 'react-router-dom'

import { ExternalLinkFaq, Wrapper } from './styled'
import { Footer } from '.'
import { useToC } from './hooks'
import ToC from './ToC'
import { FaqMenu } from './Menu'
import { Routes } from 'constants/routes'
import { BARN_URL, PRODUCTION_URL } from 'constants/index'
import { PageTitle } from 'modules/application/containers/PageTitle'

// AmplitudeAnalytics
import { PageName } from 'components/AmplitudeAnalytics/constants'
import { Trace } from 'components/AmplitudeAnalytics/Trace'

const PROD = `https://${PRODUCTION_URL}`
const BARN = `https://${BARN_URL}`

export default function AffiliateFaq() {
  const { toc, faqRef } = useToC()

  return (
    <Trace page={PageName.FAQ_AFFILIATE_PAGE} shouldLogImpression>
      <Wrapper ref={faqRef}>
        <PageTitle title="Affiliate FAQ" />
        <FaqMenu />
        <Page>
          <ToC toc={toc} name="Affiliate Program FAQ" />
          <Content>
            <h2 id="affiliate">Affiliate program</h2>

            <h3 id="what-is-the-account-page">What is the Account page?</h3>

            <p>
              The <Link to={Routes.ACCOUNT}>account</Link> page is where you can see your number of trades and volume,
              generated with the wallet you&amp;re connected with.
            </p>

            <p>
              Additionally, you will be able to get your own referral/affiliate link, so you can share it with others,
              and if you do so, you will also be able to see the number of trades and volume that your referral link
              gets credited from the users who followed your link and interacted with the DEX.
            </p>

            <h3 id="in-which-networks-it-is-available">In which networks is it available?</h3>

            <p>At this time, the affiliate program only works for Ethereum Mainnet.</p>

            <h3 id="are-there-any-rewards-for-sharing-the-referral-link">
              Are there any rewards for sharing the referral link?
            </h3>

            <p>
              The affiliate program will initially run as a trial and therefore there are currently no announced
              rewards. The tracking, however, has already started.
            </p>

            <p>
              CoW Swap&apos;s positive network effect scales exponentially with more people using it, therefore, the
              affiliate program aims to acknowledge which users are contributing more to the success of the protocol.{' '}
            </p>

            <p>
              We now briefly explain CoW Swap’s positive network effect. CoW Swap&apos;s name comes from the economic
              phenomenon &quot;Coincidence of Wants&quot;, where users&apos; orders can be matched with each other to
              obtain better prices. When the protocol finds a CoW, trades are directly settled among traders, which
              allows saving on slippage, gas, and LP fees. The network effect of CoWs increases alongside with the
              number of traders using the protocol&#59; the more users we have sending orders to the protocol, the
              better the prices and gas savings the protocol is able to offer. Our new CoW-filiate program is aiming to
              increase this positive network effect.
            </p>

            <h3 id="who-can-share-the-referral-link">Who can share the referral link?</h3>

            <p>
              Everyone can share a link, you only need a valid Ethereum wallet address to create your own personal link.
            </p>

            <h3 id="who-can-follow-the-referral-link">Who can follow the referral link?</h3>

            <p>
              Everyone! Please share the excitement for the CoW Swap protocol & dapp. It would really make a difference
              for the CoWmunity if you share it with your friends, Twitter/YouTube followers, or anyone that would be
              interested.
            </p>

            <p>
              Share your referral link with all your friends if you think they can be interested in the qualities CoW
              Swap has to offer. These qualities range from ETH-less trading experience, MEV protection, no fees for
              failed transactions, and more.{' '}
              <span role="img" aria-label="cow">
                🐮
              </span>
            </p>

            <p>
              Note that trades and volume will only be credited to your wallet if the user has not traded in CoW Swap
              with that address before, and their first trade is done after following your link.
            </p>

            <h3 id="what-is-the-source-of-truth-for-accounting-trade-volume">
              What is the source of truth for accounting trade volume?
            </h3>

            <p>
              The referral program fetches data from Dune, and therefore, the USD value is taken from the information
              available in Dune under price feed. If the token is not in the Dune price feed, then volume will not be
              counted.
            </p>

            <h3 id="why-do-not-i-see-any-referral-trades-in-my-account-page">
              I shared my referral with a friend, who then also traded. Why do I not see any referral trades in my
              account page?
            </h3>

            <p>There could be a few reasons for this:</p>
            <ol>
              <li>
                Your friend was trading tokens that do not have a price feed available (see FAQ entry{' '}
                <LinkScrollable
                  href={'/faq/affiliate#why-is-my-total-trade-referral-trade-volume-smaller-than-the-real-volume'}
                >
                  Why is the volume smaller than the real volume?
                </LinkScrollable>
                ).
              </li>
              <li>The data has not yet propagated from the chain to our backend.</li>
              <li>
                Your friend had already traded with that account, which does not count towards referral volume (see FAQ
                entry{' '}
                <LinkScrollable href={'/faq/affiliate#who-can-follow-the-referral-link'}>
                  Who can follow the referral link?
                </LinkScrollable>
                ).
              </li>
            </ol>

            <h3 id="why-is-my-total-trade-referral-trade-volume-smaller-than-the-real-volume">
              Why is my total trade/referral trade volume smaller than the real volume?
            </h3>

            <p>
              Some tokens might not yet have a proper price feed linking them to a USD estimation at the date/time when
              your trade was executed. When that happens the trade volume is set to 0. Thus, your total volume can be
              smaller, or even be shown as 0 (see FAQ entry{' '}
              <LinkScrollable href={'/faq/affiliate#what-is-the-source-of-truth-for-accounting-trade-volume'}>
                What is the source of truth for accounting trade volume?
              </LinkScrollable>
              ).
            </p>

            <h3 id="why-do-i-see-more-trades">
              Why do I see more trades and referrals in my account page than I actually see in the activity list?
            </h3>

            <p>
              The number of trades on the <Link to={Routes.ACCOUNT}>account</Link> page is calculated based on on-chain
              data.
            </p>
            <p>We have two publicly facing interfaces where both use the same contracts, which are:</p>
            <ul>
              <li>
                The production version:{' '}
                <ExternalLinkFaq href={PROD} target="_blank" rel="noopener noreferrer">
                  {PROD}
                </ExternalLinkFaq>
              </li>
              <li>
                The public test version:{' '}
                <ExternalLinkFaq href={BARN} target="_blank" rel="noopener noreferrer">
                  {BARN}
                </ExternalLinkFaq>
              </li>
            </ul>

            <p>
              Even though both use the same contract, the backend services, solvers and infrastructure are independent.
            </p>

            <p>
              Thus, when accessing{' '}
              <ExternalLinkFaq href={PROD} target="_blank" rel="noopener noreferrer">
                {PROD}
              </ExternalLinkFaq>{' '}
              you will see orders/trades placed only using this interface. The same is true for orders/trades placed on{' '}
              <ExternalLinkFaq href={BARN} target="_blank" rel="noopener noreferrer">
                {BARN}
              </ExternalLinkFaq>
              .
            </p>

            <p>If you ever traded on both, you might have more trades than you would expect.</p>

            <p>In the future, the data will be consolidated and this number will match your expectations.</p>

            <Footer />
          </Content>
        </Page>
      </Wrapper>
    </Trace>
  )
}
