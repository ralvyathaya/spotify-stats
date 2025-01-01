// Import React for component creation
import * as React from "react"
// Import Slot for flexible rendering from Radix UI
import { Slot } from "@radix-ui/react-slot"
// Import cva for class variance and type VariantProps for TypeScript support
import { cva, type VariantProps } from "class-variance-authority"
// Import a custom utility for class name concatenation
import { cn } from "../../lib/utils"

// Define button styles using class variance authority
const buttonVariants = cva(
  // Base styles for all buttons
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      // Different visual styles for buttons
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      // Different sizes for buttons
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    // Default style and size if not specified
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Define the props interface for the Button component
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// Define the Button component using forwardRef for better ref handling
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Choose what to render based on `asChild`
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        // Apply all class names using the cn utility
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
// Set the display name for debugging and React DevTools
Button.displayName = "Button"

// Export Button component and buttonVariants for use in other parts of the application
export { Button, buttonVariants }