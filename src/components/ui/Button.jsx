import React from 'react'
import PropTypes from 'prop-types'

/**
 * Button component - Professional button with variants, sizes, and loading state
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 font-medium
    rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const variantClasses = {
    primary: `
      bg-primary-600 hover:bg-primary-700 active:bg-primary-800
      text-white shadow-sm hover:shadow
      focus:ring-primary-500
    `,
    secondary: `
      bg-secondary-600 hover:bg-secondary-700 active:bg-secondary-800
      text-white shadow-sm hover:shadow
      focus:ring-secondary-500
    `,
    ghost: `
      bg-transparent hover:bg-neutral-100 active:bg-neutral-200
      dark:hover:bg-neutral-800 dark:active:bg-neutral-700
      text-neutral-700 dark:text-neutral-300
      focus:ring-neutral-500
    `,
    danger: `
      bg-red-600 hover:bg-red-700 active:bg-red-800
      text-white shadow-sm hover:shadow
      focus:ring-red-500
    `,
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
}

export default Button
