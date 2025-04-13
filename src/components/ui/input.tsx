
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    // Special handling for numeric inputs to prevent NaN display
    const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === 'number' && props.onChange) {
        // Ensure empty inputs don't result in NaN
        if (e.target.value === '') {
          e.target.value = '0';
        }
        props.onChange(e);
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        onChange={type === 'number' ? changeHandler : props.onChange}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
