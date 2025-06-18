import * as React from "react"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

function Card({ className = "", children, ...props }: CardProps) {
  const classes = `rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm ${className}`
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

function CardHeader({ className = "", children, ...props }: CardHeaderProps) {
  const classes = `flex flex-col space-y-1.5 p-6 ${className}`
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

function CardTitle({ className = "", children, ...props }: CardTitleProps) {
  const classes = `text-2xl font-semibold leading-none tracking-tight ${className}`
  
  return (
    <h3 className={classes} {...props}>
      {children}
    </h3>
  )
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

function CardDescription({ className = "", children, ...props }: CardDescriptionProps) {
  const classes = `text-sm text-gray-500 ${className}`
  
  return (
    <p className={classes} {...props}>
      {children}
    </p>
  )
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function CardContent({ className = "", children, ...props }: CardContentProps) {
  const classes = `p-6 pt-0 ${className}`
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

function CardFooter({ className = "", children, ...props }: CardFooterProps) {
  const classes = `flex items-center p-6 pt-0 ${className}`
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } 