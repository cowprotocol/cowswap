import { useCallback, useContext, useState } from 'react'

import { CowHook, HookDappInternal, HookDappType } from '@cowprotocol/types'
import { ButtonPrimary, Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { UI } from '@cowprotocol/ui'
import { HookDappContext } from '../../context'

import ICON_ARROW_DOWN from '@cowprotocol/assets/images/carret-down.svg'
import SVG from 'react-inlinesvg'

const NAME = 'Airdrop'
const DESCRIPTION = 'Claim an aidrop before swapping!'
const IMAGE_URL = "https://static.vecteezy.com/system/resources/previews/017/317/302/original/an-icon-of-medical-airdrop-editable-and-easy-to-use-vector.jpg"



export const PRE_AIRDROP: HookDappInternal = {
    name: NAME,
    description: DESCRIPTION,
    type: HookDappType.INTERNAL,
    path: '/hooks-dapps/pre/build',
    image: IMAGE_URL,
    component: <AirdropHookApp />,
    version: '0.1.0',
  }

  const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width:90%;

  flex-grow: 1;
`

const Link = styled.button`
  border: none;
  padding: 0;
  text-decoration: underline;
  display: text;
  cursor: pointer;
  background: none;
  color: white;
  margin: 10px 0;
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0.5em;
  gap:10px;

  p {
    padding: 0 1em;
  }
`

const ContentWrapper = styled.div`
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  flex-flow: column wrap;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 1em;
  text-align: center;
`

const Input = styled.input`
  border: 1px solid var(${UI.COLOR_BORDER});
  background: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  width: 100%;
  margin: 10px 0;
  margin-top: 0;
  padding: 10px;
  border-radius: 12px;
  outline: none;
  font-size: 15px;
  font-weight: bold;

  &:focus {
    border: 1px solid var(${UI.COLOR_PRIMARY});
  }
`

const Row = styled.div`
  display: flex;
  flex-flow: row wrap;
  margin: 10px;
  width: 100%;

  label {
    margin: 10px;
    flex-grow: 0;
    width: 5em;
  }

  input,
  textarea {
    flex-grow: 1;
  }

  /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
    }
`

const Dropdown = styled.div`
  position: relative;
  display: inline-block;
  width:100%;
`

const DropdownContent = styled.div`
  display: block;
  background-color: var(${UI.COLOR_PAPER});
  min-width: 80%;
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
  padding: 12px 16px;
  bottom: 100%;
  right: 0;
  height: min-content;
  z-index: 999;
  width: 100%;
  border-radius: 16px;
  margin: auto auto 12px;

  ${Media.upToLarge()} {
    left: 0;
    right: initial;
  }

  ${Media.upToMedium()} {
    width: 100%;
    position: fixed;
    bottom: 56px;
    margin: 0;
    padding: 18px 24px;
    box-shadow: 0 -100vh 0 100vh rgb(0 0 0 / 40%);
    border-bottom: 1px solid var(${UI.COLOR_BORDER});
    border-radius: 16px 16px 0 0;
  }
`

const DropdownButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-radius: 12px;
  background-color: var(${UI.COLOR_PAPER_DARKER});
  padding:12px;
  width:100%;

  &:hover {
    background-color: var(${UI.COLOR_PRIMARY_LIGHTER});
    color:#000000;
    /* > svg {
      transform: rotate(-90deg);
    } */
  }

  > svg {
    --size: 12px;
    color: inherit;
    width: var(--size);
    height: var(--size);
    transition: transform 0.2s ease-in-out;
  }
`

const SelectButton = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    border-radius: 16px;
    background-color: #18193B;
    padding:1rem;
    width:100%;

    &:hover {
    background-color: #65D9FF;
    color:#000000;
    }

`

const airdrops = [
    {
        name:"COW",
    },
    {
        name:"OTHER"
    },
]

export function AirdropHookApp() {
  const hookDappContext = useContext(HookDappContext)
  const [hook, setHook] = useState<CowHook>({
    target: 'test',
    callData: 'test',
    gasLimit: 'test',
  })
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedAirdrop, setSelectedAirdrop] = useState({})
  const [dropDownText, setDropDownText] = useState("Select your airdrop")
  

  const clickOnAddHook = useCallback(() => {
    const { callData, gasLimit, target } = hook
    if (!hookDappContext || !callData || !gasLimit || !target) {
      return
    }

    hookDappContext.addHook(
      {
        hook: hook,
        dapp: PRE_AIRDROP,
        outputTokens: undefined, // TODO: Simulate and extract the output tokens
      },
      true
    )
  }, [hook, hookDappContext])

  function handleSelectAirdrop(airdrop:any) {
    setSelectedAirdrop(airdrop)
    setDropDownText(airdrop.name)
    setShowDropdown(false)
  }

  function DropDownMenu() {

    return (
        <Dropdown>
        <DropdownButton onClick={() => setShowDropdown(!showDropdown)}>
        {dropDownText}<SVG src={ICON_ARROW_DOWN} />
        </DropdownButton>
        {showDropdown && (
        <DropdownContent>
            {airdrops.map((airdrop) => {
                return (
                    <SelectButton
                    onClick={() => handleSelectAirdrop(airdrop)}
                    >
                        {airdrop.name}
                    </SelectButton>
                )
            })}
        </DropdownContent>
        )}
        </Dropdown>
    )
}

  if (!hookDappContext) {
    return 'Loading...'
  }

  return (
    <Wrapper>
      <Header>
        <img src={IMAGE_URL} alt={NAME} width="120" />
        <p>{DESCRIPTION}</p>
      </Header>
      <ContentWrapper>
        <Row>
            <DropDownMenu />
        </Row>
        {/* <Row>
          <Input
            name="gasLimit"
            type="number"
            placeholder='Gas Limit'
            value={hook.gasLimit}
            onChange={(e) => setHook((hook) => ({ ...hook, gasLimit: e.target.value }))}
          />
        </Row> */}
      </ContentWrapper>
      <ButtonPrimary onClick={clickOnAddHook}>+Add Pre-hook</ButtonPrimary>
      <Link
        onClick={(e) => {
          e.preventDefault()
          hookDappContext.close()
        }}
      >
        Close
      </Link>
    </Wrapper>
  )
}