import { useCallback, useEffect, useRef, useState } from 'react'
import styled, { css } from 'styled-components/macro'
import { Check, ChevronDown } from 'react-feather'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { useActiveWeb3React } from '@src/hooks/web3'
import { ensNames } from './ens'
import { useAddress } from 'state/affiliate/hooks'
import { updateAddress } from 'state/affiliate/actions'
import { useAppDispatch } from 'state/hooks'

type AddressSelectorProps = {
  address: string
}

export default function AddressSelector(props: AddressSelectorProps) {
  const { address } = { address: '0x72ba1965320ab5352fd6d68235cc3c5306a6ffa2' } //props
  const dispatch = useAppDispatch()
  const selectedAddress = useAddress()
  const { chainId, library } = useActiveWeb3React()
  const [open, setOpen] = useState(false)
  const [primaryEnsName, setPrimaryEnsName] = useState<string>()
  const [items, setItems] = useState<string[]>([address])
  const toggle = useCallback(() => setOpen((open) => !open), [])
  const node = useRef<HTMLDivElement>(null)
  useOnClickOutside(node, open ? toggle : undefined)

  const handleSelectItem = useCallback((item: string) => {
    dispatch(updateAddress(item))
    toggle()
  }, [])

  const lookup = useCallback(async () => {
    const ensName = await library?.lookupAddress(address)
    setPrimaryEnsName(ensName)
    console.log({ ensName })
  }, [library, address])

  useEffect(() => {
    lookup()

    if (!chainId) {
      return
    }
    ensNames(chainId, address).then((response) => {
      if ('error' in response) {
        console.info(response.error)
        return
      }
      console.log(response.data)
      setItems([...response.data, address])
    })
  }, [address, chainId])

  useEffect(() => {
    if (selectedAddress) {
      return
    }

    if (primaryEnsName) {
      dispatch(updateAddress(primaryEnsName))
    }
  }, [selectedAddress, primaryEnsName])

  return (
    <Wrapper ref={node}>
      <AddressInfo onClick={toggle}>
        <span style={{ marginRight: '2px' }}>{selectedAddress}</span>
        <ChevronDown size={16} style={{ marginTop: '2px' }} strokeWidth={2.5} />
      </AddressInfo>
      {open && (
        <MenuFlyout>
          {items.map((item) => (
            <ButtonMenuItem key={item} $selected={item === ''} onClick={() => handleSelectItem(item)}>
              <GreenCheck size={16} strokeWidth={2.5} $visible={item === selectedAddress} /> {item}
            </ButtonMenuItem>
          ))}
        </MenuFlyout>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: relative;
  display: inline;
  margin-right: 0.4rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-self: end;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0 0.5rem 0 0;
    width: initial;
    text-overflow: ellipsis;
    flex-shrink: 1;
  `};
`

const MenuFlyout = styled.span`
  background-color: ${({ theme }) => theme.bg4};
  border: 1px solid ${({ theme }) => theme.bg0};

  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  padding: 0.3rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  left: 0;
  top: 1.75rem;
  z-index: 100;
  min-width: 350px;
  ${({ theme }) => theme.mediaWidth.upToMedium`;
    min-width: 145px
  `};

  > {
    padding: 12px;
  }
`
const MenuItem = css`
  align-items: center;
  background-color: transparent;
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  cursor: pointer;
  display: flex;
  flex: 1;
  flex-direction: row;
  font-size: 16px;
  font-weight: 400;
  justify-content: start;
  :hover {
    text-decoration: none;
  }
`

export const AddressInfo = styled.button`
  align-items: center;
  background-color: ${({ theme }) => theme.bg4};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.bg0};
  color: ${({ theme }) => theme.text1};
  display: inline-flex;
  flex-direction: row;
  font-weight: 700;
  font-size: 12px;
  height: 100%;
  margin: 0 0.4rem;
  padding: 0.2rem 0.4rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    border: 1px solid ${({ theme }) => theme.bg3};
  }
`
const ButtonMenuItem = styled.button<{ $selected?: boolean }>`
  ${MenuItem}
  cursor: ${({ $selected }) => ($selected ? 'initial' : 'pointer')};
  border: none;
  box-shadow: none;
  color: ${({ theme, $selected }) => ($selected ? theme.text2 : theme.text1)};
  background-color: ${({ theme, $selected }) => $selected && theme.primary1};
  outline: none;
  font-weight: ${({ $selected }) => ($selected ? '700' : '500')};
  font-size: 12px;
  padding: 6px 10px 6px 5px;

  ${({ $selected }) => $selected && `margin: 3px 0;`}

  > ${AddressInfo} {
    margin: 0 auto 0 8px;
  }

  &:hover {
    color: ${({ theme, $selected }) => !$selected && theme.text1};
    background: ${({ theme, $selected }) => !$selected && theme.bg4};
  }

  transition: background 0.13s ease-in-out;
`

const GreenCheck = styled(Check)<{ $visible: boolean }>`
  margin-right: 5px;
  color: ${({ theme }) => theme.success};
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
`
