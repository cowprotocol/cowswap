import { Link } from 'react-router-dom'

import { PageWithToC } from 'legacy/components/PageWithToC'

import { PageTitle } from 'modules/application/containers/PageTitle'
import { Page, Content } from 'modules/application/pure/Page'

import { Routes } from 'common/constants/routes'

import { useToC } from './hooks'
import { FaqMenu } from './Menu'
import { ExternalLinkFaq } from './styled'
import ToC from './ToC'

import { Footer } from '.'

export default function TokenFaq() {
  const { toc, faqRef } = useToC()

  return (
    <>
      <PageWithToC ref={faqRef}>
        <PageTitle title="Token FAQ" />
        <FaqMenu />
        <Page>
          <ToC toc={toc} name="Token FAQ" />
          <Content>
            <h2 id="Token">Token</h2>
            <h3 id="does-cowswap-have-a-token">Does CoW Swap & CoW Protocol have a token?</h3>
            <p>
              Yes, CoW DAO originally launched the,{' '}
              <ExternalLinkFaq href="https://etherscan.io/address/0xd057b63f5e69cf1b929b356b579cba08d7688048">
                vCOW
              </ExternalLinkFaq>{' '}
              which is the non-transferable governance token that powers the CoW Protocol, but per{' '}
              <ExternalLinkFaq href="https://snapshot.org/#/cow.eth/proposal/0x7f2d0e26225fec1dd19ae4870532a09014a69f2d973dde0a7b8296d556f221df">
                CIP-5
              </ExternalLinkFaq>{' '}
              the token became transferable and is known as{' '}
              <ExternalLinkFaq href="https://etherscan.io/token/0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab">
                COW
              </ExternalLinkFaq>{' '}
            </p>
            <p>
              At launch the token was a pure virtual token for governance meaning that the token was not transferrable.
              This implies that the token will not be transferable. The token entitles its holders with voting rights in
              the CoW DAO. It was up to CoW DAO to vote on whether making the token transferable complies with
              applicable laws.
            </p>
            <p>
              The token&apos;s main purpose is to govern and curate essential infrastructure components of the CoW
              Protocol ecosystem. Per CIP5, CoW DAO holders decided to enable the swapping of vCOW tokens into COW
              tokens. COW is a standard ERC-20 token which can be transferred and traded freely.
            </p>
            <p>Be cautious, some people may create fake COW tokens, that are not affiliated with this project.</p>
            <p>
              Follow <ExternalLinkFaq href="https://twitter.com/CoWSwap">@CoWSwap</ExternalLinkFaq> on Twitter to be up
              to date!
            </p>

            <h3 id="where-can-you-swap-vcow-tokens-for-the-new-cow-tokens">
              Where can you swap vCOW tokens for the new COW token?
            </h3>
            <p>
              {' '}
              Directly in the CoW Swap UI. Simply click on the <Link to={Routes.ACCOUNT}>account</Link> menu item at the
              top left of the page (desktop) or in the mobile menu. You will then be redirected to the{' '}
              <Link to={Routes.ACCOUNT}>account</Link> page where you can see your total COW and/or vCOW balance. You
              will then be able to convert your vCOW to COW (if applicable).
            </p>

            <h3 id="what-is-the-purpose-of-cow-token">What is the purpose of COW Token?</h3>
            <p>
              The COW token will entitle its holders to voting rights within the CoW DAO. The main purpose of CoW DAO is
              to govern and curate essential infrastructure components of the CoW Protocol ecosystem, including:
            </p>
            <p>
              <ul>
                <li>
                  <strong>System Parameters</strong>: CoW DAO will be in charge of all system parameters such as the
                  objective function for solution scoring and solver slashing conditions.
                </li>
                <li>
                  <strong>Treasury holdings and Protocol revenue</strong>: Allocation of treasury holdings, distribution
                  of Protocol revenue and investing into ecosystem projects.
                </li>
                <li>
                  <strong>Staking</strong>: CoW Protocol solvers will be incentivized to compete for providing best
                  solutions by capturing value for participation. This could come in the form of trading fees, solution
                  token rewards or both. Solvers could be required to stake COW in order to participate in solution
                  submission. CoW Protocol users will be able to lock COW tokens for a fee discount on their trades.
                  This gives tangible utility to the tokens benefiting all CoW trades.
                </li>
                <li>
                  <strong>Fees and Rewards</strong>: Traders, solvers, frontends, developers and other ecosystem
                  participants should always remain sufficiently incentivized to continue contributing and maintaining a
                  robust ecosystem. Incentives could come in the form of batch solution rewards, trader incentives,
                  ecosystem grants and more.
                </li>
              </ul>
            </p>

            <h3 id="what-was-the-criteria-for-the-token-airdrop">What was the criteria for the token airdrop?</h3>
            <p>There are 4 categories in which you can qualify for the airdrop:</p>
            <p>
              <ul>
                <li>
                  <strong>CoW POAP</strong>: Awarded POAPs from the testing sessions, Batch challenges, CoW Stars or
                  user research sessions. Not all are equally valuable. Some that are most special are the ones for our
                  CoW Stars and User Test Participants. Note that we say “awarded” and not “owns”, since we know that
                  there have been secondary markets for these POAPS. We only took awardees into consideration.
                </li>
                <li>
                  <strong>Power Traders</strong>: A Power trader is someone who has traded on either Ethereum mainnet
                  (before block 13974427) or Gnosis Chain (block 20024195) a minimum of 3 trades, at least 14 days
                  between the 1st and the last trade, and for a minimum of 1K total volume. Note that stable to stable
                  coin trades only by factor 0.1.
                </li>
                <li>
                  <strong>Traders</strong>: A trader is someone who has traded on either Ethereum mainnet (before block
                  13974427) or Gnosis Chain (block 20024195) at least once for a total of 1K USD or who has done at
                  least 5 trades. Note that stable to stable coin trades only by factor 0.1.
                </li>
                <li>
                  <strong>GNO Holders</strong>: A GNO holder is someone who held at least 0.1 GNO on either Ethereum
                  mainnet (before block 13974427) or Gnosis Chain (block 20024195). They were eligible for holding GNO
                  on Ethereum mainnet and/or Gnosis Chain, and for running GBC validators. In addition, all the
                  following LP token holders were accounted for: Balancer v2 (Ethereum mainnet), Uniswap v3 (Ethereum
                  mainnet), Honeyswap (Gnosis Chain), Symetric (Gnosis Chain), Sushiswap (Gnosis Chain), Elk (Gnosis
                  Chain), Swapr (Gnosis Chain).
                </li>
              </ul>
            </p>
            <Footer />
          </Content>
        </Page>
      </PageWithToC>
    </>
  )
}
