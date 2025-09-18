import styles from './Button.module.css'

const Button = ({ children, onClick, variant = 'primary', ...props }) => {
  const variantClass = styles[variant] || styles.primary
  
  return (
    <button 
      className={`${styles.button} ${variantClass}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
