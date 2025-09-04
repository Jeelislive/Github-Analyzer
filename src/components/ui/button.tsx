import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-105 hover:shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-[#6F5AE8] text-white hover:bg-[#5B4BC4] hover:shadow-[#6F5AE8]/25 font-medium",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-destructive/25",
        outline:
          "border border-input bg-background hover:bg-[#6F5AE8]/10 hover:text-[#6F5AE8] hover:border-[#6F5AE8]/40 hover:shadow-[#6F5AE8]/10",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-secondary/25",
        ghost: "hover:bg-[#6F5AE8]/10 hover:text-[#6F5AE8] hover:shadow-md",
        link: "text-primary underline-offset-4 hover:underline hover:scale-105",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }