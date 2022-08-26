import { useAtom } from 'jotai'
import ethFlowIcon from 'assets/svg/ethFlow.svg'
import styled from 'styled-components/macro'
import { userNativeEthFlow } from 'state/ethFlow/atoms'
import TogglerComp from 'components/Toggle'

const BannerWrapper = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(3, auto);
  align-items: center;
  justify-content: stretch;

  background-color: ${({ theme }) => theme.bg7};

  border: 1px solid ghostwhite;
  border-radius: ${({ theme }) => theme.buttonOutlined.borderRadius};

  padding: 10px;
  margin-bottom: 8px;

  > * {
    margin: auto;
  }
`

export default function Toggle({ wrappedSymbol }: { wrappedSymbol: string }) {
  const [isNativeEthFlow, setIsUserEthFlow] = useAtom(userNativeEthFlow)

  return (
    <BannerWrapper>
      <img alt="eth-flow-icon" src={ethFlowIcon} />
      <h4>
        {isNativeEthFlow
          ? `Enable the classic ${wrappedSymbol} experience`
          : `Classic ${wrappedSymbol} experience enabled!`}
      </h4>
      <TogglerComp isActive={!isNativeEthFlow} toggle={() => setIsUserEthFlow((prevState) => !prevState)} />
    </BannerWrapper>
  )
}
