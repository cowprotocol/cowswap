import React, { useState, useEffect, useRef } from 'react'
import { Hook, Unhook, Console, Message, Decode } from 'console-feed'
import styled from 'styled-components'
import { isMobile } from 'web3modal'

const ConsoleWrapper = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  background-color: #242424;
  max-height: 100%;
  width: 100%;
  overflow: auto;
  z-index: 9999;
`

const ButtonGroup = styled.div`
  position: fixed;
  bottom: 1.2rem;
  right: 1.2rem;
  padding: 0;
  pointer-events: none;

  > button {
    pointer-events: initial;
    padding: 1.6rem;
    box-sizing: border-box;
    border-radius: 6rem;
    background: #dde4ed;
    color: rgba(78, 106, 133, 0.75);
    outline: 0;
  }

  > button:hover {
    background: #208dff;
    color: var(--color-background-pageWrapper);
  }
`

const InputGroup = styled.div`
  position: sticky;
  bottom: 0.4rem;
  margin: 0;
  margin-top: 0.5rem;
  display: flex;

  input:focus {
    border: inherit;
  }

  input {
    margin: 0;
    border-radius: 0;
  }

  button {
    margin: 0;
    border: none;
    border-radius: 0;
  }
`

const ConsoleFrame: React.FC = () => {
  const [logs, setLogs] = useState<Message[]>([])
  const [showConsole, setShowConsole] = useState(false)

  const wrapper = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const hookedConsole = Hook(window.console, (log: Message) => setLogs((logs) => logs.concat(Decode(log))))

    return (): void => {
      Unhook(hookedConsole)
    }
  }, [])

  const processCommand = (command?: string): void => {
    if (!command) return

    if (command.includes('await ')) {
      eval(`
        (async function() {
          return ${command}
        })()
      `).then(console.log, console.error)
    } else {
      try {
        console.log(eval(command))
      } catch (error) {
        console.error(error)
      }
    }

    if (input.current) input.current.value = ''
    setTimeout(() => {
      if (wrapper.current) wrapper.current.scrollTop = wrapper.current.scrollHeight
    }, 0)
  }

  const handleCommand = async (e: React.KeyboardEvent<HTMLInputElement>): Promise<void> => {
    const command = e.currentTarget.value
    if (e.key === 'Enter' && command) {
      processCommand(command)
    }
  }

  const handleClick = (): void => {
    if (input.current && input.current.value) {
      processCommand(input.current.value)
    }
  }

  return (
    <ConsoleWrapper ref={wrapper}>
      {showConsole && (
        <>
          <Console logs={logs} variant="dark" />
          <InputGroup>
            <input type="text" onKeyPress={handleCommand} ref={input} />
            <button type="button" onClick={handleClick}>
              {'>>'}
            </button>
          </InputGroup>
        </>
      )}
      <ButtonGroup>
        {showConsole && logs.length > 0 && (
          <button type="button" onClick={(): void => setLogs([])}>
            clear
          </button>
        )}
        <button type="button" onClick={(): void => setShowConsole((on) => !on)}>
          {showConsole ? 'x' : 'console'}
        </button>
      </ButtonGroup>
    </ConsoleWrapper>
  )
}

const MobileConsole: React.FC = () => {
  if (!isMobile()) return null

  return <ConsoleFrame />
}

export default MobileConsole
