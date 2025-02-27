import * as React from 'react';

import { cn } from 'src/utils/common.util';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  prefixIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  suffixIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, prefixIcon, suffixIcon, ...props }, ref) => {
    const PrefixIcon = prefixIcon;
    const SuffixIcon = suffixIcon;

    return (
      <div className="relative flex w-full items-center">
        {prefixIcon && (
          <button
            className="absolute left-3 text-center transition-all disabled:pointer-events-none disabled:opacity-50"
            type="button"
          >
            {PrefixIcon && (
              <PrefixIcon className="size-4 text-muted-foreground" />
            )}
          </button>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            prefixIcon && 'pl-9',
            suffixIcon && 'pr-9',
            className
          )}
          ref={ref}
          {...props}
        />
        {suffixIcon && (
          <button
            className="absolute right-3 text-center transition-all disabled:pointer-events-none disabled:opacity-50"
            type="button"
          >
            {SuffixIcon && (
              <SuffixIcon className="size-4 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
