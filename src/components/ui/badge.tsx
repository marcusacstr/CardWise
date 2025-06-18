import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className = "", variant = "default", children, ...props }: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors"
  
  const variantClasses = {
    default: "bg-green-600 text-white",
    secondary: "bg-gray-100 text-gray-800",
    destructive: "bg-red-600 text-white",
    outline: "border border-gray-300 text-gray-700"
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}

export { Badge } 