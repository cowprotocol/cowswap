import { Page, Title, Content, GdocsListStyle } from '@cow/modules/application/pure/Page'
import styled from 'styled-components/macro'
import { Link } from 'react-router-dom'
import { ExternalLink as ExternalLinkTheme } from 'theme'
import { MEV_TOTAL, FLASHBOTS_LINK } from 'constants/index'

// Assets
import diagramIMG from 'assets/cow-swap/cowswap-diagram.png'
import gaslessIMG from 'assets/cow-swap/gasless.png'
import mevIMG from 'assets/cow-swap/mev.png'
import { Routes } from '@cow/constants/routes'

// AmplitudeAnalytics
import { PageName } from 'components/AmplitudeAnalytics/constants'
import { Trace } from 'components/AmplitudeAnalytics/Trace'
import { PageTitle } from '@cow/modules/application/containers/PageTitle'

const ExternalLink = styled(ExternalLinkTheme)``

const Wrapper = styled(Page)`
  ${GdocsListStyle}

  span[role="img"] {
    font-size: 1.8em;
  }

  ${ExternalLink} {
    text-decoration: underline;
    font-weight: 400;
  }
`

export default function About() {
  return (
    <Trace page={PageName.ABOUT_PAGE} shouldLogImpression>
      <Wrapper>
        <PageTitle title="About" />
        <Title>About</Title>

        <Content>
          <p>CoW Swap is the first trading interface built on top of CoW Protocol.</p>
          <p>
            It allows you to buy and sell tokens using gasless orders that are settled peer-to-peer among its users or
            into any on-chain liquidity source while providing MEV protection.
          </p>
          <h2>
            <b>C</b>oincidence <b>o</b>f <b>W</b>ants
          </h2>

          <p>
            <img src={diagramIMG} alt="CoW Swap vs. AMM's" />
          </p>
          <p>
            Every time you and another trader each hold an asset the other wants, your trade is settled directly without
            using an AMM (Automated Market Maker) and therefore without incurring any slippage + fees. Only amounts that
            can&apos;t be settled with other CoW Swap traders are sent to the underlying AMMs.
            <br />
            <br />
            This economic phenomenon is known as <b>Coincidence Of Wants (CoW)</b>.
          </p>

          <h3 id="gasless">Gasless Transactions</h3>
          <p>
            <img src={gaslessIMG} alt="CoW Swap - Gasless Transactions" />
          </p>
          <p>
            Gas costs are accounted for in your sell token already - no gas costs need to be paid! CoW Swap uses an
            off-chain design for submitting trades:
          </p>
          <ol>
            <li>
              <p>You sign a trade message which is submitted to CoW Swap’s off-chain service</p>
            </li>
            <li>
              <p>CoW Swap&apos;s off-chain service optimizes your trade&apos;s execution by considering:</p>
              <ul>
                <li>
                  <p>Coincidence Of Wants</p>
                </li>
                <li>Best execution route among AMMs (for the remaining amount)</li>
                <li>
                  <p>Optimized gas price for inclusion in the next mined block</p>
                </li>
              </ul>
            </li>
            <li>
              <p>Your trade is submitted and settled on-chain</p>
            </li>
          </ol>
          <p>
            Why? This helps you to save on gas, slippage &amp; protocol fees. You might receive a larger amount than
            anticipated{' '}
            <span role="img" aria-label="happy cow face">
              🐮
            </span>
          </p>

          <h3 id="mev">Maximum Extractable Value (MEV)</h3>
          <p>
            <img src={mevIMG} alt="CoW Swap - Maximum Extractable Value" />
          </p>
          <p>
            Heard about Maximum Extractable Value yet? It&apos;s scary. To date more than{' '}
            <ExternalLink href={FLASHBOTS_LINK}>USD {MEV_TOTAL}</ExternalLink> in value has been extracted from users by
            bots frontrunning transactions, exploiting the slippage users allow in a trade.
            <br />
            <br />
            CoW Swap is the first DEX Aggregator offering some protection against it: COWs enable tight slippages and
            can even avoid settlement on AMMs altogether.
          </p>

          <h3>Do you want to know more?</h3>
          <p>
            Head over to the <Link to={Routes.FAQ}>FAQ</Link>
          </p>
        </Content>
      </Wrapper>
    </Trace>
  )
}
