import * as React from "react"
import * as RadixPopover from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"

const Popover = RadixPopover.Root

const PopoverTrigger = RadixPopover.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof RadixPopover.Content>,
  React.ComponentPropsWithoutRef<typeof RadixPopover.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <RadixPopover.Portal>
    <RadixPopover.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border border-gray-200 bg-white p-4 shadow-md outline-none dark:border-gray-800 dark:bg-gray-900",
        className
      )}
      {...props}
    />
  </RadixPopover.Portal>
))
PopoverContent.displayName = RadixPopover.Content.displayName

export { Popover, PopoverTrigger, PopoverContent } 