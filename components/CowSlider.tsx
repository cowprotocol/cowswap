import { useState } from 'react';
import styled from 'styled-components';
import { batches } from 'const/batches'
import { ExternalLink } from 'const/styles/global'
import { Color, Font, Media } from 'const/styles/variables'
import { transparentize } from 'polished'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  height: 100%;
  background: ${transparentize(0.90, Color.black)};
  backdrop-filter: blur(5rem);
  border: 0.1rem solid ${transparentize(0.9, Color.white)};
  backdrop-filter: blur(6rem);
  border-radius: 7rem;
  max-height: 64rem;
  padding: 4.8rem;
  font-size: ${Font.sizeDefault};
  color: ${Color.grey};
  position: relative;

  ${Media.mobile} {
    max-height: initial;
    border-radius: 2rem;
    padding: 3rem 2.4rem 5rem;
  }
`

export const CowTop = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row;

  ${Media.mobile} {
    flex-flow: column wrap;
  }

  > span {
    display: flex;
    flex-flow: column wrap;
    flex: 1 1 50%;

    ${Media.mobile} {
      gap: 1rem;
      align-content: center;
    }
  }

  > span > b {
    font-size: 1.8rem;
    line-height: 1;
    color: ${Color.white};
  }

  > span > span > ol {
    display: flex;
    list-style-type: none;
    flex-flow: row wrap;
    font-size: 1.3rem;
    padding: 0;
    gap: 2rem;

    ${Media.mobile} {
      justify-content: space-between;
    }
  }

  > span > span > ol > li {

  }

  > span > span > ol > li > i {
    color: ${Color.orange};
    font-style: normal;
  }

  > span > a {
    font-size: 1.4rem;

    ${Media.mobile} {
      text-align: center;
    }
  }
`

export const CowTabs = styled.div`
  flex: 1 1 50%;
  display: flex;
  font-size: 1.4rem;
  align-items: center;
  justify-content: center;
  border: 0.1rem solid ${Color.border};
  color: ${Color.grey};
  padding: 0;
  border-radius: 4rem;
  gap: 0;

  ${Media.mobile} {
    flex: 1 1 100%;
    border-radius: 2rem;
    order: -1;
    margin: 0 0 3.2rem;
  }
`

export const CowTabItem = styled.div<{ active?: boolean, position?: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.6rem;
  cursor: pointer;
  border-radius: 4rem;
  background: ${({ active }) => active ? transparentize(0.8, Color.orange) : 'transparent'};
  color: ${({ active }) => active ? Color.orange : 'inherit'};
  order: ${({ position }) => position ? position : '0'};
  line-height: 1;
  transition: background 0.2 ease-in-out, color 0.2 ease-in-out;
  border: 0.5rem solid transparent;
  flex: 1 1 auto;

  ${Media.mobile} {
    text-align: center;
    line-height: 1.2;
    padding: 1.2rem;
    border-radius: 2rem;
  }
`

export const CowSliderDescription = styled.div`
  width: 100%;
  display: block;
  line-height: 1.2;
  font-size: 1.3rem;
  margin: 2.4rem 0 1.2rem;

  > a {
    display: inline;
  }
`

export const CowVisual = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column wrap;

  > img {
    width: 100%;
    object-fit: contain;
    height: auto;
    padding: 2.4rem 0;
  }
`

export const CowBarWrapper = styled.div`
  display: flex;
  width: 100%;
  gap: 0.7rem;

  ${Media.mobile} {
    flex-flow: column wrap;
    gap: 4rem;
  }
`

interface TCowBar {
  position?: number,
  percent?: number,
  network: {
    label: string,
    color: string
  }
}

export const CowBar = styled.div<TCowBar>`
  display: flex;
  width: ${({ percent }) => percent ? `${percent}%` : '0%'};
  height: 0.5rem;
  order: ${({ position }) => position ? position : '0'};
  background: ${({ network }) => network.color};
  transition: background 0.5s ease-in-out, width 0.5s ease-in-out;
  
  &::after {
    content: attr(data-label);
    display: block;
    margin: 1.5rem 0 0;
    font-size: 1.3rem;
    white-space: pre;

    ${Media.mobile} {
      content: attr(data-label) " (${({ percent }) => percent}%)";
    }
  }
`

function getNetworkConfig(networkID) {
  switch (networkID) {
    case 'UNIV3':
      return { label: 'Uniswap V3', color: "#FF008A" }
      break;
    case 'UNIV2':
      return { label: 'Uniswap V2', color: "#FF008A" }
      break;
    case '0X':
      return { label: '0x', color: "#4DAA98" }
      break;
    case 'PSP':
      return { label: 'Paraswap', color: "blue" }
      break;
    case 'BAL':
      return { label: 'Balancer', color: "#772CF5" }
      break;
    case 'COW':
      return { label: 'CoW Protocol (P2P)', color: Color.orange }
      break;
    default:
      return { label: 'Unkown network', color: Color.grey }
  }
}

export default function CowSlider() {
  const [activeBatch, setActiveBatch] = useState(1);
  const activeBatchData = batches.length > 0 && Array(batches.find(b => b.id === activeBatch))

  return (
    <Wrapper>
      <CowTop>
        <span>
          <b>Batch Settlement Example</b>
          {activeBatchData.map(({ orders, gasPerOrder, batchURL }, index) =>
            <span key={index}>
              <ol >
                <li>Orders: <i>{orders}</i></li>
                <li>Gas per order: <i>~${gasPerOrder}</i></li>
              </ol>
              <ExternalLink href={batchURL} target="_blank" rel="noopener nofollow">View on Etherscan</ExternalLink>
            </span>
          )
          }
        </span>

        {
          batches.length > 0 && <CowTabs>
            {batches.map((item) =>
              <CowTabItem
                key={item.id || 0}
                position={item.id || 0}
                active={item.id === activeBatch || false}
                onClick={() => { setActiveBatch(item.id) }}
              >
                {item.label}
              </CowTabItem>
            )}
          </CowTabs>
        }
      </CowTop>

      {activeBatchData.map(({ description }, index) =>
        <CowSliderDescription key={index}>{description}</CowSliderDescription>
      )
      }

      <CowVisual>
        <img src="images/cow-graph-partialCow.png" alt="Partial CoW" />
      </CowVisual>

      {
        batches.length > 0 && <CowBarWrapper>
          {Array(batches.find(b => b.id === activeBatch)).map(batch => {
            return (batch.bars).map(({ id, network, percent }) => {
              return network && <CowBar
                key={id || 0}
                position={id}
                percent={percent}
                network={getNetworkConfig(network)}
                data-label={getNetworkConfig(network).label}
              />
            })
          })}
        </CowBarWrapper>
      }

    </Wrapper >
  )
}