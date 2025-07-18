import * as React from "react"
import { Loader2 } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const spinnerVariants = cva(
  "animate-spin",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        default: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

interface LoadingSpinnerProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof spinnerVariants> {
  text?: string
}

function LoadingSpinner({ 
  className, 
  size, 
  text,
  ...props 
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn("flex items-center justify-center gap-2", className)}
      {...props}
    >
      <Loader2 className={cn(spinnerVariants({ size }))} />
      {text && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  )
}

export { LoadingSpinner, spinnerVariants }