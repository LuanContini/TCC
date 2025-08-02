import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  variant?: 'primary' | 'secondary'
}

export function Button({ label, variant = 'primary', ...props }: ButtonProps) {
  const baseClasses =
    'px-4 py-2 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition'

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
  }

  const classes = `${baseClasses} ${variantClasses[variant]}`

  return (
    <button className={classes} {...props}>
      {label}
    </button>
  )
}
