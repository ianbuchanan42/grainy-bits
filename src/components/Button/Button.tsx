import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.scss'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button = ({ children, onClick, variant = 'primary', ...props }: ButtonProps) => {
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

