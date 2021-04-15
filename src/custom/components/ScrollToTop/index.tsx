import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ArrowUpCircle } from 'react-feather'
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler'

interface WrapperProps {
  top?: string
  right?: string
  bottom?: string
  left?: string
  background?: string
}

const Wrapper = styled.div<WrapperProps>`
    position: fixed;
    ${({ theme, background = theme.primary1, top, right, bottom, left }) => ({
      background,
      top,
      right,
      bottom,
      left
    })}

    display: flex;
    flex-flow: row nowrap;
    justify-content: center; 
    align-items: center;

    font-size: larger;
    border-radius: ${({ theme }) => theme.buttonPrimary.borderRadius}

    padding: 0.2rem 0.4rem;

    cursor: pointer;
    opacity: 0.4;

    transition: opacity 0.4s ease-in-out;
    
    &:hover {
        opacity: 1;
    }

    > svg {
        margin: 0 0.4rem;
    }

`

const SHOW_SCROLL_TOP_THRESHOLD = 250

export default function ScrollToTop(props: { styleProps?: WrapperProps }) {
  const [isShown, setIsShown] = useState(() => window.scrollY >= SHOW_SCROLL_TOP_THRESHOLD)
  const [, debouncedSetPosition] = useDebouncedChangeHandler(isShown, setIsShown, 500)

  const handleClick = () => window.scrollTo(0, 0)

  useEffect(() => {
    const scrollListener = () => debouncedSetPosition(window.scrollY >= SHOW_SCROLL_TOP_THRESHOLD)

    // make eventListener passive as to not block main thread (thanks @velenir)
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#improving_scrolling_performance_with_passive_listeners
    window.addEventListener('scroll', scrollListener, { passive: true })

    return () => window.removeEventListener('scroll', scrollListener)
  }, [debouncedSetPosition])

  if (!isShown) return null

  return (
    <Wrapper {...props.styleProps} onClick={handleClick}>
      Scroll to top <ArrowUpCircle size="1.6rem" />
    </Wrapper>
  )
}
