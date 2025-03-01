import { UI } from '@cowprotocol/ui'
import { ButtonPrimary } from '@cowprotocol/ui'

import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'


import { Routes } from 'common/constants/routes'




const FullScreenWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`

const HeroSection = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  text-align: center;
  padding: 0 20px;
  
  h1 {
    font-size: 4rem;
    margin-bottom: 20px;
    animation: fadeInDown 1s ease;
  }
  
  p {
    font-size: 1.5rem;
    max-width: 800px;
    animation: fadeIn 1.5s ease;
  }
`

const FeaturesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  padding: 60px 5%;
  animation: fadeInUp 1s ease;
`
const TopicList = styled.div`
display: grid;
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
gap: 3.2rem;
width: 100%;
max-width: 100%;
margin: 0 auto;
overflow-x: auto;
`

const TopicCard = styled.div`
display: column;
grid-template-columns: 1fr;
flex-flow: column-wrap;
align-items: flex-start;
text align: center;
-webkit-box-pack: start;
justify-content: flex-start;
background: var(${UI.COLOR_PRIMARY_DARKER});
padding: 32px;
border-radius: 2rem;
text-align: center;
font-size: 2.4rem;
font-weight: 700;
text-decoration: none;
border: 0.4rem solid transparent;
transition: border 0.2s ease-in-out;
gap: 5.6rem;
max-width: 100%;
height: initial;
grid-colomn: auto;
position: relative;
overflow: hidden;
*, ::before, ::after {
  box-sizing: inherit;
}

backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
`

const AboutSection = styled.div`
  margin: 0;
  padding: 5%;
  text-align: center;
  align-items: center;

  p {
    font-size: 2rem;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
    fadeInDown 2s ease;
  }
`

const FeatureCard = styled.div`
  padding: 30px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  text-align: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
`

const AnimatedButton = styled(ButtonPrimary)`
  margin-top: 30px;
  padding: 15px 40px;
  max-width: 40%;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
  }
`

const keyframes = {
  fadeInDown: `
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  fadeInUp: `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `
}

export function LandingPage(): JSX.Element {
  return (
    <FullScreenWrapper>
      <style>{Object.values(keyframes).join('\n')}</style>
      <HeroSection>
        <h1>Welcome to Chameleon Swap</h1>
        <p>Experience the next generation of decentralized trading with seamless swaps and advanced order types</p>
        <AnimatedButton as={Link} to={Routes.SWAPS}>
          Start Trading
        </AnimatedButton>
      </HeroSection>

      <AboutSection>
      <p>Chameleon shields users from front-running and sandwich attacks by outsourcing trade execution to "solvers," who compete to find the best prices across various liquidity sources, including other DEXs. Plus, it offers gasless trading: users sign transactions, and solvers cover the gas costs, which are then offset in the trade settlement.</p>
      </AboutSection>

      <TopicList>
        <TopicCard>
          <h4>Chameleon AMM</h4>
          <p>Trade with confidence, knowing your orders are executed with optimal routing and minimal slippage.</p>
        </TopicCard>
        <TopicCard>
          <h4>MEV Blocker</h4>
          <p>$208B+ volume protected from MEV, across 46M+ transactions 4.6K+ ETH rebated to users $26 USD value of median rebate View all metrics on</p>
          <Link to="https://cow.fi/mev-blocker"> DUNE ↗</Link>
        </TopicCard>
      </TopicList>

      <FeaturesContainer>
        <FeatureCard>
          <h3>Instant Swaps</h3>
          <p>Execute trades instantly with optimal routing and minimal slippage</p>
          <AnimatedButton as={Link} to={Routes.SWAPS}>
            Swap Now
          </AnimatedButton>
        </FeatureCard>

        <FeatureCard>
          <h3>Limit Orders</h3>
          <p>Trade at your desired price with automated execution</p>
          <AnimatedButton as={Link} to={Routes.LIMIT}>
            Set Orders
          </AnimatedButton>
        </FeatureCard>

        <FeatureCard>
          <h3>TWAP Trading</h3>
          <p>Split large trades over time for better average prices</p>
             <AnimatedButton as={Link} to={Routes.ADVANCED}>
            Try TWAP
            </AnimatedButton>
        </FeatureCard>

        <FeatureCard>
          <h3>Buy crypto </h3>
          <p>Seamlessly buy any crypto with your card</p>
             <AnimatedButton as={Link} to={Routes.BUY}>
            Buy crypto
            </AnimatedButton>
        </FeatureCard>

        
      </FeaturesContainer>
    </FullScreenWrapper>
  )
}