import styles from './Alert.module.scss'
import cn from 'classnames'

export default function Alert({ children, type }) {
  return (
    <div
      className={cn({
        [styles.success]: type === 'success',
        [styles.error]: type === 'error',
        warning: type === 'warning'
      })}
    >
      {children}
      <style jsx>{`
        border: 1px solid; 
        padding: 0.8em;
        margin: 0.8em;

        .success {
          color: green;
        }
        .error {
          color: red;
        }

        .warning {
          color: #ff8800
        }
      `}</style>
    </div>
  )
}