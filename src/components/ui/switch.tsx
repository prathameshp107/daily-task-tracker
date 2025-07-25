import * as React from "react"
import * as RadixSwitch from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof RadixSwitch.Root>,
  React.ComponentPropsWithoutRef<typeof RadixSwitch.Root>
>(({ className, ...props }, ref) => (
  <RadixSwitch.Root
    ref={ref}
    className={cn(
      "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 data-[state=checked]:bg-blue-600 dark:bg-gray-700 dark:focus:ring-blue-400 dark:data-[state=checked]:bg-blue-500",
      className
    )}
    {...props}
  >
    <RadixSwitch.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-5 dark:bg-gray-100"
      )}
    />
  </RadixSwitch.Root>
))
Switch.displayName = "Switch"

export { Switch } 