import { cn } from '~lib/utils'
import * as React from 'react'

type TypographyProps = {
  variant?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'p'
    | 'strong'
    | 'small'
    | 'small-semi'
    | 'text-lg'
    | 'text-lg-semi'
} & React.HTMLAttributes<HTMLElement>

const HTMLTagMap = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  p: 'p',
  strong: 'strong',
  small: 'span', // Note: 'small' is a valid HTML element, but might not suit your design system if custom styling is expected
  'small-semi': 'span', // Assuming 'small-semi' should be rendered in a 'span'
  'text-lg': 'span', // Assuming 'text-lg' should be rendered in a 'span'; adjust as needed
  'text-lg-semi': 'span', // Assuming 'text-lg' should be rendered in a 'span'; adjust as needed
}

const TEXT_STYLES = {
  h1: 'scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl',
  h2: 'scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0',
  h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
  h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
  p: 'leading-none',
  small: 'text-sm leading-none',
  'small-semi': 'text-sm font-medium leading-none',
  'text-lg': 'text-lg',
  'text-lg-semi': 'text-lg font-semibold',
  strong: 'font-semibold',
}

export const Typography = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  function Typography({ variant = 'p', className, ...props }, ref) {
    const Component = HTMLTagMap[variant]
    const variantClasses = TEXT_STYLES[variant] || ''
    return (
      <Component
        // @ts-ignore
        ref={ref}
        className={cn('text-foreground/70', variantClasses, className)}
        {...props}
      />
    )
  },
)
