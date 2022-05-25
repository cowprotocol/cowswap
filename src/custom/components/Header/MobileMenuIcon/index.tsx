import styled, { css } from 'styled-components/macro'
import { useState } from 'react'

const Wrapper = styled.div<{ isOpen: boolean }>`
  display: flex;
  cursor: pointer;
  height: 50px;
  margin: 0 auto;
  position: relative;
  width: 60px;


  span {
    background-color: ${({ theme }) => theme.text1};
    border-radius: 3px;
    height: 6px;
    position: absolute;
    transition-duration: 150ms;
    transition: cubic-bezier(0.8, 0.5, 0.2, 1.4);
    width: 100%;
  }

  span:nth-child(1) {
    left: 0px;
    top: 0px;
    transition-duration: 150ms;
  }

  span:nth-child(2) {
    left: 0px;
    opacity: 1;
    top: 21px;
  }

  span:nth-child(3) {
    bottom: 0px;
    left: 0px;
    transition-duration: 150ms;
  }


  ${({ isOpen }) =>
    isOpen &&
    css`
      span:nth-child(1) {
        top: 21px;
        transform: rotate(45deg);
        transition-duration: 150ms;
      }

      span:nth-child(2) {
        opacity: 0;
      }

      span:nth-child(3) {
        top: 21px;
        transform: rotate(-45deg);
        transition-duration: 150ms;
      }
    `};
  
}
`

export default function MobileMenuIcon() {
  const [isOpen, setIsOpen] = useState(false)
  const handleOnClick = () => setIsOpen(!isOpen)

  return (
    <Wrapper onClick={handleOnClick} isOpen={isOpen}>
      <span></span>
      <span></span>
      <span></span>
    </Wrapper>
  )
}
