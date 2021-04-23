import React from 'react'
import Page, { Title, Content, GdocsListStyle } from 'components/Page'
import styled from 'styled-components'

// Assets
import diagramIMG from 'assets/cow-swap/cowswap-diagram.png'
import gaslessIMG from 'assets/cow-swap/gasless.png'
import mevIMG from 'assets/cow-swap/mev.png'

const Wrapper = styled(Page)`
  ${GdocsListStyle}
`

export default function About() {
  return (
    <Wrapper>
      <Title>About</Title>

      <Content>
        <h2>
          <b>C</b>oincidence <b>O</b>f <b>W</b>ants
        </h2>
        <p>
          <img src={diagramIMG} alt="CowSwap vs. AMM's" />
        </p>
        <p>
          Everytime you and another trader each hold an asset the other wants, your trade is settled directly without
          using an AMM and therefore without incurring any slippage + fees. Only amounts that can’t be settled with
          other CowSwap traders are sent to the underlying AMMs.
          <br />
          <br />
          This economic phenomenon is known as <b>Coincidence Of Wants (COW)</b>.
        </p>

        <h3 id="gas-free">Gas Free Transactions</h3>
        <p>
          <img src={gaslessIMG} alt="CowSwap - Gas Free Transactions" />
        </p>
        <p>
          Gas costs are accounted for in your sell token already - no gas costs need to be paid! CowSwap uses an
          off-chain design for submitting trades:
        </p>
        <ol>
          <li>
            <p>You sign a trade message which is submitted to CowSwap’s off-chain service</p>
          </li>
          <li>
            <p>CowSwap’s off-chain service optimizes your trade’s execution by considering:</p>
            <ul>
              {' '}
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
          anticipated :)
        </p>

        <h3 id="mev">Miner-Extractable Value (MEV)</h3>
        <p>
          <img src={mevIMG} alt="CowSwap - Miner-Extractable Value" />
        </p>
        <p>
          Heard about Maximal Extractable Value yet? It’s scary. To date more than{' '}
          <a href="https://explore.flashbots.net/" target="_blank" rel="noopener noreferrer">
            USD 390M
          </a>{' '}
          in value has been extracted from users by bots frontrunning transactions, exploiting the slippage users allow
          in a trade.
          <br />
          <br />
          CowSwap is the first DEX Aggregator offering some protection against it: COWs enable tight slippages and can
          even avoid settlement on AMMs altogether.
        </p>
      </Content>
    </Wrapper>
  )
}
