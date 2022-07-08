import Tooltip, { TooltipProps } from 'components/Tooltip/TooltipMod'

type PopupContentProps = { onCheckout: () => void }
type FollowingTxPopupProps = Omit<TooltipProps, 'text'> & PopupContentProps

const PopupContent = ({ onCheckout }: PopupContentProps) => {
  const _onCheckout = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation()
    onCheckout()
  }

  return (
    <>
      <div>💡</div>
      <div>
        <p>Follow your pending transactions here!</p>
        <span>
          <label>
            <input type="checkbox" onChange={_onCheckout} /> Don&apos;t show it again
          </label>
        </span>
      </div>
    </>
  )
}

export default function FollowPendingTxPopup({
  show,
  children,
  onCheckout,
  ...rest
}: FollowingTxPopupProps): JSX.Element {
  return (
    <Tooltip show={show} placement="bottom" text={<PopupContent onCheckout={onCheckout} />} {...rest}>
      {children}
    </Tooltip>
  )
}
