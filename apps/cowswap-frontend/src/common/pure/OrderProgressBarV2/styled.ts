import styled, { keyframes } from 'styled-components/macro'
import { UI } from '@cowprotocol/ui'

export const Icon = styled.div<{ status: string }>`
  --width: 28px;
  width: var(--width);
  height: auto;
  min-width: var(--width);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  color: white;
  font-weight: bold;
  font-size: 24px;

  > svg {
    color: ${(props) => (props.status === 'done' ? '#4CAF50' : props.status === 'active' ? '#2196F3' : '#666')};
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

export const slideUp = keyframes`
  from {
    transform: translateY(10px);
  }
  to {
    transform: translateY(0);
  }
`

export const slideDown = keyframes`
  from {
    transform: translateY(-10px);
  }
  to {
    transform: translateY(0);
  }
`

export const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
`

export const StepsWrapper = styled.div`
  overflow: hidden;
  display: flex;
  flex-flow: column wrap;
  padding: 20px 40px;

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`

export const Step = styled.div<{ status: string; isFirst: boolean }>`
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  opacity: ${(props) =>
    props.status === 'active' ? 1 : props.status === 'next' ? 0.3 : props.status === 'future' ? 0.08 : 0.08};
  transform: translateY(
    ${(props) => (props.status === 'done' ? '-10px' : props.status === 'active' && props.isFirst ? '10px' : '0')}
  );
  transition: all 0.3s ease;
  animation: ${(props) => (props.status === 'done' ? slideUp : props.status === 'active' ? slideDown : 'none')} 0.3s
    ease;
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
`

export const Title = styled.h3`
  margin: 0;
  font-size: 21px;
`

export const Description = styled.p`
  margin: 5px 0 0;
  font-size: 14px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const LearnMore = styled.a`
  color: #2196f3;
  text-decoration: none;
  font-size: 14px;
  margin-top: 5px;
`

export const ProgressImageWrapper = styled.div`
  width: 100%;
  height: 246px;
  max-height: 246px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column wrap;
  border-radius: 21px;
  overflow: hidden;

  > img,
  > svg {
    --size: 100%;
    max-width: var(--size);
    max-height: var(--size);
    height: var(--size);
    width: var(--size);
    object-fit: contain;
    padding: 0;
    margin: 0;
  }
`

export const DebugPanel = styled.div`
  position: fixed;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 1000;
`

export const LoadingEllipsis = styled.span`
  &::after {
    content: '...';
    animation: ellipsis 1s infinite;
  }

  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`

export const ProgressTopSection = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  border-radius: 21px;
  background: var(${UI.COLOR_PAPER_DARKER});
`

export const OriginalOrderIntent = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  padding: 10px;
  width: 100%;
  text-align: center;
  gap: 5px;
`

export const OrderTokenImage = styled.img`
  --size: 20px;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  background: var(${UI.COLOR_PAPER_DARKEST});
`
