import React from 'react'
import PropTypes from 'prop-types'

/**
 * Card component - Container with shadow and border
 */
const Card = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  hover = false,
  onClick,
  ...props
}) => {
  const baseClasses = `
    bg-white dark:bg-neutral-900
    border border-neutral-200 dark:border-neutral-800
    rounded-xl shadow-sm
    transition-all duration-200
  `

  const hoverClasses = hover
    ? 'hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer'
    : ''

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          {title && (
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="px-6 py-4">
        {children}
      </div>

      {footer && (
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  )
}

Card.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  footer: PropTypes.node,
  className: PropTypes.string,
  hover: PropTypes.bool,
  onClick: PropTypes.func,
}

export default Card
