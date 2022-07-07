import Tooltip, { TooltipProps } from 'components/Tooltip/TooltipMod'

type PopupContentProps = { onChange?: () => void }
type FollowingTxPopupProps = Omit<TooltipProps, 'text'> & PopupContentProps

const PopupContent = ({ onChange }: PopupContentProps) => {
  return (
    <>
      <div>💡</div>
      <div>
        <p>Follow your pending transactions here!</p>
        <span>
          <label>
            <input type="checkbox" onChange={onChange} /> Don&apos;t show it again
          </label>
        </span>
      </div>
    </>
  )
}

export default function FollowPendingTxPopup({
  show,
  children,
  onChange,
  ...rest
}: FollowingTxPopupProps): JSX.Element {
  return (
    <Tooltip show={show} placement="bottom" text={<PopupContent onChange={onChange} />} {...rest}>
      {children}
    </Tooltip>
  )
}
