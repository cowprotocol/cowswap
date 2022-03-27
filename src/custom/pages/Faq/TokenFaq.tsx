import Page, { Content } from 'components/Page'

import { ExternalLinkFaq, Wrapper } from './styled'
import { BackButton } from '.'
import { useToC } from './hooks'
import ToC from './ToC'

export default function TokenFaq() {
  const { toc, faqRef } = useToC()

  return (
    <Wrapper ref={faqRef}>
      <ToC toc={toc} name="Token FAQ" />
      <Page>
        <Content>
          <h2 id="Token">Token</h2>
          <h3 id="does-cowswap-have-a-token">Does CowSwap have a token?</h3>
          <p>
            Yes,{' '}
            <ExternalLinkFaq href="https://etherscan.io/address/0xd057b63f5e69cf1b929b356b579cba08d7688048">
              vCOW
            </ExternalLinkFaq>{' '}
            is the non-transferable governance token that powers the CoW Protocol.
          </p>
          <p>
            At launch the token will be a pure virtual token for governance. This implies that the token will not be
            transferable. The token entitles its holders with voting rights in the CowDAO. It is up to CowDAO to vote on
            whether making the token transferable complies with applicable laws.
          </p>
          <p>
            The token&apos;s main purpose is to govern and curate essential infrastructure components of the CoW
            Protocol ecosystem.
          </p>
          <p>Be cautious, some people may create fake COW tokens, that are not affiliated with this project.</p>
          <p>
            Follow <ExternalLinkFaq href="https://twitter.com/mevprotection">@MEVProtection</ExternalLinkFaq> on Twitter
            to be up to date!
          </p>
          <h3 id="is-there-a-proposal-to-make-vcow-transferable">Is there a proposal to make vCOW transferrable?</h3>
          <p>
            Yes! A CoWmunity member created a{' '}
            <ExternalLinkFaq href="https://forum.cow.fi/t/cip-draft-enable-swapping-of-vcow-to-cow/91/22">
              CoWDAO Proposal
            </ExternalLinkFaq>{' '}
            on the forum.
          </p>
          <h3 id="what-is-the-purpose-of-cow-token">What is the purpose of COW Token?</h3>
          <p>
            The COW token will entitle its holders to voting rights within the CowDAO. The main purpose of CowDAO is to
            govern and curate essential infrastructure components of the CoW Protocol ecosystem, including:
          </p>
          <p>
            System Parameters - CowDAO will be in charge of all system parameters such as the objective function for
            solution scoring and solver slashing conditions.
          </p>
          <p>
            Treasury holdings and Protocol revenue - Allocation of treasury holdings, distribution of Protocol revenue
            and investing into ecosystem projects.
          </p>
          <p>
            Staking - CoW Protocol solvers will be incentivized to compete for providing best solutions by capturing
            value for participation. This could come in the form of trading fees, solution token rewards or both.
            Solvers could be required to stake COW in order to participate in solution submission. CoW Protocol users
            will be able to lock COW tokens for a fee discount on their trades. This gives tangible utility to the
            tokens benefiting all CoW trades.
          </p>
          <p>
            Fees and Rewards - Traders, solvers, frontends, developers and other ecosystem participants should always
            remain sufficiently incentivized to continue contributing and maintaining a robust ecosystem. Incentives
            could come in the form of batch solution rewards, trader incentives, ecosystem grants and more
          </p>
          <h3 id="what-was-the-criteria-for-the-token-airdrop">What was the criteria for the token airdrop?</h3>
          <p>There are 4 categories in which you can qualify for the airdrop:</p>
          <p>
            CoW POAP: Awarded POAPs from the testing sessions, Batch challenges, CowStars or user research sessions. Not
            all are equally valuable. Some that are most special are the ones for our CowStars and User Test
            Participants. Note that we say “awarded” and not “owns”, since we know that there have been secondary
            markets for these POAPS. We only took awardees into consideration.
          </p>
          <p>
            Power Traders: A Power trader is someone who has traded on either Ethereum mainnet (before block 13974427)
            or Gnosis Chain (block 20024195) a minimum of 3 trades, at least 14 days between the 1st and the last trade,
            and for a minimum of 1K total volume. Note that stable to stable coin trades only by factor 0.1
          </p>
          <p>
            Traders: A trader is someone who has traded on either Ethereum mainnet (before block 13974427) or Gnosis
            Chain (block 20024195) at least once for a total of 1K USD or who has done at least 5 trades. Note that
            stable to stable coin trades only by factor 0.1
          </p>
          <p>
            GNO Holders: A GNO holder is someone who held at least 0.1 GNO on either Ethereum mainnet (before block
            13974427) or Gnosis Chain (block 20024195). They were eligible for holding GNO on Mainnet and/or
            GnosisChain, and for running GBC validators. In addition, all the following LP token holders were accounted
            for: Balancer v2 (mainnet), Uniswap v3 (mainnet), Honeyswap (gnosischain), Symetric (gnosischain), Sushiswap
            (gnosischain), Elk (gnosischain), Swapr (Gnosischain)
          </p>
          <BackButton />
        </Content>
      </Page>
    </Wrapper>
  )
}
